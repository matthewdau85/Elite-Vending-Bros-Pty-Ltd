
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Route, Visit, Product, Machine } from '@/api/entities';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Truck, Calendar, ListTodo, Map } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import FeatureGate from '../components/features/FeatureGate';
import { Badge } from '@/components/ui/badge'; // Added this import

// This would be a call to a complex backend function in a real scenario
const generateRoutesAndPickingLists = async (selectedDate) => {
    toast.info("Generating optimized routes... This may take a moment.");
    // Simulate fetching all necessary data
    const [machines, stocks, products] = await Promise.all([
        Machine.list(),
        Machine.list(), // Placeholder for MachineStock.list()
        Product.list(),
    ]);

    // 1. Identify machines needing service (simplified logic)
    const machinesToService = machines.slice(0, 10); // simplified for MVP

    if (machinesToService.length === 0) {
        toast.success("No machines require servicing today.");
        return [];
    }

    // 2. Create a single route for this example
    const newRoute = await Route.create({
        name: `Daily Route - ${format(selectedDate, 'PPP')}`,
        assigned_operator: 'driver@elitevending.com',
        status: 'planned',
        next_scheduled: selectedDate.toISOString().split('T')[0],
        machine_ids: machinesToService.map(m => m.id),
        optimized_machine_order: machinesToService.map(m => m.id), // No real optimization in MVP
    });
    
    // 3. Create Visits and Picking Lists for each machine
    const visitPromises = machinesToService.map(machine => {
        // Simplified picking list logic
        const itemsToFill = products.slice(0, 5).map(p => ({
            product_sku: p.sku,
            quantity_needed: Math.floor(Math.random() * 5) + 1,
        }));

        return Visit.create({
            route_id: newRoute.id,
            machine_id: machine.id,
            operator: newRoute.assigned_operator,
            visit_datetime: new Date().toISOString(),
            status: 'planned',
            items_to_fill: itemsToFill,
        });
    });

    await Promise.all(visitPromises);
    toast.success(`Successfully generated 1 route with ${machinesToService.length} stops.`);
    return [newRoute];
};


export default function RoutePlannerPage() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleGenerateRoutes = async () => {
        setLoading(true);
        try {
            const newRoutes = await generateRoutesAndPickingLists(selectedDate);
            setRoutes(prev => [...prev, ...newRoutes]);
        } catch (error) {
            console.error("Failed to generate routes:", error);
            toast.error("Failed to generate routes. See console for details.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
    <FeatureGate featureKey="routes.optimization">
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <Toaster />
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Truck className="w-8 h-8 text-blue-600" />
                        Route Planner & Pre-kitting
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Generate optimized daily routes, view picking lists, and manage warehouse operations.
                    </p>
                </div>
                
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Generate Daily Routes</CardTitle>
                        <CardDescription>Select a date and generate optimized routes and picking lists for your drivers.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <input 
                            type="date" 
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="border p-2 rounded-md"
                        />
                        <Button onClick={handleGenerateRoutes} disabled={loading}>
                            {loading ? <LoadingSpinner size="small" /> : <Calendar className="w-4 h-4 mr-2" />}
                            Generate Routes
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Generated Routes</CardTitle>
                        <CardDescription>Below are the routes planned for the selected date.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && routes.length === 0 ? (
                           <LoadingSpinner text="Loading routes..." />
                        ) : routes.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No routes generated. Use the panel above to create them.</p>
                        ) : (
                            <div className="space-y-4">
                                {routes.map(route => (
                                    <div key={route.id} className="border p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold text-lg">{route.name}</h3>
                                            <p className="text-slate-500">
                                                {route.optimized_machine_order?.length || 0} Stops • Assigned to {route.assigned_operator}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{route.status}</Badge>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/routedetail?id=${route.id}`}>
                                                    <ListTodo className="w-4 h-4 mr-2" />
                                                    View Details & Fill
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </FeatureGate>
    );
}
