import React, { useState } from 'react';

const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  sizes = '100vw',
  priority = false,
  placeholder = 'blur',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate responsive srcset for better performance
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    // For external images, we can't generate different sizes
    // In a real app, you'd use a service like Cloudinary or imgix
    const sizes = [320, 640, 960, 1280, 1920];
    
    if (baseSrc.includes('unsplash.com')) {
      return sizes
        .map(size => `${baseSrc}?w=${size}&auto=format&fit=crop&q=75 ${size}w`)
        .join(', ');
    }
    
    return baseSrc;
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div 
        className={`bg-slate-200 flex items-center justify-center text-slate-500 text-sm ${className}`}
        style={{ width, height }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-slate-200 animate-pulse rounded ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...props}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;