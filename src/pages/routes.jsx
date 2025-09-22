import React, { useState, useEffect } from 'react';
import { Route } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Truck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import RouteCard from '../components/routes/RouteCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function RoutesPage() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadRoutes() {
            try {
                const fetchedRoutes = await Route.list('-created_date');
                setRoutes(fetchedRoutes);
            } catch (error) {
                console.error("Failed to fetch routes:", error);
            } finally {
                setLoading(false);
            }
        }
        loadRoutes();
    }, []);

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Truck className="w-8 h-8 text-blue-600" />
                            Routes
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Manage service routes, track driver progress, and plan operations.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/routeplanner')}>
                            Route Planner
                        </Button>
                        <Button onClick={() => navigate('/routes/new')}>
                            <Plus className="w-4 h-4 mr-2" /> New Manual Route
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner text="Loading routes..." />
                ) : routes.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500">No routes found.</p>
                        <Button className="mt-4" onClick={() => navigate('/routeplanner')}>Go to Route Planner</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {routes.map(route => (
                            <RouteCard key={route.id} route={route} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}