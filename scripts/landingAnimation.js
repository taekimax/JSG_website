(() => {
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d", { alpha: true });
    const enterBtn = document.getElementById("enterBtn");

    const DPR_CAP = 1.5;
    let dpr = 1;
    let W = 0, H = 0;
    let fontSize = 180;
    let shards = [];

    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true });

    const C_SOLID = "#1d4ed8";
    const C_WHITE = "#ffffff";

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

    const RGB_BLUE = hexToRgb(C_SOLID);
    const RGB_WHITE = hexToRgb(C_WHITE);

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
        W = Math.max(1, Math.floor(window.innerWidth));
        H = Math.max(1, Math.floor(window.innerHeight));
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fontSize = Math.min(W * 0.32, 240);
        generateShards();
    }

    function generateShards() {
        off.width = W;
        off.height = H;
        offCtx.clearRect(0, 0, W, H);

        const cx = W / 2;
        const cy = H / 2;
        offCtx.font = `900 ${Math.floor(fontSize)}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillStyle = C_SOLID;
        offCtx.fillText("JSG", cx, cy);
        offCtx.lineWidth = fontSize * 0.12;
        offCtx.strokeStyle = C_SOLID;
        offCtx.strokeText("JSG", cx, cy);

        const img = offCtx.getImageData(0, 0, W, H).data;
        const step = Math.max(10, Math.floor(Math.min(W, H) / 55));

        shards = [];
        for (let y = 0; y < H; y += step) {
            for (let x = 0; x < W; x += step) {
                const idx = (y * W + x) * 4;
                const a = img[idx + 3];
                if (a > 100) {
                    shards.push({
                        x,
                        y,
                        size: 8 + Math.random() * 10,
                        rotation: Math.random() * Math.PI * 2,
                        seed: Math.random()
                    });
                }
            }
        }
    }

    function drawShard(x, y, size, rotation, rotX, rotY, r, g, b, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(0.6 + 0.4 * Math.cos(rotX), 0.6 + 0.4 * Math.cos(rotY));
        ctx.fillStyle = rgbastr(r, g, b, alpha);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.6, 0);
        ctx.lineTo(0, size * 0.8);
        ctx.lineTo(-size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    let running = true;

    function loop(now) {
        if (!running) return;
        const t = now * 0.001;
        const cx = W / 2;
        const cy = H / 2;

        ctx.clearRect(0, 0, W, H);

        ctx.save();
        ctx.font = `900 ${Math.floor(fontSize)}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(190, 220, 255, 0.55)";
        ctx.shadowBlur = 22;
        const grad = ctx.createLinearGradient(cx - fontSize, cy - fontSize, cx + fontSize, cy + fontSize);
        grad.addColorStop(0, "rgba(225, 238, 255, 0.98)");
        grad.addColorStop(0.45, "rgba(149, 188, 255, 1)");
        grad.addColorStop(1, "rgba(52, 108, 255, 0.98)");
        ctx.fillStyle = grad;
        ctx.fillText("JSG", cx, cy);
        ctx.restore();

        for (const p of shards) {
            const spin = t * (0.7 + p.seed * 1.0);
            const shimmer = 0.28 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.05 + p.seed * Math.PI * 2));
            const darkBias = 0.8;
            const r = lerp(RGB_BLUE.r * darkBias, RGB_WHITE.r, shimmer);
            const g = lerp(RGB_BLUE.g * darkBias, RGB_WHITE.g, shimmer);
            const b = lerp(RGB_BLUE.b * darkBias, RGB_WHITE.b, shimmer);
            drawShard(p.x, p.y, p.size, p.rotation + spin, spin * 1.1, spin * 0.9, r, g, b, 0.92);
        }

        requestAnimationFrame(loop);
    }

    function navigateToAbout() {
        running = false;
        window.location.href = "about.html";
    }

    resize();
    requestAnimationFrame(loop);

    if (enterBtn) {
        enterBtn.addEventListener("click", navigateToAbout, { passive: true });
    }
    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter") navigateToAbout();
        if (e.key === "Escape") window.location.replace("about.html");
    });

})();
