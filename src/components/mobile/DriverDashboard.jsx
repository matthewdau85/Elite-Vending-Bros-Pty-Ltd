
import React, { useState, useEffect, useCallback } from 'react';
import { Route, Visit, Machine, MachineStock, Product } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Navigation, CheckSquare, Camera, 
  Package, DollarSign, Clock, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import FillWizard from './FillWizard';
import CashCollection from './CashCollection';
import OfflineStorage from '../shared/OfflineStorage';

export default function DriverDashboard({ user, isOnline, setSyncStatus, setPendingChanges }) {
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDriverData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load from cache first for instant UX
      const cachedRoutes = await OfflineStorage.get('activeRoutes');
      if (cachedRoutes) {
        setActiveRoutes(cachedRoutes);
      }

      // Then update from server if online
      if (isOnline && user?.email) {
        const routes = await Route.filter({ 
          assigned_operator: user.email,
          status: ['planned', 'in_progress']
        });
        setActiveRoutes(routes);
        await OfflineStorage.set('activeRoutes', routes);
        
        if (routes.length > 0) {
          const routeVisits = await Visit.filter({ 
            route_id: routes[0].id 
          });
          setVisits(routeVisits);
          await OfflineStorage.set('activeVisits', routeVisits);
        }
      } else if (user?.email) { // Only load from cache if user.email is present, otherwise it might be an unauthenticated state
        // Load visits from cache
        const cachedVisits = await OfflineStorage.get('activeVisits');
        if (cachedVisits) setVisits(cachedVisits);
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
      toast.error('Failed to load route data');
    } finally {
      setLoading(false);
    }
  }, [isOnline, user?.email]);

  useEffect(() => {
    loadDriverData();
  }, [loadDriverData]);

  const startRoute = async (route) => {
    try {
      setCurrentRoute(route);
      await Route.update(route.id, { 
        status: 'in_progress',
        start_time: new Date().toISOString()
      });
      
      // Cache the update for offline sync
      if (!isOnline) {
        await OfflineStorage.queueUpdate('route', route.id, {
          status: 'in_progress',
          start_time: new Date().toISOString()
        });
        setPendingChanges(prev => prev + 1);
      }
      
      toast.success('Route started');
    } catch (error) {
      toast.error('Failed to start route');
    }
  };

  const completeVisit = async (visit, data) => {
    try {
      const updateData = {
        status: 'completed',
        end_time: new Date().toISOString(),
        ...data
      };

      if (isOnline) {
        await Visit.update(visit.id, updateData);
      } else {
        // Queue for offline sync
        await OfflineStorage.queueUpdate('visit', visit.id, updateData);
        setPendingChanges(prev => prev + 1);
      }

      // Update local state
      setVisits(prev => prev.map(v => 
        v.id === visit.id ? { ...v, ...updateData } : v
      ));

      toast.success('Visit completed and saved for sync');
    } catch (error) {
      toast.error('Failed to complete visit');
    }
  };

  const openNavigation = (machine) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Open native maps app
          const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${machine.latitude || 0},${machine.longitude || 0}`;
          window.open(url, '_blank');
        },
        (error) => {
          toast.error('Unable to get your location');
        }
      );
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading routes...</div>;
  }

  if (activeRoutes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No active routes assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Routes */}
      {!currentRoute && activeRoutes.map(route => (
        <Card key={route.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <p className="text-sm text-slate-600">
                  {route.machine_ids?.length || 0} stops • Est. {route.estimated_duration_minutes || 0}min
                </p>
              </div>
              <Badge variant={route.status === 'planned' ? 'secondary' : 'default'}>
                {route.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                onClick={() => startRoute(route)}
                className="flex-1"
                disabled={route.status === 'in_progress'}
              >
                <Navigation className="w-4 h-4 mr-2" />
                {route.status === 'planned' ? 'Start Route' : 'Continue Route'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Current Route Progress */}
      {currentRoute && (
        <div className="space-y-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-green-600" />
                {currentRoute.name} - In Progress
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Visit Cards */}
          {visits.map(visit => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onComplete={completeVisit}
              onNavigate={openNavigation}
              isOnline={isOnline}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual Visit Card Component
function VisitCard({ visit, onComplete, onNavigate, isOnline }) {
  const [machine, setMachine] = useState(null);
  const [showFillWizard, setShowFillWizard] = useState(false);
  const [showCashCollection, setShowCashCollection] = useState(false);

  const loadMachineData = useCallback(async () => {
    try {
      if(visit.machine_id) {
        const machineData = await Machine.get(visit.machine_id);
        setMachine(machineData);
      }
    } catch (error) {
      console.error('Failed to load machine data:', error);
    }
  }, [visit.machine_id]);

  useEffect(() => {
    loadMachineData();
  }, [loadMachineData]);

  const isCompleted = visit.status === 'completed';

  return (
    <Card className={`${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Machine {machine?.machine_id || visit.machine_id}
            </CardTitle>
            <p className="text-sm text-slate-600">
              {machine?.location || 'Location not set'}
            </p>
          </div>
          <Badge variant={isCompleted ? 'default' : 'secondary'}>
            {visit.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate(machine)}
            disabled={!machine}
          >
            <Navigation className="w-4 h-4 mr-1" />
            Navigate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFillWizard(true)}
            disabled={isCompleted}
          >
            <Package className="w-4 h-4 mr-1" />
            Fill Items
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCashCollection(true)}
            disabled={isCompleted}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Cash
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isCompleted}
          >
            <Camera className="w-4 h-4 mr-1" />
            Photo
          </Button>
        </div>

        {!isCompleted && (
          <Button 
            onClick={() => onComplete(visit, {})}
            className="w-full"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Complete Visit
          </Button>
        )}

        {/* Modal Components */}
        {showFillWizard && (
          <FillWizard
            visit={visit}
            machine={machine}
            onClose={() => setShowFillWizard(false)}
            onSave={(data) => {
              onComplete(visit, data);
              setShowFillWizard(false);
            }}
          />
        )}

        {showCashCollection && (
          <CashCollection
            visit={visit}
            machine={machine}
            onClose={() => setShowCashCollection(false)}
            onSave={(data) => {
              onComplete(visit, data);
              setShowCashCollection(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
