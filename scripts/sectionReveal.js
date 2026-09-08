// Keep the short scroll hold without viewport-fixed layers that Safari may tint into its browser bars.
document.addEventListener('DOMContentLoaded', () => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const tracks = [...document.querySelectorAll('.curtain-track')];
    let frame = 0;
    const update = () => {
        frame = 0;
        const samples = tracks.map(track => {
            const style = getComputedStyle(track);
            const hold = parseFloat(style.getPropertyValue('--curtain-hold')) || 0;
            const inset = parseFloat(style.getPropertyValue('--curtain-safe-top')) || 0;
            return motion.matches ? 0 : Math.min(hold, Math.max(0, inset - track.getBoundingClientRect().top));
        });
        tracks.forEach((track, index) => track.style.setProperty('--curtain-shift', `${samples[index]}px`));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    document.documentElement.classList.add('js-section-reveal');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
});
