// Add fullscreen image viewer functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create fullscreen container
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'fullscreen-container';
    document.body.appendChild(fullscreenContainer);

    // Add click handlers to all images
    const images = document.querySelectorAll('.image-container img');
    images.forEach(img => {
        img.addEventListener('click', function() {
            fullscreenContainer.innerHTML = `<img src="${this.src}" alt="${this.alt}">`;
            fullscreenContainer.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close fullscreen on click
    fullscreenContainer.addEventListener('click', function() {
        this.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    });
}); 