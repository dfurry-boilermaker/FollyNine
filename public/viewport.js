// Update viewport height variable
const updateViewportHeight = () => {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update speckles container height
    const specklesContainer = document.querySelector('[style*="position: fixed"]');
    if (specklesContainer) {
        specklesContainer.style.height = `${300 * vh}px`;
    }
};

// Initial set on load
document.addEventListener('DOMContentLoaded', () => {
    updateViewportHeight();
});

// Update on resize
window.addEventListener('resize', () => {
    updateViewportHeight();
});

// Update on orientation change
window.addEventListener('orientationchange', () => {
    updateViewportHeight();
}); 