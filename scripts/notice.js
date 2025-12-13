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
        const response = await fetch('data/notices.json');
        const notices = await response.json();
        
        const currentId = getUrlParam('id');

        if (currentId) {
            renderDetail(notices, currentId, app);
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

function renderDetail(notices, id, container) {
    const notice = notices.find(n => n.id === id);

    if (!notice) {
        container.innerHTML = '<div class="notice-error">존재하지 않는 게시물입니다. <a href="notice.html">목록으로 돌아가기</a></div>';
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
            ${renderAttachments(notice.attachments)}
            <div class="notice-footer">
                <a href="notice.html" class="contact-btn" style="background-color: var(--border-light); color: var(--text-main);">목록으로</a>
            </div>
        </div>
    `;
}

function renderAttachments(attachments) {
    if (!attachments || attachments.length === 0) return '';

    const listHtml = attachments.map(filename => `
        <li class="attachment-item">
            <a href="data/uploads/${filename}" download class="attachment-link">
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
