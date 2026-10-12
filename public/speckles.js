document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.className = 'speckle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles = [];
    let width = 0;
    let height = 0;
    let frame = null;
    let lastDraw = 0;

    function draw(time = 0) {
        context.clearRect(0, 0, width, height);
        context.fillStyle = 'rgba(250, 249, 246, 0.3)';
        for (const particle of particles) {
            const drift = reducedMotion.matches ? 0 : Math.sin(time * 0.0001 + particle.phase) * 8;
            context.beginPath();
            context.arc(particle.x * width + drift, particle.y * height + drift, particle.size, 0, Math.PI * 2);
            context.fill();
        }
    }

    function animate(time) {
        frame = null;
        if (document.hidden || reducedMotion.matches) return;
        if (time - lastDraw >= 1000 / 30) {
            draw(time);
            lastDraw = time;
        }
        frame = requestAnimationFrame(animate);
    }

    function updateAnimation() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        lastDraw = 0;
        if (document.hidden) return;
        draw();
        if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = width <= 768 ? 60 : 180;
        particles = Array.from({ length: count }, () => ({
            x: Math.random(), y: Math.random(), size: 0.5 + Math.random() * 0.7, phase: Math.random() * Math.PI * 2
        }));
        updateAnimation();
    }

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', updateAnimation);
    reducedMotion.addEventListener('change', updateAnimation);
    resize();
});
