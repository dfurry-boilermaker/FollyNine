document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const SPECKLE_COUNT = 2000;
    const MIN_SPEED = 0.1;
    const MAX_SPEED = 0.3;
    const MIN_RANGE = 30;
    const MAX_RANGE = 80;
    
    // Create container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '300vh';
    container.style.zIndex = '9999';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    
    // Create speckles
    const fragment = document.createDocumentFragment();
    const speckles = [];
    
    for (let i = 0; i < SPECKLE_COUNT; i++) {
        const speckle = createSpeckle();
        fragment.appendChild(speckle.element);
        speckles.push(speckle);
    }
    
    container.appendChild(fragment);
    
    // Initial animation and transition
    animateSpecklesIn();
    setTimeout(transitionSpecklesBehind, 3000);
    
    // Start the continuous animation
    requestAnimationFrame(animate);
    
    // Helper Functions
    function createSpeckle() {
        const element = document.createElement('div');
        const size = getSpeckleSize();
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * container.offsetHeight;
        
        setupSpeckleStyles(element, size, x, y);
        
        return {
            element,
            speedX: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
            speedY: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
            rangeX: MIN_RANGE + Math.random() * (MAX_RANGE - MIN_RANGE),
            rangeY: MIN_RANGE + Math.random() * (MAX_RANGE - MIN_RANGE),
            time: Math.random() * 1000,
            x: 0,
            y: 0,
            baseLeft: x,
            baseTop: y
        };
    }
    
    function setupSpeckleStyles(element, size, x, y) {
        Object.assign(element.style, {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'transform 1.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease',
            transform: `translate3d(${Math.random() * 100 - 50}px, -100vh, 0)`,
            opacity: '0',
            left: `${x}px`,
            top: `${y}px`
        });
    }
    
    function animateSpecklesIn() {
        speckles.forEach(speckle => {
            setTimeout(() => {
                speckle.element.style.opacity = '1';
                speckle.element.style.transform = 'translate3d(0, 0, 0)';
            }, Math.random() * 1000);
        });
    }
    
    function transitionSpecklesBehind() {
        // First fade out
        speckles.forEach(speckle => {
            speckle.element.style.transition = 'opacity 0.5s ease';
            speckle.element.style.opacity = '0';
        });
        
        // Move behind and fade back in
        setTimeout(() => {
            container.style.zIndex = '-1';
            speckles.forEach(speckle => {
                // Only transition the opacity, let the animation loop handle movement
                speckle.element.style.transition = 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)';
                speckle.element.style.opacity = '1';
                
                // Adjust the base position instead of using transform
                speckle.baseLeft += Math.random() * 50 - 25;
                speckle.baseTop += Math.random() * 50 + 50;
            });
        }, 500);
    }
    
    // Animation loop
    let lastTime = performance.now();
    
    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) * 0.001;
        lastTime = currentTime;
        
        speckles.forEach(speckle => {
            speckle.time += deltaTime;
            const t = speckle.time * 0.5;
            
            speckle.x = Math.sin(t * speckle.speedX) * speckle.rangeX +
                       Math.cos(t * speckle.speedX * 0.5) * speckle.rangeX * 0.5;
            speckle.y = Math.cos(t * speckle.speedY) * speckle.rangeY +
                       Math.sin(t * speckle.speedY * 0.5) * speckle.rangeY * 0.5;
            
            speckle.element.style.transform = `translate3d(${speckle.x}px, ${speckle.y}px, 0)`;
        });
        
        requestAnimationFrame(animate);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newSize = getSpeckleSize();
        speckles.forEach(speckle => {
            speckle.element.style.width = `${newSize}px`;
            speckle.element.style.height = `${newSize}px`;
        });
    });
    
    function getSpeckleSize() {
        const screenWidth = window.innerWidth;
        if (screenWidth > 1920) return 3;
        if (screenWidth > 1280) return 2.5;
        if (screenWidth > 768) return 2;
        return 1.5;
    }
});