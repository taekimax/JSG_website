document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const stage = document.querySelector('.landing-stage');
    if (!stage) return;

    const kickerEl = stage.querySelector('.hero-kicker');
    const statementEls = stage.querySelectorAll('.hero-statement');
    const variantButtons = stage.querySelectorAll('[data-landing-variant]');
    const enterBtn = document.getElementById('enterBtn');

    if (!kickerEl || statementEls.length < 2 || !enterBtn) return;

    const syncVariantButtons = () => {
        const activeVariant = stage.dataset.variant || 'aurora';
        variantButtons.forEach((button) => {
            const isActive = button.dataset.landingVariant === activeVariant;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    syncVariantButtons();
    stage.addEventListener('landingvariantchange', syncVariantButtons);

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/landing/landing-manifest.json');
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};

        const [kicker, leadKo, leadEn, ctaLabel, ctaSub] = await Promise.all([
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroKicker, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroLead, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.heroSub, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.ctaLabel, assetVersion)),
            window.JsgAssets.fetchText(window.JsgAssets.versionedUrl(texts.ctaSub, assetVersion))
        ]);

        window.JsgAssets.setText(kickerEl, kicker.trim());
        window.JsgAssets.setText(statementEls[0], leadKo.trim());
        window.JsgAssets.setText(statementEls[1], leadEn.trim());

        enterBtn.textContent = '';
        [ctaLabel, ctaSub].forEach((label) => {
            const span = document.createElement('span');
            span.className = 'enter-btn-label';
            span.textContent = label.trim();
            enterBtn.appendChild(span);
        });
    } catch (error) {
        console.error('Failed to load landing copy:', error);
    }
});
