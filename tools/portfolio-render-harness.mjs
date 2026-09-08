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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderNode(node) {
  if (!node) return '';
  if (typeof node === 'string') return escapeHtml(node);
  if (typeof node.outerHTML === 'string') return node.outerHTML;
  return '';
}

class FakeElement {
  constructor(tagName) {
    this.tagName = String(tagName || '').toLowerCase();
    this.className = '';
    this.textContent = '';
    this.innerHTML = '';
    this.attributes = new Map();
    this.children = [];
    this.href = '';
    this.src = '';
    this.alt = '';
    this.loading = '';
    this.decoding = '';
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  append(...children) {
    children.forEach((child) => this.appendChild(child));
  }

  setAttribute(name, value) {
    this.attributes.set(String(name), String(value));
  }

  get outerHTML() {
    const attrs = [];
    if (this.className) attrs.push(`class="${escapeHtml(this.className)}"`);
    if (this.href) attrs.push(`href="${escapeHtml(this.href)}"`);
    if (this.src) attrs.push(`src="${escapeHtml(this.src)}"`);
    if (this.alt) attrs.push(`alt="${escapeHtml(this.alt)}"`);
    if (this.loading) attrs.push(`loading="${escapeHtml(this.loading)}"`);
    if (this.decoding) attrs.push(`decoding="${escapeHtml(this.decoding)}"`);
    for (const [name, value] of this.attributes) {
      if (['class', 'href', 'src', 'alt', 'loading', 'decoding'].includes(name)) continue;
      attrs.push(`${escapeHtml(name)}="${escapeHtml(value)}"`);
    }

    const attrString = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
    const body = this.innerHTML
      ? this.innerHTML + this.children.map(renderNode).join('')
      : `${escapeHtml(this.textContent)}${this.children.map(renderNode).join('')}`;

    return `<${this.tagName}${attrString}>${body}</${this.tagName}>`;
  }
}

class FakeContainer {
  constructor() {
    this._innerHTML = '';
    this.children = [];
    this.attributes = new Map();
    this.style = { setProperty() {} };
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML + this.children.map(renderNode).join('');
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

export async function renderPortfolioApp({ manifest, descriptions = {}, search = '', namesOnly = false }) {
  const source = await readRepoFile('scripts/portfolio.js');
  const app = new FakeContainer();
  const listeners = new Map();
  const jsonRequests = [];
  const textRequests = [];
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
      return id === (namesOnly ? 'portfolio-name-list' : 'portfolio-app') ? app : null;
    },
    querySelector(selector) {
      if (selector === '.portfolio-grid') return app;
      if (selector === '.page-hero') {
        return {
          querySelector(innerSelector) {
            if (innerSelector === '.page-hero-surface') return heroSurface;
            if (innerSelector === '.page-hero-media img') return heroImg;
            return null;
          }
        };
      }
      return null;
    },
    createElement(tagName) {
      return new FakeElement(tagName);
    }
  };

  const window = {
    location: { search },
    JsgAssets: {
      async fetchJson(url) {
        jsonRequests.push(url);
        if (url === 'assets/shared/board-endpoints.json') return { portfolioManifest: '/board-content/portfolio-manifest.json' };
        return manifest;
      },
      async fetchText(url) {
        textRequests.push(url);
        const cleanUrl = String(url).split('?')[0];
        return descriptions[cleanUrl] ?? '';
      },
      setHeroImage(surface, image, heroImage, assetVersion) {
        const versioned = `${heroImage}?v=${encodeURIComponent(assetVersion)}`;
        if (image) image.src = versioned;
        if (surface) surface.style.setProperty('--hero-image', `url('${versioned}')`);
      },
      splitParagraphs(text) {
        return String(text || '')
          .split(/\n\s*\n/g)
          .map((entry) => entry.trim())
          .filter(Boolean);
      },
      versionedUrl(url, assetVersion) {
        return `${url}?v=${encodeURIComponent(assetVersion)}`;
      }
    }
  };

  const context = vm.createContext({
    window,
    document,
    console: { error() {} },
    URL,
    URLSearchParams,
    encodeURIComponent
  });

  vm.runInContext(source, context, { filename: 'scripts/portfolio.js' });
  const onReady = listeners.get('DOMContentLoaded');
  assert.ok(onReady, 'DOMContentLoaded handler should be registered');
  await onReady();

  return {
    html: app.innerHTML,
    heroSrc: heroImg.src,
    heroStyle,
    jsonRequests,
    textRequests
  };
}
