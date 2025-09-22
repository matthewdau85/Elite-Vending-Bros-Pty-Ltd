import React from 'react';

// Font optimization component to preload critical fonts and prevent FOIT/FOUT
const FontOptimizer = () => {
  React.useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      {
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        as: 'style',
        crossOrigin: 'anonymous'
      }
    ];

    fontPreloads.forEach(({ href, as, crossOrigin }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
      
      // Load the actual stylesheet after preload
      setTimeout(() => {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = href;
        if (crossOrigin) stylesheet.crossOrigin = crossOrigin;
        document.head.appendChild(stylesheet);
      }, 100);
    });

    // Add font-display swap to existing fonts
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      
      /* Optimize system font stack as fallback */
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      /* Prevent layout shift with consistent sizing */
      .font-loading {
        visibility: hidden;
      }
      
      .fonts-loaded {
        visibility: visible;
      }
    `;
    document.head.appendChild(style);

    // Font loading detection
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
        document.body.classList.remove('font-loading');
      });
    }

    return () => {
      // Cleanup is handled automatically by the browser
    };
  }, []);

  return null;
};

export default FontOptimizer;