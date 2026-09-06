document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const mapImageEl = document.getElementById('contact-map-image');
    const textTargets = {
        heroKicker: document.getElementById('contact-hero-kicker'),
        addressLabel: document.getElementById('contact-address-label'),
        locationAddress: document.getElementById('contact-location-address'),
        locationAddressEn: document.getElementById('contact-location-address-en'),
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

    } catch (error) {
        console.error('Failed to load contact copy:', error);
    } finally {
        const section = document.getElementById('contact');
        if (section) {
            section.setAttribute('data-content-ready', 'true');
            section.dispatchEvent(new Event('jsg:section-ready', { bubbles: true }));
        }
    }
});
