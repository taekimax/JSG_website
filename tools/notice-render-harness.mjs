import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

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
  }

  setAttribute(name, value) {
    this.attributes.set(String(name), String(value));
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  get outerHTML() {
    const attrs = [];
    if (this.className) attrs.push(`class="${escapeHtml(this.className)}"`);
    if (this.href) attrs.push(`href="${escapeHtml(this.href)}"`);
    for (const [name, value] of this.attributes) {
      if (name === 'class' && this.className) continue;
      if (name === 'href' && this.href) continue;
      attrs.push(`${escapeHtml(name)}="${escapeHtml(value)}"`);
    }
    const attrString = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
    const hasRawInner = typeof this.innerHTML === 'string' && this.innerHTML.length > 0;
    const body = hasRawInner
      ? `${this.innerHTML}${this.children.map(renderNode).join('')}`
      : `${escapeHtml(this.textContent)}${this.children.map(renderNode).join('')}`;
    return `<${this.tagName}${attrString}>${body}</${this.tagName}>`;
  }
}

class FakeContainer {
  constructor() {
    this._innerHTML = '';
    this.children = [];
    this.bodyText = null;
    this.bodyHtml = null;
    this.hasNoticeBody = false;
    this.hasNoticeRecord = false;
    this.recordChildren = [];
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
    this.bodyText = null;
    this.bodyHtml = null;
    this.recordChildren = [];
    this.hasNoticeBody = this._innerHTML.includes('class="notice-record-body"');
    this.hasNoticeRecord = this._innerHTML.includes('class="notice-record"');
  }

  get innerHTML() {
    let html = this._innerHTML;

    if (this.hasNoticeBody) {
      const content = this.bodyHtml ?? (this.bodyText === null ? '' : escapeHtml(this.bodyText));
      html = html.replace(
        /(<div class="notice-record-body" aria-live="polite">)([\s\S]*?)(<\/div>)/,
        `$1${content}$3`
      );
    }

    if (this.hasNoticeRecord && this.recordChildren.length > 0) {
      html = html.replace(
        /<\/article>\s*$/,
        `${this.recordChildren.map(renderNode).join('')}</article>`
      );
    }

    if (this.children.length > 0) {
      html += this.children.map(renderNode).join('');
    }

    return html;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  querySelector(selector) {
    if (selector === '.notice-record-body' && this.hasNoticeBody) {
      return {
        set textContent(value) {
          this.__container.bodyText = String(value);
          this.__container.bodyHtml = null;
        },
        set innerHTML(value) {
          this.__container.bodyHtml = String(value);
        },
        __container: this
      };
    }

    if (selector === '.notice-record' && this.hasNoticeRecord) {
      return {
        appendChild: (child) => {
          this.recordChildren.push(child);
          return child;
        }
      };
    }

    return null;
  }
}

export async function readRepoFile(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

export function createContainer() {
  return new FakeContainer();
}

export async function createNoticeRuntime({ fetchImpl, search = '' } = {}) {
  const source = await readRepoFile('scripts/notice.js');
  const listeners = new Map();
  const app = createContainer();
  const heroImg = { src: '' };
  const heroStyle = {};
  const heroSurface = {
    style: {
      setProperty(name, value) {
        heroStyle[name] = String(value);
      }
    }
  };

  const context = vm.createContext({
    window: { location: { search } },
    document: {
      addEventListener(eventName, callback) {
        listeners.set(eventName, callback);
      },
      getElementById(id) {
        return id === 'notice-app' ? app : null;
      },
      querySelector(selector) {
        if (selector === '.page-hero .page-hero-surface') return heroSurface;
        if (selector === '.page-hero .page-hero-media img') return heroImg;
        return null;
      },
      createElement(tagName) {
        return new FakeElement(tagName);
      }
    },
    fetch: fetchImpl || (async () => ({ ok: true, async json() { return {}; }, async text() { return ''; } })),
    console: { error() {} },
    URLSearchParams,
    encodeURIComponent,
    decodeURIComponent,
    Date
  });

  vm.runInContext(source, context, { filename: 'scripts/notice.js' });

  return {
    app,
    heroImg,
    heroStyle,
    renderList: context.renderList,
    renderDetail: context.renderDetail,
    renderAttachments: context.renderAttachments,
    buildNoticePager: context.buildNoticePager,
    async runDomContentLoaded() {
      const handler = listeners.get('DOMContentLoaded');
      if (!handler) {
        throw new Error('DOMContentLoaded handler was not registered');
      }
      await handler();
    }
  };
}
