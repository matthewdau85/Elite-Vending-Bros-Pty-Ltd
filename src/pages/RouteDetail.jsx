
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Route, Machine, Location, Visit } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Calendar, 
  User,
  Clock,
  CheckCircle2,
  Printer
} from "lucide-react";
import { format } from "date-fns";

export default function RouteDetail() {
  const [route, setRoute] = useState(null);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadRouteData = useCallback(async (routeId) => {
    setIsLoading(true);
    try {
      const [routeData, machinesData, locationsData, visitsData] = await Promise.all([
        Route.filter({ id: routeId }),
        Machine.list(),
        Location.list(),
        Visit.filter({ route_id: routeId }, "-visit_datetime", 20)
      ]);

      if (routeData.length === 0) {
        navigate(createPageUrl("Routes"));
        return;
      }

      setRoute(routeData[0]);
      setMachines(machinesData);
      setLocations(locationsData);
      setVisits(visitsData);
    } catch (error) {
      console.error("Error loading route data:", error);
    }
    setIsLoading(false);
  }, [navigate]); // Added navigate to dependency array for useCallback

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('id');
    if (routeId) {
      loadRouteData(routeId);
    } else {
      navigate(createPageUrl("Routes"));
    }
  }, [navigate, loadRouteData]); // Added loadRouteData to dependency array

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!route) return null;

  const routeMachines = machines.filter(m => route.machine_ids?.includes(m.id));

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Routes"))}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Routes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{route.name}</h1>
              <p className="text-slate-600 mt-1">{route.description}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Route Details */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Assigned Operator</p>
                  <p className="font-medium">{route.assigned_operator || "Unassigned"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Estimated Duration</p>
                  <p className="font-medium">{route.estimated_duration || "Not set"} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Frequency</p>
                  <p className="font-medium capitalize">{route.frequency}</p>
                </div>
              </div>

              {route.next_scheduled && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Next Scheduled</p>
                    <p className="font-medium">
                      {format(new Date(route.next_scheduled), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Badge variant="outline" className={route.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50'}>
                  {route.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Machines on Route */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Machines ({routeMachines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {routeMachines.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No machines assigned to this route</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routeMachines.map((machine) => {
                    const location = locations.find(l => l.id === machine.location_id);
                    return (
                      <div key={machine.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Machine {machine.machine_id}</h4>
                          <p className="text-sm text-slate-500">{location?.name}</p>
                        </div>
                        <Badge className={machine.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {machine.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visit History */}
        <Card className="mt-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Visits</CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No visits recorded for this route</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{visit.visit_type?.replace('_', ' ')}</h4>
                      <p className="text-sm text-slate-600">by {visit.operator}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(visit.visit_datetime), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline">{visit.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
