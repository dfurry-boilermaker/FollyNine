// Vercel Analytics and Speed Insights initialization
// Enhanced version with better error handling and debugging

(function() {
  const DEBUG = true; // Set to false in production
  
  function log(message, data) {
    if (DEBUG) {
      console.log('[Vercel Analytics]', message, data || '');
    }
  }

  function logError(message, error) {
    console.error('[Vercel Analytics Error]', message, error || '');
  }

  // Initialize analytics queue immediately
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };

  // Load analytics script
  function loadAnalyticsScript() {
    log('Attempting to load analytics script...');
    
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    
    script.onload = function() {
      log('Analytics script loaded successfully');
    };
    
    script.onerror = function() {
      logError('Failed to load analytics script from /_vercel/insights/script.js');
      logError('This usually means:');
      logError('1. Analytics is not enabled in Vercel dashboard');
      logError('2. Site needs to be redeployed after enabling analytics');
      logError('3. The /_vercel/insights route is not available');
    };
    
    document.head.appendChild(script);
    log('Analytics script tag added to head');
  }

  // Load speed insights script
  function loadSpeedInsightsScript() {
    log('Attempting to load speed insights script...');
    
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    
    script.onload = function() {
      log('Speed Insights script loaded successfully');
    };
    
    script.onerror = function() {
      logError('Failed to load speed insights script');
    };
    
    document.head.appendChild(script);
    log('Speed Insights script tag added to head');
  }

  // Check if we're on Vercel
  function isVercelDeployment() {
    const hostname = window.location.hostname;
    return hostname.includes('vercel.app') || 
           hostname.includes('vercel.sh') || 
           hostname.includes('now.sh');
  }

  // Main initialization
  function init() {
    log('Initializing Vercel Analytics...');
    log('Hostname:', window.location.hostname);
    log('Is Vercel deployment:', isVercelDeployment());
    
    // Always try to load, even on custom domains
    // Vercel should provide the endpoints if analytics is enabled
    loadAnalyticsScript();
    loadSpeedInsightsScript();
    
    // Verify after a delay
    setTimeout(function() {
      if (window.va && typeof window.va === 'function') {
        log('Analytics queue initialized successfully');
        log('Queue length:', window.vaq ? window.vaq.length : 0);
      } else {
        logError('Analytics queue not properly initialized');
      }
    }, 1000);
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
