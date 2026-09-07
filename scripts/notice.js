function escapeNoticeText(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('notice-app');
    if (!app) return;

    // Helper to get URL params
    const getUrlParam = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };

    // Render Loading State
    app.innerHTML = `
        <div class="notice-list">
            <article class="notice-record-item notice-loading">
                <span>불러오는 중...</span>
            </article>
        </div>
    `;

    try {
        const endpointsResponse = await fetch('assets/shared/board-endpoints.json', { cache: 'no-cache' });
        if (endpointsResponse.ok === false) throw new Error('Failed to load board endpoints');
        const endpoints = await endpointsResponse.json();
        if (!endpoints.noticesManifest) throw new Error('Missing Notice manifest endpoint');
        const manifestResponse = await fetch(endpoints.noticesManifest, { cache: 'no-cache' });
        if (manifestResponse.ok === false) throw new Error('Failed to load Notice manifest');
        const manifest = await manifestResponse.json();
        const assetVersion = manifest.assetVersion || '';

        const withVersion = (url) => {
            const raw = String(url || '').trim();
            const version = String(assetVersion || '').trim();
            if (!raw || !version) return raw;
            const separator = raw.includes('?') ? '&' : '?';
            return `${raw}${separator}v=${encodeURIComponent(version)}`;
        };

        const noticesResponse = await fetch(withVersion(manifest.noticesJson));
        const notices = await noticesResponse.json();
        
        const currentId = document.getElementById('notice') ? null : getUrlParam('id');

        const attachmentsBase = manifest.attachmentsBase || '/board-content/attachments/';
        if (currentId) {
            await renderDetail(notices, currentId, app, attachmentsBase, manifest.postsBase, assetVersion);
        } else {
            renderList(notices, app);
            window.JsgBoardPager?.enhance(document.getElementById('notice'), app.querySelector('.notice-list'));
        }

    } catch (error) {
        console.error('Failed to fetch notices:', error);
        app.innerHTML = '<div class="notice-error">공지사항을 불러올 수 없습니다.</div>';
    } finally {
        const section = document.getElementById('notice');
        if (section) {
            section.setAttribute('data-content-ready', 'true');
            section.dispatchEvent(new Event('jsg:section-ready', { bubbles: true }));
        }
    }
});

function renderList(notices, container) {
    const sorted = sortNoticesByDateDesc(notices);

    // Clear container
    container.innerHTML = '';

    const listContainer = document.createElement('div');
    listContainer.className = 'notice-list';

    sorted.forEach(notice => {
        const item = document.createElement('article');
        item.className = 'notice-record-item';

        item.innerHTML = `
            <header class="notice-record-item-header">
                <a href="notice.html?id=${encodeURIComponent(notice.id)}" class="notice-link">${escapeNoticeText(notice.title)}</a>
            </header>
            <div class="notice-meta">
                <span class="notice-date">${escapeNoticeText(notice.date)}</span>
                <span class="notice-category">${escapeNoticeText(notice.category)}</span>
            </div>
        `;
        listContainer.appendChild(item);
    });

    container.appendChild(listContainer);
}

function normalizeBasePath(base, fallback) {
    const value = String(base || fallback || '').trim();
    if (!value) return '';
    const normalized = value.replaceAll('\\', '/');
    return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

async function fetchNoticeBodyText(id, postsBase, assetVersion, bodyFormat) {
    const normalizedBase = normalizeBasePath(postsBase, '/board-content/posts/');
    const safeId = String(id || '').trim();
    if (!normalizedBase || !safeId) {
        throw new Error('Missing posts base or notice id');
    }

    const withVersion = (url) => {
        const raw = String(url || '').trim();
        const version = String(assetVersion || '').trim();
        if (!raw || !version) return raw;
        const separator = raw.includes('?') ? '&' : '?';
        return `${raw}${separator}v=${encodeURIComponent(version)}`;
    };

    const url = withVersion(`${normalizedBase}${encodeURIComponent(safeId)}.${bodyFormat === 'html' ? 'html' : 'txt'}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch notice body: ${response.status} ${response.statusText}`);
    }
    return await response.text();
}

async function renderDetail(notices, id, container, attachmentsBase, postsBase, assetVersion) {
    const notice = notices.find(n => n.id === id);

    if (!notice) {
        container.innerHTML = '<div class="notice-error">해당 공지사항을 찾을 수 없습니다.</div>';
        container.appendChild(buildNoticePager(notices, id));
        return;
    }

    container.innerHTML = `
        <article class="notice-record">
            <header class="notice-header">
                <div class="notice-meta-detail">
                    <time class="notice-date-detail" datetime="${escapeNoticeText(notice.date)}">${escapeNoticeText(notice.date)}</time>
                    <span>${escapeNoticeText(notice.category)}</span>
                </div>
                <h1 class="h1-title">${escapeNoticeText(notice.title)}</h1>
            </header>
            <div class="notice-record-body" aria-live="polite"></div>
            ${renderAttachments(notice.attachments, attachmentsBase, assetVersion)}
        </article>
    `;

    document.title = `${notice.title} | JSG INVESTMENT`;
    const body = container.querySelector('.notice-record-body');
    if (body) {
        body.textContent = '본문을 불러오는 중입니다...';
        try {
            const text = await fetchNoticeBodyText(id, postsBase, assetVersion, notice.bodyFormat);
            if (notice.bodyFormat === 'html') {
                // HTML is generated by the board-content publisher with raw Markdown HTML disabled.
                body.innerHTML = `<div class="notice-markdown">${text}</div>`;
            } else {
                body.textContent = text;
            }
        } catch (error) {
            console.error('Failed to fetch notice body:', error);
            body.textContent = '본문을 불러올 수 없습니다.';
        }
    }

    const detail = container.querySelector('.notice-record');
    if (detail) detail.appendChild(buildNoticePager(notices, id));
}

function sortNoticesByDateDesc(notices) {
    const items = Array.isArray(notices) ? notices.slice() : [];
    items.sort((a, b) => {
        const aTime = Date.parse(a?.date || '') || 0;
        const bTime = Date.parse(b?.date || '') || 0;
        return bTime - aTime;
    });
    return items;
}

function truncateNavLabel(text, maxLength = 18) {
    const value = String(text || '').trim();
    if (value.length <= maxLength) return value;
    return `${value.slice(0, Math.max(0, maxLength - 1))}\u2026`;
}

function buildNoticePager(notices, currentId) {
    const ordered = sortNoticesByDateDesc(notices);
    const index = ordered.findIndex(n => n?.id === currentId);
    const prevNotice = index > 0 ? ordered[index - 1] : null;
    const nextNotice = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

    const pager = document.createElement('div');
    pager.className = 'notice-pager';
    pager.setAttribute('aria-label', 'Notice navigation');

    const makeSpacer = () => {
        const spacer = document.createElement('span');
        spacer.className = 'notice-pager-spacer';
        spacer.setAttribute('aria-hidden', 'true');
        return spacer;
    };

    if (prevNotice) {
        const prev = document.createElement('a');
        prev.className = 'notice-pager-link prev';
        prev.href = `notice.html?id=${encodeURIComponent(prevNotice.id)}`;
        prev.setAttribute('aria-label', `Previous notice: ${truncateNavLabel(prevNotice.title, 48)}`);
        prev.textContent = `\u2190 ${truncateNavLabel(prevNotice.title)}`;
        pager.appendChild(prev);
    } else {
        pager.appendChild(makeSpacer());
    }

    const back = document.createElement('a');
    back.className = 'notice-pager-list';
    back.href = 'notice.html';
    back.setAttribute('aria-label', 'Back to Notice');
    back.textContent = `Notice \u25B2`;
    pager.appendChild(back);

    if (nextNotice) {
        const next = document.createElement('a');
        next.className = 'notice-pager-link next';
        next.href = `notice.html?id=${encodeURIComponent(nextNotice.id)}`;
        next.setAttribute('aria-label', `Next notice: ${truncateNavLabel(nextNotice.title, 48)}`);
        next.textContent = `${truncateNavLabel(nextNotice.title)} \u2192`;
        pager.appendChild(next);
    } else {
        pager.appendChild(makeSpacer());
    }

    return pager;
}

function renderAttachments(attachments, attachmentsBase, assetVersion) {
    if (!attachments || attachments.length === 0) return '';

    const normalizedBase = normalizeBasePath(attachmentsBase, '/board-content/attachments/');

    const withVersion = (url) => {
        const raw = String(url || '').trim();
        const version = String(assetVersion || '').trim();
        if (!raw || !version) return raw;
        const separator = raw.includes('?') ? '&' : '?';
        return `${raw}${separator}v=${encodeURIComponent(version)}`;
    };

    const listHtml = attachments
        .map((filename) => {
            const rawName = String(filename || '').trim();
            if (!rawName) return '';

            const normalizedName = rawName.replaceAll('\\', '/').replace(/^\/+/, '');
            const safeName = normalizedName
                .split('/')
                .map(segment => encodeURIComponent(segment))
                .join('/');

            return `
                <li class="attachment-item">
                    <a href="${withVersion(normalizedBase + safeName)}" download class="attachment-link">
                        <span class="attachment-icon">📎</span>
                        ${normalizedName}
                    </a>
                </li>
            `;
        })
        .filter(Boolean)
        .join('');

    return `
        <div class="notice-attachments">
            <h3 class="attachment-title">Files</h3>
            <ul class="attachment-list">
                ${listHtml}
            </ul>
        </div>
    `;
}
