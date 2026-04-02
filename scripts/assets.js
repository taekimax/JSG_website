(function () {
    const normalizeNewlines = (value) => String(value || '').replace(/\r\n/g, '\n');

    const shouldBypassCache = (() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.has('nocache');
        } catch {
            return false;
        }
    })();

    const splitParagraphs = (text) => {
        const normalized = normalizeNewlines(text);
        return normalized
            .split(/\n\s*\n/g)
            .map(part => part.trim())
            .filter(Boolean);
    };

    const versionedUrl = (url, assetVersion) => {
        const raw = String(url || '').trim();
        const version = String(assetVersion || '').trim();
        if (!raw || !version) return raw;
        const separator = raw.includes('?') ? '&' : '?';
        return `${raw}${separator}v=${encodeURIComponent(version)}`;
    };

    const absoluteUrl = (url) => {
        const raw = String(url || '').trim();
        if (!raw) return raw;

        try {
            return new URL(raw, window.location.href).href;
        } catch {
            return raw;
        }
    };

    const fetchJson = async (url) => {
        const response = await fetch(url, { cache: shouldBypassCache ? 'no-store' : 'no-cache' });
        if (!response.ok) throw new Error(`Failed to fetch JSON: ${url} (${response.status})`);
        return response.json();
    };

    const fetchText = async (url) => {
        const response = await fetch(url, { cache: shouldBypassCache ? 'no-store' : 'default' });
        if (!response.ok) throw new Error(`Failed to fetch text: ${url} (${response.status})`);
        return response.text();
    };

    const setText = (element, text) => {
        if (!element) return;
        element.textContent = String(text || '');
    };

    const renderParagraphs = (container, text, { className } = {}) => {
        if (!container) return;
        container.innerHTML = '';

        for (const paragraph of splitParagraphs(text)) {
            const p = document.createElement('p');
            if (className) p.className = className;
            p.textContent = paragraph;
            container.appendChild(p);
        }
    };

    const setHeroImage = (surface, image, heroImageUrl, assetVersion) => {
        if (!heroImageUrl) return;
        const versioned = versionedUrl(heroImageUrl, assetVersion);
        const resolved = absoluteUrl(versioned);
        if (image) image.src = versioned;
        if (surface) surface.style.setProperty('--hero-image', `url('${resolved}')`);
    };

    window.JsgAssets = {
        fetchJson,
        fetchText,
        renderParagraphs,
        absoluteUrl,
        setHeroImage,
        setText,
        splitParagraphs,
        versionedUrl
    };
})();
