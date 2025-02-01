// Add fullscreen image viewer functionality
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'fullscreen-container';
    
    // Add close button with updated format
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'x'; 
    
    // Add image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'fullscreen-image-container';
    
    fullscreenContainer.appendChild(closeButton);
    fullscreenContainer.appendChild(imageContainer);
    document.body.appendChild(fullscreenContainer);

    // Add click handlers to all images
    const images = document.querySelectorAll('.image-container img');
    images.forEach(img => {
        img.addEventListener('click', function() {
            const caption = this.parentElement.querySelector('.image-caption').cloneNode(true);
            imageContainer.innerHTML = '';
            const fullscreenImg = this.cloneNode(true);
            
            // Add click handler to fullscreen image
            fullscreenImg.addEventListener('click', function(e) {
                e.stopPropagation();  // Prevent double-closing
                closeFullscreen();
            });
            
            imageContainer.appendChild(fullscreenImg);
            imageContainer.appendChild(caption);
            fullscreenContainer.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close handlers
    closeButton.addEventListener('click', closeFullscreen);
    fullscreenContainer.addEventListener('click', function(e) {
        if (e.target === fullscreenContainer) {
            closeFullscreen();
        }
    });

    // Add ESC key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && fullscreenContainer.style.display === 'flex') {
            closeFullscreen();
        }
    });

    function closeFullscreen() {
        fullscreenContainer.style.display = 'none';
        document.body.style.overflow = '';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const speckleContainer = document.querySelector('.speckle-container');
    
    // Ensure speckles start in front
    if (speckleContainer) {
        speckleContainer.style.zIndex = "9999";
        
        // Move behind after delay
        setTimeout(() => {
            speckleContainer.style.zIndex = "-1";
        }, 3000);
    }
}); 