document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const nav = document.getElementById('primary-navigation');
    const toggle = document.querySelector('.menu-toggle');
    if (!header || !nav || !toggle) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const links = [...nav.querySelectorAll('a')];
    const path = window.location.pathname;
    const page = path.endsWith('team-member.html') ? 'team.html'
        : path.endsWith('/') || path.endsWith('index.html') ? 'about.html'
        : path.split('/').pop();

    const sections = links.map(link => document.getElementById(new URL(link.href).hash.slice(1))).filter(Boolean);
    const setCurrent = (section) => links.forEach(link => {
        if (new URL(link.href).hash === `#${section}`) {
            link.setAttribute('aria-current', sections.length ? 'location' : 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
    setCurrent(page.replace('.html', ''));
    let revealHash = () => {};
    if (sections.length) {
        let scheduled = false;
        const updateSection = () => {
            scheduled = false;
            const line = 48;
            const current = sections.filter(section => section.getBoundingClientRect().top <= line).at(-1) || sections[0];
            setCurrent(current.id);
        };
        window.addEventListener('scroll', () => {
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(updateSection);
            }
        }, { passive: true });
        window.addEventListener('resize', updateSection);
        let revealFrame;
        revealHash = () => {
            cancelAnimationFrame(revealFrame);
            revealFrame = requestAnimationFrame(() => {
                const target = sections.find(section => `#${section.id}` === location.hash);
                target?.scrollIntoView({ block: 'start' });
                target?.focus({ preventScroll: true });
                updateSection();
            });
        };
        window.addEventListener('hashchange', revealHash);
        window.addEventListener('popstate', revealHash);
        let initialHash = location.hash;
        const finishInitialScroll = () => {
            if (!sections.every(section => section.getAttribute('data-content-ready') === 'true')) return;
            if (initialHash && initialHash === location.hash) revealHash();
            initialHash = '';
            document.removeEventListener('jsg:section-ready', finishInitialScroll);
        };
        document.addEventListener('jsg:section-ready', finishInitialScroll);
        for (const type of ['wheel', 'touchmove', 'keydown', 'pointerdown']) {
            document.addEventListener(type, () => { initialHash = ''; }, { once: true, passive: true });
        }
        window.addEventListener('load', updateSection);
        new ResizeObserver(updateSection).observe(document.querySelector('main'));
        updateSection();
    }

    const closeMenu = (restoreFocus = false) => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        nav.classList.toggle('is-open', !open);
        toggle.setAttribute('aria-expanded', String(!open));
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            closeMenu(true);
        }
    });

    document.addEventListener('click', event => {
        if (!header.contains(event.target)) closeMenu();
    });

    document.addEventListener('focusin', event => {
        if (!header.contains(event.target)) closeMenu();
    });

    links.forEach(link => link.addEventListener('click', event => {
        closeMenu();
        if (!sections.length || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        location.hash = new URL(link.href).hash;
        revealHash();
    }));
    desktop.addEventListener('change', () => {
        const focusedLink = nav.contains(document.activeElement);
        closeMenu(!desktop.matches && focusedLink);
        if (desktop.matches && document.activeElement === toggle) {
            (nav.querySelector('[aria-current]') || links[0])?.focus();
        }
    });

    document.documentElement.classList.add('js-navigation');
});
