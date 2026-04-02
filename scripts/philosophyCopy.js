document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const hero = document.querySelector('.page-hero');
    const kickerEl = hero?.querySelector('.page-hero-kicker');
    if (!kickerEl) return;

    const heroLeadEls = hero.querySelectorAll('.page-hero-sub');
    const heroSurfaceEl = hero.querySelector('.page-hero-surface');
    const heroImgEl = hero.querySelector('.page-hero-media img');
    const cards = document.querySelectorAll('.philosophy-card');

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/philosophy/philosophy-manifest.json');
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};

        window.JsgAssets.setHeroImage(heroSurfaceEl, heroImgEl, manifest.heroImage, assetVersion);

        const [
            heroKicker,
            heroLead,
            heroLeadEn,
            respectTitle,
            respectDescEn,
            respectDescKo,
            healthTitle,
            healthDescEn,
            healthDescKo,
            integrityTitle,
            integrityDescEn,
            integrityDescKo
        ] = await Promise.all([
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroKicker, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroLead, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroLeadEn, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.respectTitle, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.respectDescEn, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.respectDescKo, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.healthTitle, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.healthDescEn, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.healthDescKo, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.integrityTitle, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.integrityDescEn, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.integrityDescKo, assetVersion))
        ]);

        window.JsgAssets.setText(kickerEl, heroKicker.trim());
        if (heroLeadEls[0]) window.JsgAssets.setText(heroLeadEls[0], heroLead.trim());
        if (heroLeadEls[1]) window.JsgAssets.setText(heroLeadEls[1], heroLeadEn.trim());

        const setCard = (card, title, en, ko) => {
            if (!card) return;
            window.JsgAssets.setText(card.querySelector('.phil-title'), title.trim());
            window.JsgAssets.setText(card.querySelector('.phil-desc-en'), en.trim());
            window.JsgAssets.setText(card.querySelector('.phil-desc-ko'), ko.trim());
        };

        setCard(cards[0], respectTitle, respectDescEn, respectDescKo);
        setCard(cards[1], healthTitle, healthDescEn, healthDescKo);
        setCard(cards[2], integrityTitle, integrityDescEn, integrityDescKo);
    } catch (error) {
        console.error('Failed to load philosophy copy:', error);
    }
});
