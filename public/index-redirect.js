// This script helps ensure navigation works properly with SPA routing
// It's added to index.html and runs on page load
(function() {
  console.log('Running redirect script, path:', window.location.pathname);
  
  // Skip processing for asset files and paths with file extensions
  if (window.location.pathname.startsWith('/assets/') || 
      window.location.pathname.includes('.') && 
      !window.location.pathname.endsWith('.html')) {
    return;
  }
  
  // Determine if we need a direct path redirect for non-root SPA paths
  const needsPathFix = window.location.pathname !== '/' && 
                      !window.location.pathname.startsWith('/assets/') &&
                      !window.location.pathname.includes('.') &&
                      !window.location.hash;
                      
  // Check if we're at any direct non-root path that should be handled by Vue Router
  if (needsPathFix) {
    // If this is a direct URL access to a route, the SPA should handle it
    // Don't redirect, as the _redirects file will handle this on the server side
    // This prevents double redirects and allows direct route access
    console.log('Non-root SPA path detected, continuing with regular load:', window.location.pathname);
    return;
  }
  
  // Handle root path with no route (/) 
  if (window.location.pathname === '/' && !window.location.hash) {
    console.log('Root path with no route detected...');
    
    try {
      // Check for Supabase auth session in a more reliable way
      const storageKey = 'obsidian-template-creator-auth';
      const authData = localStorage.getItem(storageKey);
      
      if (authData) {
        // Parse the auth data to check if it's valid
        try {
          const parsed = JSON.parse(authData);
          const hasValidSession = parsed && 
                                 parsed.currentSession && 
                                 parsed.currentSession.expires_at && 
                                 new Date(parsed.currentSession.expires_at * 1000) > new Date();
          
          if (hasValidSession) {
            console.log('Valid auth session found, redirecting to dashboard');
            // Use router navigation instead of direct replacement for better SPA handling
            window.location.href = '/dashboard';
            return;
          }
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
      
      // No valid session found, redirect to the appropriate page
      console.log('No valid auth session found, redirecting to home page for auth check');
      // Use HomeRedirect component by going to root, which will properly determine
      // auth state through the Supabase client
      return;
      
    } catch (error) {
      console.error('Error checking auth state:', error);
      // On any error, let the application handle authentication
      return;
    }
  }
})();