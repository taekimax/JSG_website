(() => {
    const stage = document.querySelector('.landing-stage');
    const app = document.getElementById('app');
    const canvas = document.getElementById('c');
    const wordmark = document.querySelector('.hero-wordmark');
    const enterBtn = document.getElementById('enterBtn');
    const variantButtons = Array.from(document.querySelectorAll('[data-landing-variant]'));

    if (!stage || !canvas || !wordmark || !enterBtn) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const DPR_CAP = 1.5;
    const TAU = Math.PI * 2;
    const PARTICLE_COUNT = 240;
    const STAR_COUNT = 160;
    const CONNECTION_STEP = 13;
    const VARIANTS = {
        aurora: {
            fillA: '#020712',
            fillB: '#081325',
            nebula: 'rgba(90, 144, 255, 0.22)',
            glow: 'rgba(255, 219, 154, 0.22)',
            particle: '#f4d6a4',
            particleB: '#8bb8ff',
            line: 'rgba(129, 171, 255, 0.2)'
        },
        mirror: {
            fillA: '#02060f',
            fillB: '#0a1322',
            nebula: 'rgba(246, 210, 144, 0.18)',
            glow: 'rgba(245, 195, 101, 0.25)',
            particle: '#f7d18e',
            particleB: '#d6ecff',
            line: 'rgba(247, 209, 142, 0.18)'
        },
        lattice: {
            fillA: '#02060f',
            fillB: '#07111f',
            nebula: 'rgba(87, 174, 225, 0.16)',
            glow: 'rgba(117, 207, 255, 0.18)',
            particle: '#b4e8ff',
            particleB: '#88a7ff',
            line: 'rgba(141, 214, 255, 0.18)'
        }
    };

    let dpr = 1;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let revealStart = performance.now();
    let running = true;
    let stars = [];
    let particles = [];

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function easeOutCubic(value) {
        return 1 - Math.pow(1 - value, 3);
    }

    function currentVariant() {
        return stage.dataset.variant || 'aurora';
    }

    function hexToRgb(hex) {
        const clean = String(hex).replace('#', '');
        return {
            r: parseInt(clean.slice(0, 2), 16),
            g: parseInt(clean.slice(2, 4), 16),
            b: parseInt(clean.slice(4, 6), 16)
        };
    }

    function mixColor(a, b, t, alpha) {
        const colorA = hexToRgb(a);
        const colorB = hexToRgb(b);
        const r = Math.round(colorA.r + (colorB.r - colorA.r) * t);
        const g = Math.round(colorA.g + (colorB.g - colorA.g) * t);
        const bValue = Math.round(colorA.b + (colorB.b - colorA.b) * t);
        return `rgba(${r}, ${g}, ${bValue}, ${alpha})`;
    }

    function createStars() {
        stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random(),
            y: Math.random(),
            depth: Math.random(),
            size: 0.6 + Math.random() * 1.8,
            twinkle: Math.random() * TAU,
            drift: (Math.random() - 0.5) * 0.0018
        }));
    }

    function createParticle(index) {
        const band = index % 3;
        const lane = Math.floor(index / 3);

        return {
            band,
            lane,
            seed: Math.random(),
            theta: Math.random() * TAU,
            spin: 0.14 + Math.random() * 0.32,
            radius: 90 + Math.random() * 280,
            depth: -320 + Math.random() * 640,
            size: 1.4 + Math.random() * 3.4,
            startX: (Math.random() - 0.5) * width * 1.6,
            startY: (Math.random() - 0.5) * height * 1.3,
            startZ: 360 + Math.random() * 820,
            pulse: Math.random() * TAU
        };
    }

    function reseedParticles() {
        particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => createParticle(index));
        revealStart = performance.now();
        stage.classList.remove('is-revealed');
        requestAnimationFrame(() => stage.classList.add('is-revealed'));
    }

    function refreshMetrics() {
        const rect = wordmark.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        width = Math.max(1, Math.floor(window.innerWidth));
        height = Math.max(1, Math.floor(window.innerHeight));
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        refreshMetrics();
        createStars();
        reseedParticles();
    }

    function getVariantTarget(particle, timeSeconds, variantName) {
        const orbitTime = timeSeconds * (particle.spin + particle.seed * 0.16);

        if (variantName === 'mirror') {
            const column = (particle.lane % 9) - 4;
            const row = Math.floor(particle.lane / 9) - 4;
            const spacing = 48;
            const wave = Math.sin(orbitTime * 1.4 + particle.seed * TAU) * 16;
            return {
                x: column * spacing + (row % 2 === 0 ? 0 : spacing * 0.5),
                y: row * spacing * 0.88 - 28 + wave * 0.42,
                z: Math.cos(orbitTime + column * 0.34) * 140 + particle.band * 56
            };
        }

        if (variantName === 'lattice') {
            const laneFactor = (particle.lane % 20) / 19;
            const layer = Math.floor(particle.lane / 20) - 3;
            return {
                x: (laneFactor - 0.5) * 520 + Math.sin(orbitTime * 1.7 + particle.seed * 8) * 16,
                y: layer * 56 + Math.cos(orbitTime * 1.15 + laneFactor * TAU) * 24 - 14,
                z: Math.sin(orbitTime * 1.3 + layer) * 180 + Math.cos(laneFactor * TAU) * 90
            };
        }

        return {
            x: Math.cos(particle.theta + orbitTime) * (particle.radius + Math.sin(orbitTime * 0.6) * 24),
            y: Math.sin(particle.theta * 1.25 + orbitTime * 1.2) * 102 + Math.cos(orbitTime * 0.72 + particle.seed * TAU) * 34 - 16,
            z: Math.cos(particle.theta + orbitTime * 0.8) * 220 + particle.band * 38
        };
    }

    function projectPoint(point) {
        const focalLength = Math.min(width, height) * 0.9;
        const depthOffset = 760;
        const scale = focalLength / (focalLength + point.z + depthOffset);
        return {
            x: centerX + point.x * scale,
            y: centerY + point.y * scale,
            scale
        };
    }

    function paintBackdrop(config) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, config.fillA);
        gradient.addColorStop(1, config.fillB);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const nebula = ctx.createRadialGradient(centerX, centerY - height * 0.18, 0, centerX, centerY - height * 0.12, Math.max(width, height) * 0.75);
        nebula.addColorStop(0, config.nebula);
        nebula.addColorStop(0.58, 'rgba(18, 28, 48, 0.08)');
        nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, width, height);
    }

    function drawStars(timeSeconds) {
        for (const star of stars) {
            const x = (star.x * width + timeSeconds * width * star.drift + width) % width;
            const y = star.y * height;
            const alpha = 0.24 + (0.5 + 0.5 * Math.sin(timeSeconds * 1.8 + star.twinkle)) * 0.45;
            const radius = star.size * (0.8 + star.depth * 0.9);

            ctx.fillStyle = `rgba(229, 239, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, TAU);
            ctx.fill();

            if (radius > 1.4) {
                ctx.strokeStyle = `rgba(255, 240, 208, ${alpha * 0.35})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x - radius * 3.4, y);
                ctx.lineTo(x + radius * 3.4, y);
                ctx.moveTo(x, y - radius * 3.4);
                ctx.lineTo(x, y + radius * 3.4);
                ctx.stroke();
            }
        }
    }

    function drawParticles(timeSeconds) {
        const variantName = currentVariant();
        const config = VARIANTS[variantName] || VARIANTS.aurora;
        const revealProgress = easeOutCubic(clamp((performance.now() - revealStart) / 1800, 0, 1));
        const projected = [];

        const halo = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.22);
        halo.addColorStop(0, config.glow);
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.22, 0, TAU);
        ctx.fill();

        particles.forEach((particle, index) => {
            const target = getVariantTarget(particle, timeSeconds, variantName);
            const x = particle.startX + (target.x - particle.startX) * revealProgress;
            const y = particle.startY + (target.y - particle.startY) * revealProgress;
            const z = particle.startZ + (target.z - particle.startZ) * revealProgress;
            const point = projectPoint({ x, y, z });
            const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(timeSeconds * 2.2 + particle.pulse));
            const size = particle.size * point.scale * (0.92 + twinkle * 0.6);

            projected.push({ ...point, index, size });

            ctx.fillStyle = mixColor(config.particle, config.particleB, twinkle * 0.65, 0.42 + point.scale * 0.56);
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(0.8, size), 0, TAU);
            ctx.fill();
        });

        ctx.lineWidth = 1;
        for (let index = 0; index < projected.length; index += 1) {
            const start = projected[index];
            const end = projected[(index + CONNECTION_STEP) % projected.length];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const distance = Math.hypot(dx, dy);
            if (distance > Math.min(width, height) * 0.28) continue;

            ctx.strokeStyle = config.line;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    function loop(now) {
        if (!running) return;

        refreshMetrics();

        const timeSeconds = now * 0.001;
        paintBackdrop(VARIANTS[currentVariant()] || VARIANTS.aurora);
        drawStars(timeSeconds);
        drawParticles(timeSeconds);

        requestAnimationFrame(loop);
    }

    function syncButtons(nextVariant) {
        variantButtons.forEach((button) => {
            const isActive = button.dataset.landingVariant === nextVariant;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function setVariant(nextVariant) {
        if (!Object.hasOwn(VARIANTS, nextVariant)) return;
        stage.dataset.variant = nextVariant;
        if (app) app.dataset.variant = nextVariant;
        syncButtons(nextVariant);
        reseedParticles();
        stage.dispatchEvent(new CustomEvent('landingvariantchange', {
            bubbles: true,
            detail: { variant: nextVariant }
        }));
    }

    function navigateToAbout() {
        running = false;
        window.location.href = "about.html";
    }

    variantButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setVariant(button.dataset.landingVariant || 'aurora');
        });
    });

    enterBtn.addEventListener('click', navigateToAbout, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') navigateToAbout();
    });

    stage.classList.add('is-revealed');
    resize();
    syncButtons(currentVariant());
    requestAnimationFrame(loop);
})();
