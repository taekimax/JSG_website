#!/usr/bin/env python3
"""Local-only lifecycle. Credentials travel through stdin or private secret files."""
import argparse
import getpass
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['start', 'setup', 'stop', 'status', 'export'])
    args = parser.parse_args()
    state = Path(os.environ.get('JSG_NOTICE_STATE', str(Path.home() / '.local/share/jsg-notice-admin'))).expanduser().resolve()
    if state.is_relative_to(REPO):
        raise SystemExit('JSG_NOTICE_STATE must be outside the website repository.')
    if not shutil.which('docker'):
        raise SystemExit('Docker-compatible engine with Docker Compose v2 is required. No runtime has been installed by this command.')
    state.mkdir(parents=True, exist_ok=True, mode=0o700)
    (state / 'exports').mkdir(exist_ok=True, mode=0o700)
    for filename in ['db-password', 'db-root-password']:
        path = state / filename
        if not path.exists():
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            with os.fdopen(fd, 'w') as stream: stream.write(secrets.token_hex(32))
    env = dict(os.environ, JSG_NOTICE_STATE=str(state), JSG_NOTICE_SOURCE=str(REPO / 'assets/notices'))
    compose = ['docker', 'compose', '-f', str(HERE / 'compose.yaml')]
    def run(*commands, **kwargs):
        return subprocess.run(compose + list(commands), env=env, check=True, **kwargs)
    if args.command == 'start':
        run('up', '--build', '-d', '--wait')
        print('Local manager: http://127.0.0.1:8787/ — first run: python3 tools/notice-admin/manage.py setup')
    elif args.command == 'setup':
        password = getpass.getpass('Create local manager password (at least 12 characters): ')
        if len(password) < 12 or password != getpass.getpass('Repeat password: '):
            raise SystemExit('Passwords must match and contain at least 12 characters.')
        payload = json.dumps({'password': password}, ensure_ascii=False).encode()
        run('exec', '-T', 'app', 'php', '/opt/jsg/install.php', input=payload)
        run('exec', '-T', 'app', 'php', '/opt/jsg/bootstrap.php')
        print('Manager account: manager. Current notices imported. Open http://127.0.0.1:8787/')
    elif args.command == 'export':
        run('exec', '-T', 'app', 'php', '/opt/jsg/export.php')
        print('Staged exports:', state / 'exports')
    elif args.command == 'stop': run('stop')
    else: run('ps')

if __name__ == '__main__':
    try: main()
    except subprocess.CalledProcessError as error: sys.exit(error.returncode)
