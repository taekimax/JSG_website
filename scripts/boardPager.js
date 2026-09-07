// A page is a group of existing records; their copy, order and links stay intact.
window.JsgBoardPager = {
    enhance(section, list) {
        if (!section || !list || list.dataset.paged) return;
        const records = [...list.children];
        const heading = section.querySelector('.page-hero-text');
        if (!records.length || !heading) return;

        list.dataset.paged = 'true';
        section.classList.add('board-paged');
        const label = section.getAttribute('aria-label') || section.id;
        const storageKey = `jsg-board-${section.id}`;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const viewport = document.createElement('div');
        viewport.className = 'board-window';
        viewport.id = `${section.id}-pages`;
        viewport.tabIndex = 0;
        viewport.setAttribute('role', 'group');
        viewport.setAttribute('aria-roledescription', 'carousel');
        viewport.setAttribute('aria-label', label);
        list.replaceWith(viewport);

        const pages = [];
        for (let start = 0; start < records.length; start += 5) {
            const page = document.createElement('div');
            page.className = `${list.className} board-page`;
            page.setAttribute('role', 'group');
            page.setAttribute('aria-roledescription', 'slide');
            page.setAttribute('aria-label', `${pages.length + 1} / ${Math.ceil(records.length / 5)}`);
            page.append(...records.slice(start, start + 5));
            viewport.append(page);
            pages.push(page);
        }

        const controls = document.createElement('div');
        controls.className = 'board-controls';
        const makeButton = (direction) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `board-arrow board-arrow--${direction}`;
            const chevron = document.createElement('span');
            chevron.className = 'board-arrow-chevron';
            chevron.setAttribute('aria-hidden', 'true');
            chevron.textContent = direction === 'prev' ? '‹' : '›';
            button.append(chevron);
            button.setAttribute('aria-label', `${direction === 'prev' ? 'Previous' : 'Next'} ${label} page`);
            button.setAttribute('aria-controls', viewport.id);
            return button;
        };
        const previous = makeButton('prev');
        const next = makeButton('next');
        const count = document.createElement('span');
        count.className = 'board-count';
        count.setAttribute('role', 'status');
        count.setAttribute('aria-atomic', 'true');
        controls.append(previous, count, next);
        heading.append(controls);

        let current = 0;
        try {
            const saved = Number(sessionStorage.getItem(storageKey));
            if (Number.isInteger(saved)) current = Math.max(0, Math.min(pages.length - 1, saved));
        } catch { /* Paging also works when session storage is unavailable. */ }

        const update = (pageIndex) => {
            current = pageIndex;
            count.textContent = `${current + 1} / ${pages.length}`;
            count.setAttribute('aria-label', `${label}: page ${current + 1} of ${pages.length}`);
            previous.setAttribute('aria-disabled', String(current === 0));
            next.setAttribute('aria-disabled', String(current === pages.length - 1));
            pages.forEach((page, index) => {
                // Keep off-screen links out of keyboard and screen-reader navigation.
                if (index !== current && page.contains(document.activeElement)) viewport.focus({ preventScroll: true });
                page.inert = index !== current;
                page.setAttribute('aria-hidden', String(index !== current));
            });
            try { sessionStorage.setItem(storageKey, String(current)); } catch { /* Optional restoration. */ }
        };
        const go = (pageIndex) => {
            const target = Math.max(0, Math.min(pages.length - 1, pageIndex));
            update(target);
            viewport.scrollTo({ left: target * viewport.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
        };
        previous.addEventListener('click', () => { if (current > 0) go(current - 1); });
        next.addEventListener('click', () => { if (current < pages.length - 1) go(current + 1); });
        viewport.addEventListener('keydown', event => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault();
            go(current + (event.key === 'ArrowRight' ? 1 : -1));
        });

        let settleTimer;
        viewport.addEventListener('scroll', () => {
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => {
                if (viewport.clientWidth) update(Math.max(0, Math.min(pages.length - 1, Math.round(viewport.scrollLeft / viewport.clientWidth))));
            }, 120);
        }, { passive: true });

        let width = 0;
        const resize = () => {
            if (viewport.clientWidth !== width) {
                width = viewport.clientWidth;
                viewport.scrollTo({ left: current * width, behavior: 'instant' });
            }
        };
        update(current);
        const observer = new ResizeObserver(resize);
        observer.observe(section);
        observer.observe(viewport);
        resize();
    }
};
