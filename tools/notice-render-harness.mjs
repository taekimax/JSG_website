import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function escapeHtml(value) {
  return String(value)
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
    this.innerHTML = '';
  }

  appendChild(child) {
    this.innerHTML += renderNode(child);
    return child;
  }

  querySelector(selector) {
    if (selector === '.notice-record-body' && this.innerHTML.includes('class="notice-record-body"')) {
      const body = {};
      Object.defineProperty(body, 'textContent', {
        set: (value) => {
          const text = escapeHtml(value);
          const pattern = /(<div class="notice-record-body" aria-live="polite">)([\s\S]*?)(<\/div>)/;
          if (pattern.test(this.innerHTML)) {
            this.innerHTML = this.innerHTML.replace(pattern, `$1${text}$3`);
          }
        }
      });
      return body;
    }

    if (selector === '.notice-record' && this.innerHTML.includes('class="notice-record"')) {
      return {
        appendChild: (child) => {
          this.innerHTML += renderNode(child);
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

export async function createNoticeRuntime({ fetchImpl } = {}) {
  const source = await readRepoFile('scripts/notice.js');

  const context = vm.createContext({
    window: { location: { search: '' } },
    document: {
      addEventListener() {},
      getElementById() {
        return null;
      },
      querySelector() {
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
    renderList: context.renderList,
    renderDetail: context.renderDetail,
    renderAttachments: context.renderAttachments,
    buildNoticePager: context.buildNoticePager
  };
}
