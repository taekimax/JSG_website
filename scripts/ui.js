document.addEventListener('DOMContentLoaded', () => {
    const sheetOverlay = document.createElement('div');
    sheetOverlay.className = 'sheet-overlay';
    document.body.appendChild(sheetOverlay);

    const sheet = document.querySelector('.section-sheet');
    const toggleBtn = document.getElementById('sheet-toggle');

    if (!sheet || !toggleBtn) return;

    function toggleSheet() {
        const isActive = sheet.classList.contains('active');
        if (isActive) {
            closeSheet();
        } else {
            openSheet();
        }
    }

    function openSheet() {
        sheet.classList.add('active');
        sheetOverlay.classList.add('active');
    }

    function closeSheet() {
        sheet.classList.remove('active');
        sheetOverlay.classList.remove('active');
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSheet();
    });

    sheetOverlay.addEventListener('click', closeSheet);

    // Close on escape
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSheet();
    });

    // Active Navigation Highlight
    const currentPath = window.location.pathname;
    const effectivePath = currentPath.endsWith('team-member.html')
        ? currentPath.replace(/team-member\.html$/, 'team.html')
        : currentPath;
    const navLinks = document.querySelectorAll('.desktop-nav a');

    navLinks.forEach(link => {
        // Get the link's href attribute (e.g., "about.html" or "about.html#section")
        const linkPath = link.getAttribute('href');

        // Simple check: if current path ends with the link path
        // This handles cases like "/about.html" matching "about.html"
        // Also handles root "/" matching "index.html" if we want, but usually logo handles home.
        if (effectivePath.endsWith(linkPath) && linkPath !== '/') {
            link.classList.add('current');
        } else if (currentPath === '/' || currentPath.endsWith('index.html')) {
            // Optional: if we had a "Home" link, but we don't in the nav list typically.
        }
    });
});
