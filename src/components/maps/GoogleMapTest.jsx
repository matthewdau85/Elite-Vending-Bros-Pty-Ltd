import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function GoogleMapTest() {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        // Note: API key should be set in your Base44 secrets as GOOGLE_MAPS_API_KEY
        // For security, we'll load it from the backend or use a placeholder
        const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
        
        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          initializeMap();
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps. Please check your API key is correctly configured.');
        };
        
        document.head.appendChild(script);
      } catch (err) {
        setError(`Error loading Google Maps: ${err.message}`);
      }
    };

    const initializeMap = () => {
      try {
        if (!window.google || !window.google.maps) {
          setError('Google Maps API not available');
          return;
        }

        // Default to Sydney CBD (you can change this to your first location)
        const defaultLocation = { lat: -33.8688, lng: 151.2093 };
        
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: defaultLocation,
          mapTypeId: 'roadmap'
        });

        // Add a test marker
        new window.google.maps.Marker({
          position: defaultLocation,
          map: mapInstance,
          title: 'Test Vending Machine Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22c55e"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 24)
          }
        });

        setMap(mapInstance);
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        setError(`Error initializing map: ${err.message}`);
      }
    };

    loadGoogleMaps();
  }, []);

  const testGeocoding = async () => {
    if (!window.google || !window.google.maps) {
      setError('Google Maps not loaded');
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const testAddress = 'Sydney Opera House, Sydney NSW, Australia';
      
      geocoder.geocode({ address: testAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          
          new window.google.maps.Marker({
            position: location,
            map: map,
            title: 'Geocoded Location: ' + testAddress,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3b82f6"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 24)
            }
          });
          
          alert(`✅ Geocoding Success!\nAddress: ${testAddress}\nCoordinates: ${location.lat()}, ${location.lng()}`);
        } else {
          setError(`Geocoding failed: ${status}`);
        }
      });
    } catch (err) {
      setError(`Geocoding error: ${err.message}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Google Maps API Test
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          {isLoaded ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Maps API loaded successfully</span>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Maps API failed to load</span>
            </>
          ) : (
            <span className="text-blue-600">Loading Maps API...</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <strong>⚠️ Setup Required:</strong> Replace 'YOUR_GOOGLE_MAPS_API_KEY_HERE' on line 22 with your actual Google Maps API key, or we'll create a backend function to handle this securely.
        </div>
        
        <div 
          ref={mapRef} 
          className="w-full h-64 bg-slate-200 rounded-lg border"
          style={{ minHeight: '300px' }}
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Reload Test
          </Button>
          <Button 
            onClick={testGeocoding} 
            disabled={!isLoaded}
            size="sm"
          >
            Test Geocoding
          </Button>
        </div>
        
        <div className="text-xs text-slate-500 space-y-1">
          <p><strong>Test Status:</strong></p>
          <p>• Map Display: {isLoaded ? '✅ Working' : '❌ Failed'}</p>
          <p>• API Key: {error ? '❌ Issue detected' : '✅ Valid'}</p>
          <p>• Markers: {isLoaded ? '✅ Green marker should be visible' : '⏳ Waiting for map'}</p>
        </div>
      </CardContent>
    </Card>
  );
}