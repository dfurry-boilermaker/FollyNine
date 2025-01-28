// Add fullscreen image viewer functionality
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'fullscreen-container';
    
    // Add close button
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
            imageContainer.appendChild(this.cloneNode(true));
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

    function closeFullscreen() {
        fullscreenContainer.style.display = 'none';
        document.body.style.overflow = '';
    }
}); 