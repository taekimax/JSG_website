document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const kickerEl = document.querySelector('.hero-panel .hero-kicker');
    if (!kickerEl) return;

    const leadEl = document.querySelector('.hero-panel .hero-lead');
    const subEl = document.querySelector('.hero-panel .hero-sub');
    const enterBtn = document.getElementById('enterBtn');

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/landing/landing-manifest.json');
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};

        const [kicker, lead, sub, ctaLabel, ctaSub] = await Promise.all([
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroKicker, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroLead, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroSub, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.ctaLabel, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.ctaSub, assetVersion))
        ]);

        window.JsgAssets.setText(kickerEl, kicker.trim());
        window.JsgAssets.setText(leadEl, lead.trim());
        window.JsgAssets.setText(subEl, sub.trim());

        if (enterBtn) {
            enterBtn.textContent = '';
            enterBtn.appendChild(document.createTextNode(`${ctaLabel.trim()}\n`));

            const small = document.createElement('small');
            small.textContent = ctaSub.trim();
            enterBtn.appendChild(small);
        }
    } catch (error) {
        console.error('Failed to load landing copy:', error);
    }
});
