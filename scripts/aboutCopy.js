document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const hero = document.getElementById('about-jsg');
    const kickerEl = hero?.querySelector('.page-hero-kicker');
    if (!kickerEl) return;

    const heroSubEls = hero.querySelectorAll('.page-hero-sub');
    const sectionEls = document.querySelectorAll('.about-section');

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/about/about-manifest.json');
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};

        const [
            heroKicker,
            heroSubKo,
            heroSubEn,
            section1Title,
            section1Body,
            section2Title,
            section2Body
        ] = await Promise.all([
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroKicker, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroSubKo, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroSubEn, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.section1Title, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.section1Body, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.section2Title, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.section2Body, assetVersion))
        ]);

        window.JsgAssets.setText(kickerEl, heroKicker.trim());

        if (heroSubEls.length > 0) window.JsgAssets.setText(heroSubEls[0], heroSubKo.trim());
        if (heroSubEls.length > 1) window.JsgAssets.setText(heroSubEls[1], heroSubEn.trim());

        const hydrateSection = (sectionEl, title, body) => {
            if (!sectionEl) return;
            const titleEl = document.getElementById(sectionEl.getAttribute('aria-labelledby'));
            const value = title.trim();
            const breakBefore = titleEl?.getAttribute('data-break-before');
            const split = breakBefore ? value.indexOf(` ${breakBefore}`) : -1;
            window.JsgAssets.setText(titleEl, value);
            if (titleEl && split > 0) {
                titleEl.replaceChildren();
                for (const line of [value.slice(0, split + 1), value.slice(split + 1)]) {
                    const span = document.createElement('span');
                    span.className = 'about-title-line';
                    span.textContent = line;
                    titleEl.appendChild(span);
                }
            }

            sectionEl.querySelectorAll('p').forEach(p => p.remove());

            for (const paragraph of window.JsgAssets.splitParagraphs(body)) {
                const p = document.createElement('p');
                p.textContent = paragraph;
                sectionEl.appendChild(p);
            }
        };

        hydrateSection(sectionEls[0], section1Title, section1Body);
        hydrateSection(sectionEls[1], section2Title, section2Body);
    } catch (error) {
        console.error('Failed to load about copy:', error);
    } finally {
        const section = document.getElementById('about');
        if (section) {
            section.setAttribute('data-content-ready', 'true');
            section.dispatchEvent(new Event('jsg:section-ready', { bubbles: true }));
        }
    }
});
