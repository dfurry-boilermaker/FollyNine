document.addEventListener('DOMContentLoaded', () => {
    const aboutButton = document.querySelector('.about-button');
    const aboutPopup = document.getElementById('aboutPopup');
    const closeButton = document.querySelector('.close-button');

    console.log('About button:', aboutButton);  // Debug log
    console.log('About popup:', aboutPopup);    // Debug log
    console.log('Close button:', closeButton);  // Debug log

    if (!aboutButton || !aboutPopup || !closeButton) {
        console.error('Missing elements!');
        return;
    }

    // About button click handler
    aboutButton.addEventListener('click', () => {
        console.log('About button clicked');  // Debug log
        aboutPopup.classList.add('active');
    });

    // Close button handler
    closeButton.addEventListener('click', () => {
        console.log('Close button clicked');  // Debug log
        aboutPopup.classList.remove('active');
    });

    // Click outside to close
    aboutPopup.addEventListener('click', (e) => {
        if (e.target === aboutPopup) {
            console.log('Clicked outside popup');  // Debug log
            aboutPopup.classList.remove('active');
        }
    });
});