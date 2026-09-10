document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const namesApp = document.getElementById('portfolio-name-list');
    const app = namesApp || document.getElementById('portfolio-app') || document.querySelector('.portfolio-grid');
    if (!app) return;

    const namesOnly = app === namesApp;
    const currentId = namesOnly ? null : new URLSearchParams(window.location.search).get('id');

    const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const buildParagraphs = (text) => window.JsgAssets.splitParagraphs(text || '')
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');

    const officialWebsite = (value) => {
        try {
            const url = new URL(value);
            return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
        } catch { return ''; }
    };

    const marketBadge = (company) => ['KOSDAQ', 'KOSPI'].includes(company.market)
        ? ` <span class="company-market-badge">${company.market}</span>`
        : '';

    app.innerHTML = '';

    const renderNames = (companies) => {
        if (!companies.length) {
            app.innerHTML = '<p>등록된 투자회사가 없습니다.</p>';
            return;
        }

        const renderGroup = (duplicate = false) => `<ul class="company-name-group"${duplicate ? ' aria-hidden="true"' : ''}>${companies.map(company => `
            <li><a href="portfolio.html?id=${encodeURIComponent(company.id)}"${duplicate ? ' tabindex="-1"' : ''}>${escapeHtml(company.name || '')}${marketBadge(company)}</a></li>
        `).join('')}</ul>`;

        app.innerHTML = `<div class="company-name-track">${renderGroup()}${companies.length > 1 ? renderGroup(true) : ''}</div>`;
        app.setAttribute('data-animated', String(companies.length > 1));

        const motionToggle = document.getElementById('company-motion-toggle');
        if (motionToggle && companies.length > 1) {
            motionToggle.hidden = false;
            // Portfolio advances at exactly 120 CSS pixels per second.
            window.JsgCarousel({ viewport: app, button: motionToggle, group: app.querySelector('.company-name-group'), speed: 0.1 });
        }
    };

    try {
        const endpoints = await window.JsgAssets.fetchJson('assets/shared/board-endpoints.json');
        const manifest = await window.JsgAssets.fetchJson(endpoints.portfolioManifest);
        const assetVersion = manifest.assetVersion;

        const companies = Array.isArray(manifest.companies) ? manifest.companies.slice() : [];
        companies.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        if (namesOnly) {
            renderNames(companies);
            return;
        }

        const displayedCompanies = currentId ? companies.filter(company => company.id === currentId) : companies;
        const descriptions = Object.fromEntries(await Promise.all(displayedCompanies.map(async (company) => {
            const description = await window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(company.descriptionText, assetVersion));
            return [company.id, description];
        })));

        app.innerHTML = '';

        if (currentId) {
            const company = companies.find((entry) => entry.id === currentId);
            if (!company) {
                app.innerHTML = `
                    <div class="about-card">
                        <p style="margin: 0; color: var(--text-muted);">선택한 포트폴리오를 찾을 수 없습니다.</p>
                        <p style="margin: 12px 0 0;"><a href="about.html#portfolio" class="detail-return">Portfolio <span class="nav-chevron" data-direction="up" aria-hidden="true"></span></a></p>
                    </div>
                `;
                return;
            }

            document.title = `${company.name} | JSG INVESTMENT`;
            const detail = document.createElement('article');
            detail.className = 'portfolio-detail';
            const websiteUrl = officialWebsite(company.websiteUrl);
            detail.innerHTML = `
                <div class="portfolio-detail-copy">
                    <header class="portfolio-profile-header">
                        <div class="portfolio-profile-title">
                            <span class="company-sector">${escapeHtml(company.sector || '')}</span>
                            <h1 class="portfolio-detail-name">${escapeHtml(company.name || '')}</h1>
                        </div>
                        ${company.ciImage ? `<div class="portfolio-ci"><img src="${escapeHtml(window.JsgAssets.versionedUrl(company.ciImage, assetVersion))}" alt="${escapeHtml(company.name)} CI"${company.ciMonochrome ? ' class="ci-monochrome"' : ''}></div>` : '<div class="portfolio-ci portfolio-ci--placeholder" aria-hidden="true"></div>'}
                    </header>
                    <div class="portfolio-detail-body">${buildParagraphs(descriptions[company.id] || '')}</div>
                    ${websiteUrl ? `<a class="portfolio-website" href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(company.name)} 공식 웹사이트 (새 탭)"><span class="portfolio-website-label">공식웹사이트</span><span class="nav-chevron" data-direction="right" aria-hidden="true"></span></a>` : ''}
                </div>
            `;
            app.appendChild(detail);
            const index = companies.indexOf(company);
            const previous = companies[index - 1];
            const next = companies[index + 1];
            const pager = document.createElement('nav');
            pager.className = 'detail-pager';
            pager.setAttribute('aria-label', 'Portfolio navigation');
            const link = (entry, direction) => entry
                ? `<a class="detail-pager-link ${direction}" href="portfolio.html?id=${encodeURIComponent(entry.id)}" aria-label="${direction === 'prev' ? 'Previous company' : 'Next company'}: ${escapeHtml(entry.name)}">${direction === 'prev' ? '<span class="nav-chevron" data-direction="left" aria-hidden="true"></span> ' : ''}${escapeHtml(entry.name)}${direction === 'next' ? ' <span class="nav-chevron" data-direction="right" aria-hidden="true"></span>' : ''}</a>`
                : '<span class="detail-pager-spacer" aria-hidden="true"></span>';
            pager.innerHTML = link(previous, 'prev') + link(next, 'next');
            app.appendChild(pager);
            return;
        }

        companies.forEach((company) => {
            const link = document.createElement('a');
            link.className = 'portfolio-card portfolio-card--link';
            link.href = `portfolio.html?id=${encodeURIComponent(company.id)}`;

            const content = document.createElement('div');
            content.className = 'portfolio-content';

            const header = document.createElement('div');
            header.className = 'portfolio-header';

            const nameEl = document.createElement('h3');
            nameEl.className = 'company-name';
            nameEl.textContent = company.name || '';

            const sectorEl = document.createElement('span');
            sectorEl.className = 'company-sector';
            sectorEl.textContent = company.sector || '';

            header.appendChild(nameEl);
            header.appendChild(sectorEl);
            content.appendChild(header);

            const paragraph = document.createElement('p');
            paragraph.className = 'company-desc';
            paragraph.textContent = window.JsgAssets.splitParagraphs(descriptions[company.id] || '').join(' ');
            content.appendChild(paragraph);

            link.appendChild(content);
            app.appendChild(link);
        });
    } catch (error) {
        console.error('Failed to render portfolio:', error);
        app.innerHTML = '<div class="about-card"><p style="margin: 0; color: var(--text-muted);">포트폴리오를 불러올 수 없습니다.</p></div>';
    } finally {
        const section = document.getElementById('portfolio') || app;
        if (section) {
            section.setAttribute('data-content-ready', 'true');
            section.dispatchEvent(new Event('jsg:section-ready', { bubbles: true }));
        }
    }
});
