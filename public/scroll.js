// Progress bar functionality
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('.progress-bar');
    
    // Update progress bar width based on scroll position
    window.addEventListener('scroll', () => {
        // Calculate how far down the page we've scrolled
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        
        // Update progress bar width
        progressBar.style.width = scrolled + '%';
    });
}); 