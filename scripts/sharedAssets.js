document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/shared/shared-manifest.json');
        const assetVersion = manifest.assetVersion;

        const logoPath = String(manifest.logo || '').trim();
        if (!logoPath) return;

        const versionedLogo = window.JsgAssets.versionedUrl(logoPath, assetVersion);

        document.querySelectorAll('img').forEach(img => {
            const src = String(img.getAttribute('src') || '').trim();
            if (!src) return;
            if (src === logoPath || src.startsWith(`${logoPath}?`)) img.src = versionedLogo;
        });

        document.querySelectorAll(`[style*="${logoPath}"]`).forEach(element => {
            element.style.setProperty('--hero-image', `url('${versionedLogo}')`);
        });
    } catch (error) {
        console.error('Failed to load shared assets manifest:', error);
    }
});

