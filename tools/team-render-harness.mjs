import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

export async function readRepoFile(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

export function extractMemberIdsFromLinks(html) {
  const ids = [];
  const hrefPattern = /href="team-member\.html\?id=([^"&]+)"/g;
  let match = hrefPattern.exec(html);
  while (match) {
    ids.push(decodeURIComponent(match[1]));
    match = hrefPattern.exec(html);
  }
  return ids;
}

export async function renderTeamApp({ manifest, search = '' }) {
  const source = await readRepoFile('scripts/team.js');
  const app = { innerHTML: '' };
  const listeners = new Map();
  const heroStyle = {};
  const heroSurface = {
    style: {
      setProperty(name, value) {
        heroStyle[name] = value;
      }
    }
  };
  const heroImg = { src: '' };

  const document = {
    addEventListener(eventName, callback) {
      listeners.set(eventName, callback);
    },
    getElementById(id) {
      return id === 'team-member-app' ? app : null;
    },
    querySelector(selector) {
      if (selector === '.page-hero .page-hero-surface') return heroSurface;
      if (selector === '.page-hero .page-hero-media img') return heroImg;
      return null;
    }
  };

  const window = {
    location: { search },
    __teamMembers: undefined
  };

  const context = vm.createContext({
    window,
    document,
    fetch: async () => ({
      async json() {
        return manifest;
      }
    }),
    console: { error() {} },
    URLSearchParams,
    encodeURIComponent,
    decodeURIComponent
  });

  vm.runInContext(source, context, { filename: 'scripts/team.js' });
  const onReady = listeners.get('DOMContentLoaded');
  assert.ok(onReady, 'DOMContentLoaded handler should be registered');
  await onReady();

  return {
    html: app.innerHTML,
    orderedMembers: window.__teamMembers,
    heroSrc: heroImg.src,
    heroStyle
  };
}
