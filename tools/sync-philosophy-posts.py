#!/usr/bin/env python3
"""Sync one publication's RSS titles into the static Philosophy post index."""

import argparse
from datetime import date
from email.utils import parsedate_to_datetime
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
import xml.etree.ElementTree as ET


DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "assets/philosophy/posts.json"
MAX_FEED_BYTES = 2 * 1024 * 1024
FETCH_TIMEOUT = 15


class SyncError(Exception):
    """An unsuccessful sync that must leave the saved index intact."""


def publication_url(value):
    if not isinstance(value, str) or not value.strip():
        raise SyncError("No publication configured. Use --publication-url https://NAME.substack.com after creating your publication.")
    try:
        parsed = urlsplit(value.strip())
        valid = (parsed.scheme == "https" and parsed.hostname and not parsed.username
                 and not parsed.password and parsed.port in (None, 443)
                 and parsed.path in ("", "/") and not parsed.query and not parsed.fragment
                 and re.fullmatch(r"[a-zA-Z0-9.-]+", parsed.hostname))
    except ValueError:
        valid = False
    if not valid:
        raise SyncError("Publication URL must be an HTTPS site root, for example https://NAME.substack.com.")
    return "https://" + parsed.hostname.lower()


def post_url(value, publication):
    if not isinstance(value, str):
        return None
    try:
        parsed = urlsplit(value.strip())
        if (parsed.scheme != "https" or parsed.hostname != urlsplit(publication).hostname
                or parsed.username or parsed.password or parsed.port not in (None, 443)
                or not re.fullmatch(r"/p/[A-Za-z0-9_-]+/?", parsed.path)):
            return None
    except ValueError:
        return None
    # Tracking parameters and fragments do not identify separate articles.
    return urlunsplit(("https", parsed.hostname, parsed.path.rstrip("/"), "", ""))


def valid_date(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


def load_index(path):
    if not path.exists():
        return {"schemaVersion": 1, "publicationUrl": "", "posts": []}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise SyncError(f"Cannot read existing index: {exc}") from exc
    if (not isinstance(data, dict) or type(data.get("schemaVersion")) is not int
            or data["schemaVersion"] != 1 or not isinstance(data.get("publicationUrl"), str)
            or not isinstance(data.get("posts"), list)):
        raise SyncError("Existing index must contain schemaVersion: 1, publicationUrl, and posts.")
    if data["publicationUrl"]:
        data["publicationUrl"] = publication_url(data["publicationUrl"])
    if data["posts"] and not data["publicationUrl"]:
        raise SyncError("Existing posts have no publicationUrl; resolve their source before syncing.")
    normalized = []
    for entry in data["posts"]:
        if not isinstance(entry, dict):
            raise SyncError("Existing index contains an invalid post; index was preserved.")
        title = entry.get("title")
        url = post_url(entry.get("url"), data["publicationUrl"])
        if not isinstance(title, str) or not title.strip() or not valid_date(entry.get("date")) or not url:
            raise SyncError("Existing index contains an invalid post; index was preserved.")
        normalized.append({"title": title.strip(), "date": entry["date"], "url": url})
    data["posts"] = normalized
    return data


class SamePublicationRedirect(HTTPRedirectHandler):
    def __init__(self, publication):
        super().__init__()
        self.publication = publication

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urlsplit(newurl)
        try:
            allowed = (parsed.scheme == "https" and parsed.hostname == urlsplit(self.publication).hostname
                       and not parsed.username and not parsed.password and parsed.port in (None, 443))
        except ValueError:
            allowed = False
        if not allowed:
            raise SyncError("RSS redirected outside the configured publication; index was preserved.")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch_feed(publication):
    request = Request(publication + "/feed", headers={"User-Agent": "JSG-Philosophy-RSS/1.0", "Accept": "application/rss+xml, application/xml, text/xml"})
    try:
        with build_opener(SamePublicationRedirect(publication)).open(request, timeout=FETCH_TIMEOUT) as response:
            payload = response.read(MAX_FEED_BYTES + 1)
    except (HTTPError, URLError, OSError, ValueError) as exc:
        raise SyncError(f"RSS fetch failed; index was preserved: {exc}") from exc
    if len(payload) > MAX_FEED_BYTES:
        raise SyncError("RSS exceeds the 2 MiB limit; index was preserved.")
    return payload


def parse_feed(payload, publication):
    if len(payload) > MAX_FEED_BYTES:
        raise SyncError("RSS exceeds the 2 MiB limit; index was preserved.")
    if b"<!DOCTYPE" in payload.upper() or b"<!ENTITY" in payload.upper():
        raise SyncError("RSS document declarations are unsupported; index was preserved.")
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as exc:
        raise SyncError("RSS is malformed; index was preserved.") from exc
    if root.tag != "rss" or root.find("channel") is None:
        raise SyncError("Expected an RSS channel; index was preserved.")
    posts = {}
    for item in root.findall("./channel/item"):
        title_node = item.find("title")
        title = "".join(title_node.itertext()).strip() if title_node is not None else ""
        url = post_url(item.findtext("link"), publication)
        try:
            published = parsedate_to_datetime(item.findtext("pubDate", ""))
            if published.tzinfo is None:
                continue
            published_date = published.date().isoformat()
        except (TypeError, ValueError, OverflowError):
            continue
        if not title or not url:
            continue
        # First valid occurrence wins when a feed repeats the same article.
        posts.setdefault(url, {"title": title, "date": published_date, "url": url})
    if not posts:
        raise SyncError("RSS contains no valid articles; index was preserved. Publish a public article before the first sync.")
    return list(posts.values())


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, prefix="." + path.name + ".", delete=False) as handle:
            temporary = Path(handle.name)
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def sync(output, requested_publication=None):
    output = Path(output)
    existing = load_index(output)
    publication = publication_url(requested_publication if requested_publication is not None else existing["publicationUrl"])
    if existing["posts"] and existing["publicationUrl"] != publication:
        raise SyncError("Cannot switch publication while existing posts remain. Explicitly archive or clear the old index before changing publicationUrl.")
    incoming = parse_feed(fetch_feed(publication), publication)
    merged = {post["url"]: post for post in existing["posts"]}
    merged.update({post["url"]: post for post in incoming})
    result = {"schemaVersion": 1, "publicationUrl": publication,
              "posts": sorted(merged.values(), key=lambda post: (-date.fromisoformat(post["date"]).toordinal(), post["url"]))}
    if result != existing or not output.exists():
        atomic_write(output, result)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--publication-url", help="HTTPS publication root; otherwise use publicationUrl from the index")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Index JSON to read and update (default: assets/philosophy/posts.json)")
    args = parser.parse_args(argv)
    try:
        result = sync(args.output, args.publication_url)
    except (SyncError, OSError) as exc:
        print(f"Philosophy sync failed: {exc}", file=sys.stderr)
        return 1
    print(f"Philosophy index ready: {len(result['posts'])} posts from {result['publicationUrl']} ({args.output})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
