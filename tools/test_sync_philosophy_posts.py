"""Local RSS fixtures; no account, credentials, or external network required."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError


SPEC = importlib.util.spec_from_file_location("sync_philosophy_posts", Path(__file__).with_name("sync-philosophy-posts.py"))
syncer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(syncer)
PUBLICATION = "https://jsg-example.substack.com"


def item(title="New article", slug="new-article", date="Mon, 07 Sep 2026 10:00:00 +0900", link=None):
    return f"<item><title><![CDATA[{title}]]></title><link>{link or PUBLICATION + '/p/' + slug}</link><pubDate>{date}</pubDate></item>"


def feed(*items):
    return ("<rss version='2.0'><channel>" + "".join(items) + "</channel></rss>").encode()


class PhilosophySyncTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.path = Path(self.temporary.name) / "posts.json"
        self.initial = {"schemaVersion": 1, "publicationUrl": PUBLICATION, "posts": [
            {"title": "Older article", "date": "2025-01-02", "url": PUBLICATION + "/p/older"},
            {"title": "Old title", "date": "2026-08-01", "url": PUBLICATION + "/p/new-article"},
        ]}
        self.path.write_text(json.dumps(self.initial), encoding="utf-8")

    def test_merge_updates_titles_dates_keeps_older_articles_and_deduplicates(self):
        payload = feed(item("Updated title", link=PUBLICATION + "/p/new-article/?utm_source=email#details"),
                       item("Duplicate title"), item("Second article", "second", "Sun, 06 Sep 2026 10:00:00 +0900"))
        with patch.object(syncer, "fetch_feed", return_value=payload):
            result = syncer.sync(self.path)
        self.assertEqual([post["title"] for post in result["posts"]], ["Updated title", "Second article", "Older article"])
        self.assertEqual(result["posts"][0]["date"], "2026-09-07")
        self.assertEqual(result["posts"][0]["url"], PUBLICATION + "/p/new-article")
        self.assertEqual(json.loads(self.path.read_text()), result)
        self.assertEqual(set(result), {"schemaVersion", "publicationUrl", "posts"})
        self.assertTrue(all(set(post) == {"title", "date", "url"} for post in result["posts"]))

    def test_markup_is_retained_as_title_text(self):
        title = '<img src=x onerror="alert(1)"> & 투자'
        with patch.object(syncer, "fetch_feed", return_value=feed(item(title))):
            result = syncer.sync(self.path)
        self.assertEqual(result["posts"][0]["title"], title)
        self.assertEqual(json.loads(self.path.read_text())["posts"][0]["title"], title)

    def test_invalid_dates_and_links_are_skipped(self):
        bad_links = ["https://other.substack.com/p/x", "javascript:alert(1)", "http://jsg-example.substack.com/p/x",
                     PUBLICATION + "/about", "https://user@jsg-example.substack.com/p/x", PUBLICATION + ":8443/p/x"]
        payload = feed(item(), *(item(link=link) for link in bad_links), item(date="bad"),
                       item(date="Tue, 31 Feb 2026 10:00:00 +0900"), item(date="Mon, 07 Sep 2026 10:00:00"), item(title=" "))
        self.assertEqual(len(syncer.parse_feed(payload, PUBLICATION)), 1)

    def test_malformed_empty_and_foreign_feed_preserve_previous_bytes(self):
        before = self.path.read_bytes()
        for payload in [b"broken xml", feed(), feed(item(link="https://other.substack.com/p/x")), b"<feed />",
                        b'<!DOCTYPE rss [<!ENTITY x "text">]><rss><channel /></rss>']:
            with self.subTest(payload=payload), patch.object(syncer, "fetch_feed", return_value=payload):
                with self.assertRaises(syncer.SyncError):
                    syncer.sync(self.path)
            self.assertEqual(self.path.read_bytes(), before)

    def test_network_failure_preserves_previous_bytes(self):
        before = self.path.read_bytes()
        with patch.object(syncer, "build_opener") as opener:
            opener.return_value.open.side_effect = URLError("fixture offline")
            with self.assertRaisesRegex(syncer.SyncError, "fetch failed"):
                syncer.sync(self.path)
        self.assertEqual(self.path.read_bytes(), before)

    def test_empty_config_and_host_switch_do_not_fetch_or_write(self):
        before = self.path.read_bytes()
        with patch.object(syncer, "fetch_feed") as fetch:
            with self.assertRaisesRegex(syncer.SyncError, "Cannot switch publication"):
                syncer.sync(self.path, "https://different.substack.com")
            self.assertEqual(self.path.read_bytes(), before)
            self.path.write_text('{"schemaVersion":1,"publicationUrl":"","posts":[]}')
            empty_before = self.path.read_bytes()
            with self.assertRaisesRegex(syncer.SyncError, "No publication configured"):
                syncer.sync(self.path)
            fetch.assert_not_called()
            self.assertEqual(self.path.read_bytes(), empty_before)

    def test_first_sync_requires_valid_article_and_supports_explicit_publication(self):
        self.path.unlink()
        with patch.object(syncer, "fetch_feed", return_value=feed()):
            with self.assertRaisesRegex(syncer.SyncError, "Publish a public article"):
                syncer.sync(self.path, PUBLICATION)
        self.assertFalse(self.path.exists())
        with patch.object(syncer, "fetch_feed", return_value=feed(item())):
            result = syncer.sync(self.path, PUBLICATION + "/")
        self.assertEqual(result["publicationUrl"], PUBLICATION)
        self.assertEqual(len(result["posts"]), 1)

    def test_fetch_size_bound_and_external_redirect_rejected(self):
        with patch.object(syncer, "build_opener") as opener:
            response = opener.return_value.open.return_value.__enter__.return_value
            response.read.return_value = b"x" * (syncer.MAX_FEED_BYTES + 1)
            with self.assertRaisesRegex(syncer.SyncError, "2 MiB"):
                syncer.fetch_feed(PUBLICATION)
            response.read.assert_called_once_with(syncer.MAX_FEED_BYTES + 1)
            self.assertEqual(opener.return_value.open.call_args.kwargs["timeout"], syncer.FETCH_TIMEOUT)
        with self.assertRaisesRegex(syncer.SyncError, "redirected outside"):
            syncer.SamePublicationRedirect(PUBLICATION).redirect_request(None, None, 302, "Found", {}, "https://other.substack.com/feed")

    def test_atomic_write_failure_keeps_existing_index(self):
        before = self.path.read_bytes()
        with patch.object(syncer, "fetch_feed", return_value=feed(item())), patch.object(syncer.os, "replace", side_effect=OSError("fixture write denied")):
            with self.assertRaises(OSError):
                syncer.sync(self.path)
        self.assertEqual(self.path.read_bytes(), before)
        self.assertEqual(list(self.path.parent.iterdir()), [self.path])


if __name__ == "__main__":
    unittest.main()
