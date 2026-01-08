# Vercel Analytics Debugging Guide

## Current Setup
- ✅ `@vercel/analytics` package installed (v1.6.1)
- ✅ `@vercel/speed-insights` package installed (v1.1.0)
- ✅ Analytics initialization script added to `index.html`
- ✅ Debug page created at `/analytics-debug.html`

## Steps to Debug

### 1. Check if Analytics is Enabled in Vercel Dashboard
- Go to your Vercel project dashboard
- Click on "Analytics" tab
- Ensure "Web Analytics" is enabled (should show "Enabled" status)
- If not enabled, click "Enable" and then **redeploy your site**

### 2. Verify Deployment
After enabling analytics, you MUST redeploy:
- Go to Deployments tab
- Click "Redeploy" on the latest deployment
- Or push a new commit to trigger deployment

### 3. Test the Debug Page
Visit: `https://your-site.vercel.app/analytics-debug.html`

This page will show:
- ✓ If analytics queue is initialized
- ✓ If the script loads successfully
- ✗ Any errors or missing components

### 4. Check Browser Console
1. Open your site in a browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for messages starting with `[Vercel Analytics]`
5. Check for any errors

### 5. Check Network Tab
1. Open Developer Tools → Network tab
2. Refresh the page
3. Filter for "insights"
4. Look for requests to:
   - `/_vercel/insights/script.js`
   - `/_vercel/insights/view`
   - `/_vercel/speed-insights/script.js`

**If you see 404 errors:**
- Analytics is not enabled in dashboard
- Site needs to be redeployed after enabling
- The `/_vercel/insights/*` routes are not available

**If you see 200 status:**
- Scripts are loading correctly
- Check if data appears in dashboard (may take a few minutes)

### 6. Common Issues

#### Issue: Script returns 404
**Solution:** 
- Enable Analytics in Vercel dashboard
- Redeploy the site
- Wait a few minutes for routes to be created

#### Issue: No data in dashboard
**Possible causes:**
- Ad blockers blocking analytics
- Analytics not enabled
- Not enough time has passed (data can take 5-10 minutes)
- Using a custom domain that needs configuration

#### Issue: Works on vercel.app but not custom domain
**Solution:**
- Ensure custom domain is properly configured
- Analytics should work on custom domains if enabled
- Check DNS settings

## Alternative: Check Vercel's Built-in Analytics

Some Vercel plans include basic analytics that don't require code:
1. Go to Vercel Dashboard → Your Project
2. Check the "Analytics" tab
3. You might see basic visitor data even without code integration

## Next Steps

1. **Enable Analytics** in Vercel dashboard (if not already)
2. **Redeploy** your site
3. **Visit** `/analytics-debug.html` to see what's working
4. **Check** browser console for detailed logs
5. **Wait** 5-10 minutes for data to appear in dashboard

If still not working after these steps, the issue might be:
- Vercel plan limitations (check if your plan includes analytics)
- Configuration issue with vercel.json
- Need to contact Vercel support
