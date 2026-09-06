FROM php:8.3-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libpng-dev libonig-dev python3 ca-certificates \
    && docker-php-ext-install mysqli gd mbstring \
    && rm -rf /var/lib/apt/lists/*
COPY upstream.lock.json /opt/jsg/upstream.lock.json
RUN python3 - <<'PY'
import hashlib, io, json, tarfile, urllib.request
from pathlib import Path
lock = json.loads(Path('/opt/jsg/upstream.lock.json').read_text())
archive = urllib.request.urlopen(lock['archive'], timeout=90).read()
assert hashlib.sha256(archive).hexdigest() == lock['sha256'], 'Upstream checksum mismatch'
root = Path('/opt/gnuboard'); root.mkdir()
with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
    for entry in tar:
        relative = Path(*Path(entry.name).parts[1:])
        if relative == Path('.'): continue
        assert not relative.is_absolute() and '..' not in relative.parts
        assert entry.isdir() or entry.isfile(), 'Unexpected archive entry'
        destination = root / relative
        if entry.isdir(): destination.mkdir(parents=True, exist_ok=True)
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(tar.extractfile(entry).read())
# Upstream documents this installation-time charset setting.
config = root / 'config.php'
config.write_text(config.read_text().replace("define('G5_DB_CHARSET', 'utf8');", "define('G5_DB_CHARSET', 'utf8mb4');"))
(root / 'data').mkdir(exist_ok=True)
PY
COPY runtime/ /opt/jsg/
COPY bridge.py /opt/jsg/bridge.py
COPY runtime/php.ini /usr/local/etc/php/conf.d/jsg.ini
WORKDIR /opt/gnuboard
CMD ["php", "-S", "0.0.0.0:8787", "-t", "/opt/gnuboard", "/opt/jsg/router.php"]
