// Vercel Analytics and Speed Insights initialization
// This script uses the inject function for static HTML sites

(function() {
  // Only run in production (on Vercel)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }

  // Try to load and inject analytics
  const loadAnalytics = async () => {
    try {
      // For Vercel deployments, try to use the inject function
      // First, try the Vercel-provided script endpoint
      if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel.sh')) {
        // Initialize queue
        window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
        
        // Load Vercel's analytics script
        const script = document.createElement('script');
        script.defer = true;
        script.src = '/_vercel/insights/script.js';
        document.head.appendChild(script);
        
        // Also try to load speed insights
        const speedScript = document.createElement('script');
        speedScript.defer = true;
        speedScript.src = '/_vercel/speed-insights/script.js';
        document.head.appendChild(speedScript);
      } else {
        // For custom domains, try using the inject function from the package
        // This requires the package to be available
        console.warn('Vercel Analytics: Custom domain detected. Ensure analytics is enabled in Vercel dashboard.');
      }
    } catch (error) {
      console.error('Failed to initialize Vercel Analytics:', error);
    }
  };

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAnalytics);
  } else {
    loadAnalytics();
  }
})();
