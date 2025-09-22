import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, MapPin, Coffee, AlertTriangle, RefreshCw } from 'lucide-react';
import { getMapsApiKey } from '@/api/functions';

export default function LiveMapWidget({ machines, locations, isLoading }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  const [error, setError] = useState(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current || mapInstance.current) return;

    try {
      setMapStatus('loading');
      
      // Get API key
      const response = await getMapsApiKey();
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to get API key');
      }

      // Load Google Maps if not already loaded
      if (!window.google) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${response.data.apiKey}`;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Initialize map
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: -33.8688, lng: 151.2093 },
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Add markers
      const bounds = new window.google.maps.LatLngBounds();
      let markersAdded = 0;

      machines.forEach(machine => {
        const location = locations.find(loc => loc.id === machine.location_id);
        if (location && location.latitude && location.longitude) {
          const marker = new window.google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: mapInstance.current,
            title: `Machine ${machine.machine_id} - ${location.name}`,
          });

          bounds.extend(marker.getPosition());
          markersAdded++;
        }
      });

      if (markersAdded > 0) {
        mapInstance.current.fitBounds(bounds);
      }

      setMapStatus('loaded');
    } catch (err) {
      setError(err.message);
      setMapStatus('error');
    }
  }, [machines, locations]);

  useEffect(() => {
    if (!isLoading && machines.length > 0 && locations.length > 0) {
      initMap();
    }
  }, [isLoading, machines.length, locations.length, initMap]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5"/>
            Live Machine Status Map
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading map data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mapStatus === 'error') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5"/>
            Live Machine Status Map
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-2">Map failed to load</p>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <Button onClick={() => { mapInstance.current = null; initMap(); }}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5"/>
          Live Machine Status Map
        </CardTitle>
        <CardDescription>
          Real-time view of all your vending machines across locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef}
          className="w-full h-[400px] bg-slate-100 rounded-lg border"
        />
        
        {/* Status indicators */}
        <div className="flex justify-center items-center gap-6 text-sm mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Online ({machines.filter(m => m.status === 'online').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Offline ({machines.filter(m => m.status === 'offline').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Maintenance ({machines.filter(m => m.status === 'maintenance').length})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}