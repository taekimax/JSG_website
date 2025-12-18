document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const app = document.getElementById('portfolio-app') || document.querySelector('.portfolio-grid');
    if (!app) return;

    const hero = document.querySelector('.page-hero');
    const heroSurfaceEl = hero?.querySelector('.page-hero-surface');
    const heroImgEl = hero?.querySelector('.page-hero-media img');

    app.innerHTML = '<div class="portfolio-card"><div class="portfolio-content"><p class="company-desc" style="margin:0; color: var(--text-muted);">Loading...</p></div></div>';

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/portfolio/portfolio-manifest.json');
        const assetVersion = manifest.assetVersion;

        window.JsgAssets.setHeroImage(heroSurfaceEl, heroImgEl, manifest.heroImage, assetVersion);

        const companies = Array.isArray(manifest.companies) ? manifest.companies.slice() : [];
        companies.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const descriptions = await Promise.all(companies.map(company =>
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(company.descriptionText, assetVersion))
        ));

        app.innerHTML = '';

        companies.forEach((company, index) => {
            const card = document.createElement('div');
            card.className = 'portfolio-card';

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

            const paragraphs = window.JsgAssets.splitParagraphs(descriptions[index] || '');
            if (paragraphs.length === 0) {
                const p = document.createElement('p');
                p.className = 'company-desc';
                p.textContent = '';
                content.appendChild(p);
            } else {
                paragraphs.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.className = 'company-desc';
                    p.textContent = paragraph;
                    content.appendChild(p);
                });
            }

            const img = document.createElement('img');
            img.className = 'portfolio-img';
            img.alt = company.name || '';
            img.src = window.JsgAssets.versionedUrl(company.logo, assetVersion);

            card.appendChild(content);
            card.appendChild(img);

            app.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to render portfolio:', error);
        app.innerHTML = '<div class="about-card"><p style="margin: 0; color: var(--text-muted);">포트폴리오를 불러올 수 없습니다.</p></div>';
    }
});
