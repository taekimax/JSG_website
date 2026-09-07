document.addEventListener('DOMContentLoaded', async () => {
    if (!window.JsgAssets) return;

    const hero = (document.getElementById('philosophy') || document).querySelector('.page-hero');
    const kickerEl = hero?.querySelector('.page-hero-kicker');
    if (!kickerEl) return;

    const heroLeadEls = hero.querySelectorAll('.page-hero-sub');
    const cards = document.querySelectorAll('.philosophy-card');

    try {
        const manifest = await window.JsgAssets.fetchJson('assets/philosophy/philosophy-manifest.json');
        const assetVersion = manifest.assetVersion;
        const texts = manifest.texts || {};

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
        await renderPhilosophyWriting();
    } catch (error) {
        console.error('Failed to load philosophy copy:', error);
    } finally {
        const section = document.getElementById('philosophy');
        if (section) {
            section.setAttribute('data-content-ready', 'true');
            section.dispatchEvent(new Event('jsg:section-ready', { bubbles: true }));
        }
    }
});

// Substack owns published titles. The separate content repository publishes the saved RSS index.
async function renderPhilosophyWriting() {
    const section = document.getElementById('perspective');
    const app = document.getElementById('perspective-posts');
    if (!section || !app) return;
    try {
        const endpoints = await window.JsgAssets.fetchJson('assets/shared/board-endpoints.json');
        if (!endpoints.perspectiveManifest) throw new Error('Missing Perspective manifest endpoint');
        const manifest = await window.JsgAssets.fetchJson(endpoints.perspectiveManifest);
        const data = await window.JsgAssets.fetchJson(window.JsgAssets.versionedUrl(manifest.postsJson, manifest.assetVersion));
        if (data.schemaVersion !== 1 || !Array.isArray(data.posts)) throw new Error('Invalid Perspective index');
        let posts = data.posts;
        const preview = data.preview === true;
        const seen = new Set();
        posts = posts.filter(post => {
            if (typeof post.title !== 'string' || !post.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) return false;
            if (!preview) {
                try {
                    const url = new URL(post.url);
                    if (url.protocol !== 'https:' || url.username || url.password || url.origin !== new URL(data.publicationUrl).origin || !/^\/p\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) || seen.has(url.href)) return false;
                    seen.add(url.href);
                } catch { return false; }
            }
            return true;
        }).sort((a, b) => b.date.localeCompare(a.date));
        app.replaceChildren();
        if (!posts.length) {
            app.textContent = '아직 등록된 글이 없습니다.';
            return;
        }
        const list = document.createElement('div');
        list.className = 'notice-list';
        for (const post of posts) {
            const item = document.createElement('article');
            item.className = 'notice-record-item';
            const header = document.createElement('header');
            header.className = 'notice-record-item-header';
            const link = document.createElement('a');
            link.className = 'notice-link';
            link.href = preview ? post.url : new URL(post.url).href;
            link.textContent = post.title;
            header.append(link);
            const meta = document.createElement('div');
            meta.className = 'notice-meta';
            const date = document.createElement('time');
            date.className = 'notice-date';
            date.dateTime = post.date;
            date.textContent = post.date;
            meta.append(date);
            if (typeof post.author === 'string' && post.author.trim()) {
                const author = document.createElement('span');
                author.className = 'notice-category';
                author.textContent = post.author.trim();
                meta.append(author);
            }
            item.append(header, meta);
            list.append(item);
        }
        app.append(list);
        window.JsgBoardPager?.enhance(section, list);
    } catch (error) {
        app.textContent = '글 목록을 불러올 수 없습니다.';
        console.error('Failed to load Perspective index:', error);
    }
}
