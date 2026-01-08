// Initialize Vercel Analytics and Speed Insights
(async () => {
  try {
    // Import and inject Vercel Analytics
    const analytics = await import('/node_modules/@vercel/analytics/dist/index.mjs');
    analytics.inject();
    
    // Import and inject Vercel Speed Insights
    const speedInsights = await import('/node_modules/@vercel/speed-insights/dist/index.mjs');
    speedInsights.injectSpeedInsights();
  } catch (error) {
    // Silently fail in development or if packages aren't available
    // Vercel will auto-inject these scripts on deployment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.error('Failed to initialize Vercel Analytics:', error);
    }
  }
})();
