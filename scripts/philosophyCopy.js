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
        await renderPhilosophyWriting(manifest);
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

// One publication, with a locally generated title index. No external feed requests in the browser.
async function renderPhilosophyWriting(manifest) {
    const section = document.getElementById('philosophy-writing');
    const app = document.getElementById('writing-posts');
    const publicationLink = document.getElementById('writing-publication');
    if (!section || !app || !publicationLink || !manifest.postsJson) return;
    const publicUrl = (value) => {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' && !url.username && !url.password ? url : null;
        } catch { return null; }
    };
    try {
        const data = await window.JsgAssets.fetchJson(window.JsgAssets.versionedUrl(manifest.postsJson, manifest.assetVersion));
        const publication = publicUrl(data.publicationUrl);
        if (data.schemaVersion !== 1 || !publication || !Array.isArray(data.posts)) return;
        const seen = new Set();
        const posts = data.posts.filter(post => {
            const url = publicUrl(post.url);
            if (!url || url.origin !== publication.origin || typeof post.title !== 'string' || !post.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(post.date) || seen.has(url.href)) return false;
            seen.add(url.href);
            return true;
        }).sort((a, b) => b.date.localeCompare(a.date));
        publicationLink.href = publication.href;
        app.replaceChildren();
        if (!posts.length) {
            const empty = document.createElement('p');
            empty.textContent = '아직 등록된 글이 없습니다.';
            app.appendChild(empty);
        } else {
            const list = document.createElement('ul');
            for (const post of posts) {
                const item = document.createElement('li');
                item.className = 'writing-item';
                const link = document.createElement('a');
                link.className = 'writing-link';
                link.href = publicUrl(post.url).href;
                const date = document.createElement('time');
                date.className = 'writing-date';
                date.dateTime = post.date;
                date.textContent = post.date;
                const title = document.createElement('span');
                title.className = 'writing-title';
                title.textContent = post.title;
                link.append(date, title);
                item.appendChild(link);
                list.appendChild(item);
            }
            app.appendChild(list);
        }
        section.hidden = false;
    } catch (error) {
        console.error('Failed to load writing index:', error);
    }
}
