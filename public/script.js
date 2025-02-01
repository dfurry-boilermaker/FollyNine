// Add fullscreen image viewer functionality
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'fullscreen-container';
    
    // Add image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'fullscreen-image-container';
    
    fullscreenContainer.appendChild(imageContainer);
    document.body.appendChild(fullscreenContainer);

    // Add click handlers to all images
    const images = document.querySelectorAll('.image-container img');
    images.forEach(img => {
        img.addEventListener('click', function() {
            const caption = this.parentElement.querySelector('.image-caption').cloneNode(true);
            imageContainer.innerHTML = '';
            const fullscreenImg = this.cloneNode(true);
            
            fullscreenImg.addEventListener('click', function(e) {
                e.stopPropagation();
                closeFullscreen();
            });
            
            imageContainer.appendChild(fullscreenImg);
            imageContainer.appendChild(caption);
            fullscreenContainer.style.display = 'flex';
            document.body.classList.add('no-scroll');
        });
    });

    // Close handler for fullscreen
    fullscreenContainer.addEventListener('click', function(e) {
        if (e.target === fullscreenContainer) {
            closeFullscreen();
        }
    });

    // Add click handler for about section
    const aboutButton = document.querySelector('.about-button');
    const aboutPopup = document.querySelector('.about-popup');

    if (aboutButton && aboutPopup) {
        aboutButton.addEventListener('click', function(e) {
            e.stopPropagation();
            aboutPopup.style.display = 'flex';
            document.body.classList.add('no-scroll');
        });

        // Close about when clicking anywhere in the popup
        aboutPopup.addEventListener('click', function() {
            closeAbout();
        });
    }

    // Add ESC key handler for both fullscreen and about
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (fullscreenContainer.style.display === 'flex') {
                closeFullscreen();
            }
            if (aboutPopup && aboutPopup.style.display === 'flex') {
                closeAbout();
            }
        }
    });

    function closeFullscreen() {
        fullscreenContainer.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }

    function closeAbout() {
        if (aboutPopup) {
            aboutPopup.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const speckleContainer = document.querySelector('.speckle-container');
    
    if (speckleContainer) {
        speckleContainer.style.zIndex = "9999";
        
        setTimeout(() => {
            speckleContainer.style.zIndex = "-1";
        }, 3000);
    }
}); 