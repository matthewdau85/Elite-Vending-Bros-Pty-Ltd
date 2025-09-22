
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Save, Navigation, Clock, Truck } from 'lucide-react';
import { getMapsApiKey } from '@/api/functions';
import { toast } from 'sonner';

export default function VisualRouteMap({ 
  routes, 
  machines, 
  locations, 
  users,
  selectedRoute, 
  onRouteSelect, 
  onRouteUpdate, 
  isLoading 
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routePath, setRoutePath] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);

  const calculateRouteStats = useCallback((directions) => {
    let totalDistance = 0;
    let totalDuration = 0;

    const route = directions.routes[0];
    if (route && route.legs) {
      route.legs.forEach(leg => {
        totalDistance += leg.distance.value; // in meters
        totalDuration += leg.duration.value; // in seconds
      });
    }

    setRouteDistance(Math.round(totalDistance / 1000)); // Convert to km
    setRouteDuration(Math.round(totalDuration / 60)); // Convert to minutes
  }, []); // Dependencies for calculateRouteStats are stable as it only uses values from its arguments

  const initializeMap = useCallback(() => {
    if (mapRef.current && window.google && window.google.maps) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: -33.8688, lng: 151.2093 },
        zoom: 12,
        mapTypeId: 'roadmap',
      });

      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        draggable: true,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRendererInstance.setMap(mapInstance);
      
      // Listen for route changes when user drags waypoints
      directionsRendererInstance.addListener('directions_changed', () => {
        const directions = directionsRendererInstance.getDirections();
        if (directions && selectedRoute) { // selectedRoute and calculateRouteStats are dependencies now
          calculateRouteStats(directions);
        }
      });

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setIsMapReady(true);
    }
  }, [selectedRoute, calculateRouteStats]); // Added calculateRouteStats to dependencies

  const loadGoogleMapsScript = useCallback(async () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    try {
      const response = await getMapsApiKey();
      if (!response.data?.success) throw new Error(response.data?.error);
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${response.data.apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = initializeMap;
      script.onerror = () => setMapError('Failed to load Google Maps script.');
    } catch (err) {
      setMapError(err.message);
    }
  }, [initializeMap]);

  useEffect(() => {
    loadGoogleMapsScript();
  }, [loadGoogleMapsScript]);


  const displayRoute = useCallback(async (route) => {
    if (!map || !directionsService || !directionsRenderer || !route.machine_ids) return;

    // Get machines for this route
    const routeMachines = machines.filter(m => route.machine_ids.includes(m.id));
    const routeLocations = locations.filter(l => 
      routeMachines.some(m => m.location_id === l.id)
    ).filter(l => l.latitude && l.longitude);

    if (routeLocations.length < 2) {
      toast.error("Route needs at least 2 locations with coordinates to display directions");
      return;
    }

    // Create waypoints
    const waypoints = routeLocations.slice(1, -1).map(location => ({
      location: { lat: location.latitude, lng: location.longitude },
      stopover: true
    }));

    const request = {
      origin: { lat: routeLocations[0].latitude, lng: routeLocations[0].longitude },
      destination: { lat: routeLocations[routeLocations.length - 1].latitude, lng: routeLocations[routeLocations.length - 1].longitude },
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        calculateRouteStats(result);
        
        // Update route with optimized order if optimization was used
        if (result.routes[0].waypoint_order && onRouteUpdate) {
          const optimizedOrder = result.routes[0].waypoint_order;
          // Note: In a full implementation, you'd reorder the machine_ids based on optimizedOrder
          console.log('Optimized waypoint order:', optimizedOrder);
        }
      } else {
        console.error('Directions request failed:', status);
        toast.error(`Failed to calculate route: ${status}`);
      }
    });
  }, [map, directionsService, directionsRenderer, machines, locations, onRouteUpdate, calculateRouteStats]);

  useEffect(() => {
    if (selectedRoute && isMapReady) {
      displayRoute(selectedRoute);
    } else if (isMapReady && directionsRenderer) {
      // Clear route if no route selected
      directionsRenderer.setDirections({ routes: [] });
      setRouteDistance(0);
      setRouteDuration(0);
    }
  }, [selectedRoute, isMapReady, displayRoute, directionsRenderer]);

  const handleSaveOptimizedRoute = async () => {
    if (!selectedRoute || !directionsRenderer) return;

    const directions = directionsRenderer.getDirections();
    if (!directions || !directions.routes[0]) return;

    try {
      await onRouteUpdate(selectedRoute.id, {
        estimated_duration: routeDuration,
        // In a full implementation, you'd also save the optimized machine order
      });
      toast.success("Route optimization saved successfully!");
    } catch (error) {
      toast.error("Failed to save route optimization");
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (mapError) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">Map Error</p>
            <p className="text-slate-600 text-sm">{mapError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Route Selection Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Route Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Route to Visualize</label>
              <Select 
                value={selectedRoute?.id || ""} 
                onValueChange={(routeId) => {
                  const route = routes.find(r => r.id === routeId);
                  onRouteSelect(route);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route..." />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoute && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Machines:</span>
                  <Badge variant="outline">{selectedRoute.machine_ids?.length || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Distance:</span>
                  <span className="text-sm font-medium">{routeDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Duration:</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {routeDuration} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Operator:</span>
                  <span className="text-sm font-medium">
                    {users.find(u => u.email === selectedRoute.assigned_operator)?.full_name || "Unassigned"}
                  </span>
                </div>

                <Button 
                  onClick={handleSaveOptimizedRoute}
                  className="w-full mt-4"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Route
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Interactive Route Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={mapRef} className="w-full h-[500px] bg-slate-200 rounded-lg border" />
            <div className="flex justify-between items-center mt-4 text-sm text-slate-600">
              <div>
                💡 <strong>Tip:</strong> Drag waypoints on the map to manually optimize your route
              </div>
              {selectedRoute && (
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {routeDistance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {routeDuration} min
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
