import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getMapsApiKey } from '@/api/functions';
import { toast } from 'sonner';

export default function MapsTesting() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [status, setStatus] = useState({
    isLoading: false,
    isLoaded: false,
    error: null,
    geocodingResult: null,
  });

  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current) return;

    try {
      if (window.google && window.google.maps) {
        const defaultLocation = { lat: -33.8688, lng: 151.2093 };
        mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
          zoom: 13,
          center: defaultLocation,
          mapTypeId: 'roadmap'
        });

        new window.google.maps.Marker({
          position: defaultLocation,
          map: mapInstanceRef.current,
          title: 'Test Vending Machine Location',
        });
        setStatus(prev => ({ ...prev, isLoaded: true, error: null }));
      } else {
        throw new Error('Google Maps script not available.');
      }
    } catch (err) {
      setStatus(prev => ({ ...prev, error: `Map initialization failed: ${err.message}` }));
    }
  }, []);

  const loadGoogleMaps = useCallback(async () => {
    if (window.google && window.google.maps && mapInstanceRef.current) {
        // Already loaded
        return;
    }
    
    setStatus({ isLoading: true, isLoaded: false, error: null, geocodingResult: null });

    try {
      const response = await getMapsApiKey();
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to get API key');
      }
      const apiKey = response.data.apiKey;

      if (document.getElementById('google-maps-script')) {
        await initializeMap();
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        initializeMap();
        setStatus(prev => ({ ...prev, isLoading: false }));
      };
      script.onerror = () => {
        throw new Error('Google Maps script failed to load.');
      };
    } catch (err) {
      setStatus({ isLoading: false, isLoaded: false, error: err.message, geocodingResult: null });
    }
  }, [initializeMap]);


  const testGeocoding = async () => {
    if (!mapInstanceRef.current) {
      toast.error('Map is not initialized yet.');
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const testAddress = 'Sydney Opera House, Sydney NSW, Australia';
      
      geocoder.geocode({ address: testAddress }, (results, geocodeStatus) => {
        if (geocodeStatus === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          mapInstanceRef.current.setCenter(location);
          
          new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: `Geocoded: ${testAddress}`,
          });
          
          const successMessage = `Geocoding success for: ${testAddress}`;
          setStatus(prev => ({ ...prev, geocodingResult: { success: true, message: successMessage }}));
          toast.success(successMessage);
        } else {
          throw new Error(`Geocoding failed: ${geocodeStatus}. This can be a quota or billing issue.`);
        }
      });
    } catch (err) {
      setStatus(prev => ({ ...prev, geocodingResult: { success: false, message: err.message }}));
      toast.error(err.message);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Google Maps Integration Test
          </div>
          <Button 
            onClick={loadGoogleMaps} 
            variant="outline"
            size="sm"
            disabled={status.isLoading}
          >
            {status.isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm mt-2">
          {status.isLoaded ? (
            <div className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /><span>API connected</span></div>
          ) : status.error ? (
            <div className="flex items-center gap-1 text-red-600"><AlertCircle className="w-4 h-4" /><span>Connection failed</span></div>
          ) : status.isLoading ? (
            <span>Testing...</span>
          ) : (
            <span className="text-slate-500">Click "Test Connection" to verify</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Error:</strong> {status.error}
          </div>
        )}
        
        <div 
          ref={mapContainerRef} 
          className="w-full bg-slate-200 rounded-lg border"
          style={{ minHeight: '300px' }}
        />
        
        {status.isLoaded && (
          <div className="flex gap-2">
            <Button 
              onClick={testGeocoding} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test Geocoding (Sydney Opera House)
            </Button>
          </div>
        )}
        
        {status.geocodingResult && (
             <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${status.geocodingResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {status.geocodingResult.success ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                <p>{status.geocodingResult.message}</p>
             </div>
        )}
      </CardContent>
    </Card>
  );
}