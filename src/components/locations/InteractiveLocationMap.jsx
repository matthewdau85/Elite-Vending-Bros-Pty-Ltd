
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Coffee, Building, Loader2 } from 'lucide-react';
import { getMapsApiKey } from '@/api/functions';

export default function InteractiveLocationMap({ locations, machines, onLocationUpdate, isLoading }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getMachineCountForLocation = useCallback((locationId) => {
    return machines.filter(m => m.location_id === locationId).length;
  }, [machines]);

  const getLocationStatus = useCallback((locationId) => {
    const locationMachines = machines.filter(m => m.location_id === locationId);
    if (locationMachines.length === 0) return 'no-machines';
    
    const onlineMachines = locationMachines.filter(m => m.status === 'online').length;
    const offlineMachines = locationMachines.filter(m => m.status === 'offline').length;
    
    if (offlineMachines > 0) return 'has-offline';
    if (onlineMachines > 0) return 'all-online';
    return 'maintenance';
  }, [machines]);

  const getMarkerIcon = useCallback((location) => {
    const status = getLocationStatus(location.id);
    const machineCount = getMachineCountForLocation(location.id);
    
    let color = '#6b7280'; // gray
    if (status === 'all-online') color = '#22c55e'; // green
    else if (status === 'has-offline') color = '#ef4444'; // red
    else if (status === 'maintenance') color = '#f59e0b'; // yellow
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 26 10 26s10-18.5 10-26c0-5.52-4.48-10-10-10z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="12" r="4" fill="white"/>
          <text x="16" y="15" text-anchor="middle" fill="${color}" font-size="8" font-weight="bold">${machineCount}</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 40),
      anchor: new window.google.maps.Point(16, 40)
    };
  }, [getLocationStatus, getMachineCountForLocation]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    try {
      // Default center - if we have locations, center on the first one with coordinates
      let center = { lat: -33.8688, lng: 151.2093 }; // Sydney CBD default
      
      const locationsWithCoords = locations.filter(loc => loc.latitude && loc.longitude);
      if (locationsWithCoords.length > 0) {
        center = { lat: locationsWithCoords[0].latitude, lng: locationsWithCoords[0].longitude };
      }

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setIsMapLoaded(true);
      setMapError(null);
    } catch (error) {
      setMapError(`Error initializing map: ${error.message}`);
    }
  }, [locations]);

  const updateMapMarkers = useCallback(async () => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    // Add geocoding for locations without coordinates
    const geocoder = new window.google.maps.Geocoder();
    
    for (const location of locations) {
      let lat = location.latitude;
      let lng = location.longitude;

      // If location doesn't have coordinates, try to geocode
      if (!lat || !lng) {
        try {
          const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: location.address }, (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0].geometry.location);
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            });
          });
          
          lat = result.lat();
          lng = result.lng();
          
          // Update the location in the database with coordinates
          if (onLocationUpdate) {
            onLocationUpdate(location.id, { latitude: lat, longitude: lng });
          }
        } catch (error) {
          console.warn(`Failed to geocode ${location.name}:`, error);
          continue;
        }
      }

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: location.name,
        icon: getMarkerIcon(location)
      });

      // Add click listener for marker
      marker.addListener('click', () => {
        setSelectedLocation(location);
        
        // Create info window content
        const machineCount = getMachineCountForLocation(location.id);
        const status = getLocationStatus(location.id);
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${location.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${location.address}</p>
              <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Type:</strong> ${location.location_type}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Machines:</strong> ${machineCount}</p>
              ${location.contact_person ? `<p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Contact:</strong> ${location.contact_person}</p>` : ''}
              ${location.contact_email ? `<p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${location.contact_email}</p>` : ''}
            </div>
          `
        });
        
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    }

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
      
      // Don't zoom in too much for single locations
      window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
      });
    }
  }, [map, locations, markers, getMarkerIcon, getMachineCountForLocation, getLocationStatus, onLocationUpdate]);

  const loadGoogleMapsScript = useCallback(async () => {
    try {
      const response = await getMapsApiKey();
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to get API key');
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${response.data.apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => setMapError('Failed to load Google Maps');
      document.head.appendChild(script);
    } catch (error) {
      setMapError(error.message);
    }
  }, [initializeMap]);

  // Load Google Maps when component mounts
  useEffect(() => {
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeMap();
    }
  }, [loadGoogleMapsScript, initializeMap]);

  // Update markers when locations change
  useEffect(() => {
    if (map && isMapLoaded) {
      updateMapMarkers();
    }
  }, [locations, map, isMapLoaded, updateMapMarkers]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading locations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Map Error</h3>
            <p className="text-slate-600">{mapError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Interactive Locations Map
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>All Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Has Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>No Machines</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Location summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{locations.length}</p>
                <p className="text-sm text-slate-600">Total Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{machines.length}</p>
                <p className="text-sm text-slate-600">Total Machines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {locations.filter(loc => loc.latitude && loc.longitude).length}
                </p>
                <p className="text-sm text-slate-600">Mapped Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
