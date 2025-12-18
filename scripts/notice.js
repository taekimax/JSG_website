document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('notice-app');
    if (!app) return;

    // Helper to get URL params
    const getUrlParam = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };

    // Render Loading State
    app.innerHTML = '<div class="notice-loading">Loading...</div>';

    try {
        const manifestResponse = await fetch('assets/notices/notices-manifest.json');
        const manifest = await manifestResponse.json();
        const assetVersion = manifest.assetVersion || '';

        const withVersion = (url) => {
            const raw = String(url || '').trim();
            const version = String(assetVersion || '').trim();
            if (!raw || !version) return raw;
            const separator = raw.includes('?') ? '&' : '?';
            return `${raw}${separator}v=${encodeURIComponent(version)}`;
        };

        if (manifest.heroImage) {
            const heroSurface = document.querySelector('.page-hero .page-hero-surface');
            const heroImg = document.querySelector('.page-hero .page-hero-media img');
            const versionedHero = withVersion(manifest.heroImage);
            if (heroImg) heroImg.src = versionedHero;
            if (heroSurface) heroSurface.style.setProperty('--hero-image', `url('${versionedHero}')`);
        }

        const noticesResponse = await fetch(withVersion(manifest.noticesJson));
        const notices = await noticesResponse.json();
        
        const currentId = getUrlParam('id');

        if (currentId) {
            renderDetail(notices, currentId, app, manifest.uploadsBase, assetVersion);
        } else {
            renderList(notices, app);
        }

    } catch (error) {
        console.error('Failed to fetch notices:', error);
        app.innerHTML = '<div class="notice-error">공지사항을 불러을 수 없습니다.</div>';
    }
});

function renderList(notices, container) {
    // Basic sorting by date desc
    const sorted = notices.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Clear container
    container.innerHTML = '';

    const listContainer = document.createElement('div');
    listContainer.className = 'notice-list';

    sorted.forEach(notice => {
        const item = document.createElement('div');
        item.className = 'notice-item';
        
        let badgeHtml = '';
        if (notice.isImportant) {
            badgeHtml = '<span class="badge-important">필수</span>';
        }

        item.innerHTML = `
            <a href="notice.html?id=${notice.id}" class="notice-link">${notice.title}</a>
            <div class="notice-meta">
                ${badgeHtml}
                <span>${notice.date}</span>
                <span class="notice-category">| ${notice.category}</span>
            </div>
        `;
        listContainer.appendChild(item);
    });

    container.appendChild(listContainer);
}

function renderDetail(notices, id, container, uploadsBase, assetVersion) {
    const notice = notices.find(n => n.id === id);

    if (!notice) {
        container.innerHTML = '<div class="notice-error">존재하지 않는 게시물입니다. <a href="notice.html">목록으로 돌아가기</a></div>';
        const backLink = container.querySelector('a[href="notice.html"]');
        if (backLink) backLink.remove();
        container.appendChild(buildNoticePager(notices, id));
        return;
    }

    container.innerHTML = `
        <div class="notice-detail">
            <div class="notice-header">
                <span class="notice-date-detail">${notice.date}</span>
                <h1 class="h1-title" style="margin-top: 8px; margin-bottom: 24px;">${notice.title}</h1>
                <div class="notice-meta-detail">
                    <span>분류: ${notice.category}</span>
                </div>
            </div>
            <div class="notice-body text-block">
                ${notice.content}
            </div>
            ${renderAttachments(notice.attachments, uploadsBase, assetVersion)}
            <div class="notice-footer">
                <a href="notice.html" class="contact-btn" style="background-color: var(--border-light); color: var(--text-main);">목록으로</a>
            </div>
        </div>
    `;

    const footer = container.querySelector('.notice-footer');
    if (footer) footer.remove();

    const detail = container.querySelector('.notice-detail');
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
    back.textContent = `Back to Notice \u25B2`;
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

function renderAttachments(attachments, uploadsBase, assetVersion) {
    if (!attachments || attachments.length === 0) return '';

    const base = String(uploadsBase || 'assets/notices/uploads/').replaceAll('\\', '/');
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;

    const withVersion = (url) => {
        const raw = String(url || '').trim();
        const version = String(assetVersion || '').trim();
        if (!raw || !version) return raw;
        const separator = raw.includes('?') ? '&' : '?';
        return `${raw}${separator}v=${encodeURIComponent(version)}`;
    };

    const listHtml = attachments.map(filename => `
        <li class="attachment-item">
            <a href="${withVersion(normalizedBase + encodeURIComponent(filename))}" download class="attachment-link">
                <span class="attachment-icon">📎</span>
                ${filename}
            </a>
        </li>
    `).join('');

    return `
        <div class="notice-attachments">
            <h3 class="attachment-title">첨부파일</h3>
            <ul class="attachment-list">
                ${listHtml}
            </ul>
        </div>
    `;
}
