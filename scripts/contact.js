document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const hero = document.querySelector('.page-hero');
    const heroSurfaceEl = hero?.querySelector('.page-hero-surface');
    const heroImgEl = hero?.querySelector('.page-hero-media img');
    const mapImageEl = document.getElementById('contact-map-image');
    const mapCaptionEl = document.getElementById('contact-map-caption');
    const textTargets = {
        heroKicker: document.getElementById('contact-hero-kicker'),
        heroLead: document.getElementById('contact-hero-lead'),
        locationTitle: document.getElementById('contact-location-title'),
        locationAddress: document.getElementById('contact-location-address'),
        locationSubtext: document.getElementById('contact-location-subtext'),
        mapCaption: document.getElementById('contact-map-caption'),
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

        if (mapImageEl && manifest.mapImage) {
            mapImageEl.src = window.JsgAssets.versionedUrl(manifest.mapImage, assetVersion);
        }

        const mapLabel = await window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.mapLabel, assetVersion));
        if (mapImageEl && mapLabel.trim()) {
            mapImageEl.alt = mapLabel.trim();
        }

        if (mapCaptionEl && !mapCaptionEl.textContent.trim() && textTargets.mapCaption) {
            mapCaptionEl.textContent = textTargets.mapCaption.textContent;
        }
    } catch (error) {
        console.error('Failed to load contact copy:', error);
    }
});
