// Shared native scrolling for Team and Portfolio. Default speed is 58.5 CSS pixels per second.
const DEFAULT_CAROUSEL_SPEED = 0.0585;
window.JsgCarousel = ({ viewport, button, group, randomStart = false, speed = DEFAULT_CAROUSEL_SPEED }) => {
    // Keep the accessible group between identical buffers for bidirectional wrapping.
    const buffer = group.nextElementSibling.cloneNode(true);
    group.before(buffer);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let width = group.getBoundingClientRect().width;
    const cards = Array.from(group.children);
    const startCard = cards[randomStart ? Math.floor(Math.random() * cards.length) : 0];
    let scrollPosition = width + startCard.getBoundingClientRect().left - group.getBoundingClientRect().left;
    viewport.scrollLeft = scrollPosition;
    let lastWrittenPosition = viewport.scrollLeft;
    const wrap = (position) => width > 0
        ? width + ((position - width) % width + width) % width
        : position;
    const writePosition = (position) => {
        scrollPosition = wrap(position);
        viewport.scrollLeft = scrollPosition;
        lastWrittenPosition = viewport.scrollLeft;
    };
    viewport.addEventListener('scroll', () => {
        // Preserve fractional animation progress when browsers round scrollLeft.
        if (viewport.scrollLeft !== lastWrittenPosition) writePosition(viewport.scrollLeft);
    }, { passive: true });
    new ResizeObserver(() => {
        const nextWidth = group.getBoundingClientRect().width;
        if (nextWidth > 0 && width > 0) scrollPosition = scrollPosition / width * nextWidth;
        width = nextWidth;
        writePosition(scrollPosition);
    }).observe(group);
    const updateButton = () => {
        button.setAttribute('aria-pressed', String(paused));
        const label = `${paused ? 'Play' : 'Pause'} ${button.id === 'partners-motion-toggle' ? 'Partners' : 'Portfolio'} carousel`;
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
    };
    const step = (time) => {
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0;
        previousTime = time;
        if (width > 0) {
            writePosition(scrollPosition + elapsed * speed);
        }
        frame = requestAnimationFrame(step);
    };
    const updateMotion = () => {
        cancelAnimationFrame(frame);
        previousTime = 0;
        scrollPosition = viewport.scrollLeft;
        if (!paused && visible) frame = requestAnimationFrame(step);
        updateButton();
    };
    const pause = () => { paused = true; updateMotion(); };
    button.addEventListener('click', () => { paused = !paused; updateMotion(); });
    viewport.addEventListener('pointerdown', pause, { passive: true });
    viewport.addEventListener('wheel', pause, { passive: true });
    viewport.addEventListener('focusin', pause);
    motion.addEventListener('change', () => { paused = motion.matches; updateMotion(); });
    new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        updateMotion();
    }).observe(viewport);
    updateButton();
};
