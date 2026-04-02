document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const hero = document.querySelector('.page-hero');
    const heroSurfaceEl = hero?.querySelector('.page-hero-surface');
    const heroImgEl = hero?.querySelector('.page-hero-media img');
    const mapLinkEl = document.getElementById('contact-map-link');
    const textTargets = {
        heroKicker: document.getElementById('contact-hero-kicker'),
        heroLead: document.getElementById('contact-hero-lead'),
        locationTitle: document.getElementById('contact-location-title'),
        locationAddress: document.getElementById('contact-location-address'),
        locationSubtext: document.getElementById('contact-location-subtext'),
        mapLabel: mapLinkEl,
        contactTitle: document.getElementById('contact-title'),
        phoneLabel: document.getElementById('contact-phone-label'),
        phoneValue: document.getElementById('contact-phone-value'),
        emailLabel: document.getElementById('contact-email-label'),
        emailValue: document.getElementById('contact-email-value')
    };

    if (!textTargets.heroKicker) return;

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/contact/contact-manifest.json');
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};

        window.JsgAssets.setHeroImage(heroSurfaceEl, heroImgEl, manifest.heroImage, assetVersion);

        const loadedTexts = await Promise.all(
            Object.keys(textTargets).map(async (key) => {
                const textUrl = window.JsgAssets.versionedUrl(texts[key], assetVersion);
                const text = await window.JsgAssets.fetchText(textUrl);
                return [key, text.trim()];
            })
        );

        loadedTexts.forEach(([key, text]) => {
            window.JsgAssets.setText(textTargets[key], text);
        });

        const mapUrl = String(manifest.mapUrl || '').trim();
        if (mapLinkEl && mapUrl) {
            mapLinkEl.href = mapUrl;
            mapLinkEl.target = '_blank';
            mapLinkEl.rel = 'noreferrer noopener';
            mapLinkEl.removeAttribute('aria-disabled');
        }
    } catch (error) {
        console.error('Failed to load contact copy:', error);
    }
});
