(() => {
    const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d", { alpha: true });
    const logoImg = document.getElementById("logoImg");
    const enterBtn = document.getElementById("enterBtn");
    const veil = document.getElementById("veil");

    if (logoImg) logoImg.style.display = "none";

    const DPR_CAP = 1.5;
    let dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

    let W = 0, H = 0;
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        W = Math.floor(window.innerWidth);
        H = Math.floor(window.innerHeight);
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true });

    // Colors
    const C_SOLID = "#1d4ed8";
    const C_WHITE = "#FFFFFF";
    const C_START_BLUE = "#1d4ed8";

    function hexToRgb(hex) {
        const h = hex.replace("#", "");
        let r = 0, g = 0, b = 0;
        if (h.length === 3) {
            r = parseInt(h[0] + h[0], 16);
            g = parseInt(h[1] + h[1], 16);
            b = parseInt(h[2] + h[2], 16);
        } else {
            r = parseInt(h.slice(0, 2), 16);
            g = parseInt(h.slice(2, 4), 16);
            b = parseInt(h.slice(4, 6), 16);
        }
        return { r, g, b };
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function rgbastr(r, g, b, a) {
        return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
    }

    const RGB_BLUE = hexToRgb(C_START_BLUE);
    const RGB_WHITE = hexToRgb(C_WHITE);

    let shards = [];
    let textBounds = { x: 0, y: 0, w: 0, h: 0 };

    // Generate fewer, larger shards from the text
    function generateShards() {
        off.width = W;
        off.height = H;
        offCtx.clearRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2;
        const fontSize = Math.min(W * 0.25, 200);
        offCtx.font = `900 ${Math.floor(fontSize)}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillStyle = C_SOLID;
        offCtx.fillText("JSG", cx, cy);
        // Add stroke to expand sampling area for full coverage
        offCtx.lineWidth = fontSize * 0.15;
        offCtx.strokeStyle = C_SOLID;
        offCtx.strokeText("JSG", cx, cy);

        // Original shard density and size
        const img = offCtx.getImageData(0, 0, W, H).data;
        const step = Math.max(12, Math.floor(Math.min(W, H) / 60));

        shards = [];
        let minX = W, maxX = 0, minY = H, maxY = 0;

        for (let y = 0; y < H; y += step) {
            for (let x = 0; x < W; x += step) {
                const idx = (y * W + x) * 4;
                const a = img[idx + 3];
                if (a > 100) {
                    const i = shards.length;
                    shards.push({
                        x, y,
                        baseX: x, baseY: y,
                        size: 8 + Math.random() * 8, // 8-16px shards
                        rotation: Math.random() * Math.PI * 2,
                        active: false,
                        activeTime: 0,
                        seed: Math.random()
                    });
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        textBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    // Draw a rotated polygon shard with pseudo-3D effect
    function drawShard(ctx, x, y, size, rotation, rotX, rotY, r, g, b, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Pseudo-3D: scale X and Y based on rotation angles
        // This creates a "tumbling" effect as if rotating in 3D
        const scaleX = 0.5 + 0.5 * Math.cos(rotX);
        const scaleY = 0.5 + 0.5 * Math.cos(rotY);
        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = rgbastr(r, g, b, alpha);
        ctx.beginPath();
        // Irregular diamond shape
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.6, 0);
        ctx.lineTo(0, size * 0.8);
        ctx.lineTo(-size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }


    const STAGE = { IDLE: 0, EXPANDING: 1, HOLD: 2, FADE: 3, DONE: 4 };
    let stage = STAGE.IDLE;
    let startTime = 0;
    let stateTime = 0;

    const WAVE_SPEED_FACTOR = 0.35;

    function start() {
        if (prefersReduce) {
            window.location.replace("about.html");
            return;
        }

        veil.style.transition = "none";
        veil.style.background = "rgba(255, 255, 255, 0.0)";

        generateShards();

        if (shards.length === 0) {
            console.warn("No shards generated.");
        }

        if (enterBtn) {
            enterBtn.style.opacity = 0;
            enterBtn.style.pointerEvents = "none";
        }

        enterState(STAGE.EXPANDING);
        requestAnimationFrame(loop);
    }

    function enterState(s) {
        stage = s;
        stateTime = performance.now();

        if (s === STAGE.EXPANDING) {
            startTime = stateTime;
        }
        if (s === STAGE.FADE) {
            overlayWhiteout(1.0);
        }
    }

    function loop(now) {
        try {
            if (stage === STAGE.DONE) return;

            const dt = Math.max(0, (now - startTime) / 1000);
            const cx = W / 2, cy = H / 2;

            if (stage === STAGE.EXPANDING || stage === STAGE.HOLD || stage === STAGE.FADE) {
                ctx.clearRect(0, 0, W, H);

                let waveRadius = 0;
                if (stage === STAGE.EXPANDING) {
                    const waveSpeed = Math.max(W, H) * WAVE_SPEED_FACTOR;
                    waveRadius = dt * waveSpeed;
                } else {
                    waveRadius = Math.max(W, H) * 2;
                }

                // --- LAYER 1: SOLID TEXT ---
                ctx.save();
                const fontSize = Math.min(W * 0.25, 200);
                ctx.font = `900 ${Math.floor(fontSize)}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = C_SOLID;
                ctx.fillText("JSG", cx, cy);
                ctx.restore();

                // --- LAYER 2: SHARDS ---
                let completedCount = 0;
                const activeShards = [];

                // First pass: activate shards and collect active ones
                if (shards.length > 0) {
                    for (let i = 0; i < shards.length; i++) {
                        const p = shards[i];
                        const dx = p.x - cx;
                        const dy = p.y - cy;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist <= waveRadius) {
                            if (!p.active) {
                                p.active = true;
                                p.activeTime = dt;
                            }

                            const tActive = dt - p.activeTime;
                            const DURATION = 1.5;
                            p.progress = Math.min(1.0, Math.max(0, tActive / DURATION));

                            if (p.progress >= 1.0) completedCount++;
                            activeShards.push(p);
                        }
                    }

                    // Draw shards
                    for (const p of activeShards) {
                        const r = lerp(RGB_BLUE.r, RGB_WHITE.r, p.progress);
                        const g = lerp(RGB_BLUE.g, RGB_WHITE.g, p.progress);
                        const b = lerp(RGB_BLUE.b, RGB_WHITE.b, p.progress);

                        const tActive = dt - p.activeTime;
                        // 2D rotation
                        const rotationOffset = tActive * 0.3;
                        // Pseudo-3D rotation angles (each shard has unique spin speed)
                        const rotX = tActive * (1.5 + p.seed * 2);
                        const rotY = tActive * (1.2 + p.seed * 1.5);

                        drawShard(ctx, p.x, p.y, p.size, p.rotation + rotationOffset, rotX, rotY, r, g, b, 1.0);
                    }
                }

                // State Transitions
                const TIMEOUT_LIMIT = 5.0;

                if (stage === STAGE.EXPANDING) {
                    let readyToHold = false;
                    if (shards.length > 0) {
                        if (completedCount >= shards.length * 0.95 || dt > 4.0) readyToHold = true;
                    } else {
                        if (dt > 2.0) readyToHold = true;
                    }

                    if (readyToHold) {
                        enterState(STAGE.HOLD);
                    }
                } else if (stage === STAGE.HOLD) {
                    if (now - stateTime > 800) {
                        enterState(STAGE.FADE);
                    }
                } else if (stage === STAGE.FADE) {
                    if (now - stateTime > 600 || dt > TIMEOUT_LIMIT + 2) {
                        forceRedirect();
                    }
                }
            }

            if (dt > 8.0) forceRedirect();

            if (stage !== STAGE.DONE) requestAnimationFrame(loop);

        } catch (e) {
            console.error(e);
            forceRedirect();
        }
    }

    function forceRedirect() {
        if (stage === STAGE.DONE) return;
        stage = STAGE.DONE;
        window.location.href = "about.html";
    }

    function overlayWhiteout(alpha) {
        veil.style.transition = "background 0.5s linear";
        veil.style.background = `rgba(255,255,255,${alpha})`;
    }

    function initialRender() {
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);
        const fontSize = Math.min(W * 0.25, 200);
        ctx.font = `900 ${Math.floor(fontSize)}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = C_SOLID;
        ctx.fillText("JSG", cx, cy);
    }

    setTimeout(() => {
        initialRender();
        window.addEventListener("resize", () => {
            if (stage === STAGE.IDLE) initialRender();
        });
    }, 100);

    if (enterBtn) {
        enterBtn.addEventListener("click", () => start(), { passive: true });
    }
    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter") start();
        if (e.key === "Escape") window.location.replace("about.html");
    });

})();
