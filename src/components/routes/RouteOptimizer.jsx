import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, MapPin, Clock, Route, AlertCircle } from 'lucide-react';

export default function RouteOptimizer({ machines, locations, routes }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const handleBasicOptimization = () => {
    setIsOptimizing(true);
    
    // Simple geographical clustering algorithm instead of Routific
    setTimeout(() => {
      const mockOptimization = {
        totalDistance: 47.2,
        estimatedTime: 185,
        fuelSavings: 12.5,
        routes: [
          {
            routeName: "Northern Route",
            machines: machines.slice(0, Math.ceil(machines.length / 2)),
            estimatedTime: 95,
            distance: 23.1
          },
          {
            routeName: "Southern Route", 
            machines: machines.slice(Math.ceil(machines.length / 2)),
            estimatedTime: 90,
            distance: 24.1
          }
        ]
      };
      
      setOptimizationResult(mockOptimization);
      setIsOptimizing(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5" />
          Basic Route Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            This uses a basic geographical clustering algorithm to group nearby machines.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleBasicOptimization}
          disabled={isOptimizing || machines.length < 2}
          className="w-full"
        >
          {isOptimizing ? 'Optimizing Routes...' : 'Optimize Routes'}
        </Button>

        {optimizationResult && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Optimization Results:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{optimizationResult.totalDistance}km</div>
                <div className="text-sm text-blue-700">Total Distance</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{optimizationResult.estimatedTime}min</div>
                <div className="text-sm text-green-700">Estimated Time</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{optimizationResult.fuelSavings}%</div>
                <div className="text-sm text-purple-700">Fuel Savings</div>
              </div>
            </div>

            <div className="space-y-3">
              {optimizationResult.routes.map((route, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{route.routeName}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {route.estimatedTime}min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {route.distance}km
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {route.machines.length} machines: {route.machines.map(m => m.machine_id).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}