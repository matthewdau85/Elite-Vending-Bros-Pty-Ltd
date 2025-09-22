import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Visit, Machine, Location } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, User, Clock, Printer, Package } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import VisualRouteMap from '../components/routes/VisualRouteMap';

export default function RouteDetail() {
  const [route, setRoute] = useState(null);
  const [visits, setVisits] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('id');
    
    if (!routeId) {
      navigate('/routes');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const routeData = await Route.get(routeId);
        setRoute(routeData);

        if (routeData) {
          const [visitsData, machinesData, locationsData] = await Promise.all([
            Visit.filter({ route_id: routeId }),
            Machine.list(), // Simplified for now
            Location.list() // Simplified for now
          ]);
          setVisits(visitsData);
          setMachines(machinesData);
          setLocations(locationsData);
        }
      } catch (error) {
        console.error('Failed to load route details:', error);
        navigate('/routes');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) return <LoadingSpinner text="Loading route details..." />;
  if (!route) return <div className="text-center p-8">Route not found.</div>;

  const routeMachines = route.optimized_machine_order
    ? route.optimized_machine_order.map(id => machines.find(m => m.id === id)).filter(Boolean)
    : [];

  const routeLocations = routeMachines.map(m => locations.find(l => l.id === m.location_id)).filter(Boolean);
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
       <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/routes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Routes
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print Route
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{route.name}</CardTitle>
              <CardDescription>
                Status: <Badge>{route.status}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>{route.assigned_operator}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Scheduled: {route.next_scheduled ? format(new Date(route.next_scheduled), 'PPP') : 'N/A'}</span>
              </div>
               <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>~{route.estimated_duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>~{route.estimated_distance_km} km</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-500" />
                <span>{routeMachines.length} stops</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Route Stops</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {routeMachines.map((machine, index) => {
                  const location = locations.find(l => l.id === machine.location_id);
                  return (
                    <li key={machine.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{index + 1}</div>
                      <div>
                        <p className="font-semibold">Machine {machine.machine_id} <span className="font-normal text-slate-500">at {location?.name || '...'}</span></p>
                        <p className="text-sm text-slate-600">{location?.address}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader><CardTitle>Route Map</CardTitle></CardHeader>
            <CardContent className="h-[500px]">
              <VisualRouteMap locations={routeLocations} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}