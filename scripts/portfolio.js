document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const app = document.getElementById('portfolio-app') || document.querySelector('.portfolio-grid');
    if (!app) return;

    const hero = document.querySelector('.page-hero');
    const heroSurfaceEl = hero?.querySelector('.page-hero-surface');
    const heroImgEl = hero?.querySelector('.page-hero-media img');
    const currentId = new URLSearchParams(window.location.search).get('id');

    const escapeHtml = (value) => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const buildParagraphs = (text) => window.JsgAssets.splitParagraphs(text || '')
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');

    app.innerHTML = '<div class="portfolio-card"><div class="portfolio-content"><p class="company-desc" style="margin:0; color: var(--text-muted);">Loading...</p></div><div class="portfolio-card-media"><div class="portfolio-img-placeholder" aria-hidden="true"></div></div></div>';

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/portfolio/portfolio-manifest.json');
        const assetVersion = manifest.assetVersion;

        window.JsgAssets.setHeroImage(heroSurfaceEl, heroImgEl, manifest.heroImage, assetVersion);

        const companies = Array.isArray(manifest.companies) ? manifest.companies.slice() : [];
        companies.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const descriptions = Object.fromEntries(await Promise.all(companies.map(async (company) => {
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
                        <p style="margin: 12px 0 0;"><a href="portfolio.html" class="portfolio-detail-back">Back to Portfolio</a></p>
                    </div>
                `;
                return;
            }

            const detail = document.createElement('div');
            detail.className = 'portfolio-detail';
            detail.innerHTML = `
                <div class="portfolio-detail-media">
                    <img class="portfolio-img" loading="lazy" decoding="async" src="${escapeHtml(window.JsgAssets.versionedUrl(company.logo, assetVersion))}" alt="${escapeHtml(company.name || '')}">
                </div>
                <div class="portfolio-detail-copy">
                    <span class="company-sector">${escapeHtml(company.sector || '')}</span>
                    <h1 class="portfolio-detail-name">${escapeHtml(company.name || '')}</h1>
                    <div class="portfolio-detail-body">${buildParagraphs(descriptions[company.id] || '')}</div>
                    <a href="portfolio.html" class="portfolio-detail-back">Back to Portfolio</a>
                </div>
            `;
            app.appendChild(detail);
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

            const media = document.createElement('div');
            media.className = 'portfolio-card-media';
            media.innerHTML = `<img class="portfolio-img" loading="lazy" decoding="async" src="${escapeHtml(window.JsgAssets.versionedUrl(company.logo, assetVersion))}" alt="${escapeHtml(company.name || '')}">`;
            link.append(content, media);
            app.appendChild(link);
        });
    } catch (error) {
        console.error('Failed to render portfolio:', error);
        app.innerHTML = '<div class="about-card"><p style="margin: 0; color: var(--text-muted);">포트폴리오를 불러올 수 없습니다.</p></div>';
    }
});
