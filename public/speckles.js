document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const SPECKLE_COUNT = 2000;
    const MIN_SPEED = 0.1;
    const MAX_SPEED = 0.4;
    const MIN_RANGE = 15;
    const MAX_RANGE = 45;
    
    // Create container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '300vh';
    container.style.zIndex = '3';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    
    // Calculate speckle size based on screen width
    const getSpeckleSize = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth > 1920) return 3; // Large screens
        if (screenWidth > 1280) return 2.5; // Medium-large screens
        if (screenWidth > 768) return 2; // Medium screens
        return 1.5; // Small screens
    };
    
    // Create speckles with dynamic size
    const fragment = document.createDocumentFragment();
    const speckles = [];
    
    for (let i = 0; i < SPECKLE_COUNT; i++) {
        const speckle = document.createElement('div');
        const size = getSpeckleSize();
        
        speckle.style.position = 'absolute';
        speckle.style.width = `${size}px`;
        speckle.style.height = `${size}px`;
        speckle.style.backgroundColor = 'white';
        speckle.style.borderRadius = '50%';
        speckle.style.transition = 'opacity 0.3s ease';
        
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (container.offsetHeight);
        
        speckle.style.left = `${x}px`;
        speckle.style.top = `${y}px`;
        
        fragment.appendChild(speckle);
        
        speckles.push({
            element: speckle,
            speedX: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
            speedY: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
            rangeX: MIN_RANGE + Math.random() * (MAX_RANGE - MIN_RANGE),
            rangeY: MIN_RANGE + Math.random() * (MAX_RANGE - MIN_RANGE),
            time: Math.random() * 1000,
            x: 0,
            y: 0,
            baseLeft: x,
            baseTop: y,
            originalTop: y
        });
    }
    
    container.appendChild(fragment);
    
    // Update speckle sizes on window resize
    window.addEventListener('resize', () => {
        const newSize = getSpeckleSize();
        speckles.forEach(speckle => {
            speckle.element.style.width = `${newSize}px`;
            speckle.element.style.height = `${newSize}px`;
        });
    });
    
    // Updated selector to include both top and mid image containers
    const imageContainers = document.querySelectorAll('.image-container, .mid-image-container');
    
    imageContainers.forEach(imgContainer => {
        imgContainer.addEventListener('mouseenter', () => {
            const rect = imgContainer.getBoundingClientRect();
            
            speckles.forEach(speckle => {
                const currentX = speckle.baseLeft + speckle.x;
                const currentY = speckle.baseTop + speckle.y;
                
                if (currentX >= rect.left && 
                    currentX <= rect.right && 
                    currentY >= rect.top && 
                    currentY <= rect.bottom) {
                    speckle.element.style.opacity = '0';
                }
            });
        });
        
        imgContainer.addEventListener('mouseleave', () => {
            speckles.forEach(speckle => {
                speckle.element.style.opacity = '1';
            });
        });
    });
    
    // Animation loop
    let lastTime = performance.now();
    
    function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) * 0.001;
        lastTime = currentTime;
        
        speckles.forEach(speckle => {
            speckle.time += deltaTime;
            
            speckle.x = Math.sin(speckle.time * speckle.speedX) * speckle.rangeX +
                       Math.sin(speckle.time * speckle.speedX * 0.5) * speckle.rangeX * 0.3;
            speckle.y = Math.cos(speckle.time * speckle.speedY) * speckle.rangeY +
                       Math.cos(speckle.time * speckle.speedY * 0.5) * speckle.rangeY * 0.3;
            
            speckle.element.style.transform = `translate3d(${speckle.x}px, ${speckle.y}px, 0)`;
        });
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
    
    // Popup functionality
    const aboutButton = document.querySelector('.about-button');
    const popup = document.getElementById('aboutPopup');
    const closeButton = document.querySelector('.close-button');

    aboutButton.addEventListener('click', () => {
        popup.classList.add('active');
    });

    closeButton.addEventListener('click', () => {
        popup.classList.remove('active');
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('active');
        }
    });
});