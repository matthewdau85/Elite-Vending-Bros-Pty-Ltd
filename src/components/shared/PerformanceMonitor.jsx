import React, { useEffect } from 'react';
import { logger } from '../lib/logger';

// Performance monitoring component to track Core Web Vitals
const PerformanceMonitor = () => {
  useEffect(() => {
    // Web Vitals monitoring
    const reportWebVitals = (metric) => {
      logger.timing(`WebVital: ${metric.name}`, metric.value, {
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType
      });
      
      // Report to analytics if enabled
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    };

    // Dynamic import of web-vitals to avoid blocking
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    }).catch(error => {
      logger.warn('Failed to load web-vitals', { error });
    });

    // Monitor bundle size and loading performance
    const measureBundleSize = () => {
      if (performance.getEntriesByType) {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(r => r.name.includes('.js'));
        const cssResources = resources.filter(r => r.name.includes('.css'));
        
        const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        
        logger.info('Bundle Analysis', {
          jsSize: `${Math.round(totalJSSize / 1024)}KB`,
          cssSize: `${Math.round(totalCSSSize / 1024)}KB`,
          totalResources: resources.length,
          jsResources: jsResources.length
        });
      }
    };

    // Measure after initial load
    setTimeout(measureBundleSize, 3000);

    // Monitor memory usage
    const monitorMemory = () => {
      if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        
        if (usagePercent > 70) {
          logger.warn('High memory usage detected', {
            usedMB: Math.round(usedJSHeapSize / 1024 / 1024),
            totalMB: Math.round(totalJSHeapSize / 1024 / 1024),
            usagePercent: Math.round(usagePercent)
          });
        }
      }
    };

    const memoryInterval = setInterval(monitorMemory, 30000); // Check every 30s

    // Monitor long tasks that block the main thread
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            logger.warn('Long task detected', {
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
              name: entry.name
            });
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        logger.debug('Long task observer not supported');
      }

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return null;
};

export default PerformanceMonitor;