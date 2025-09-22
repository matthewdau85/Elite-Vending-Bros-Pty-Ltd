import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, User, ArrowRight } from 'lucide-react';

export default function RouteCard({ route }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'planned': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{route.name}</CardTitle>
                    <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                </div>
                <CardDescription>{route.description || 'No description'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{route.assigned_operator}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{route.next_scheduled ? format(new Date(route.next_scheduled), 'EEE, MMM d') : 'Unscheduled'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{route.machine_ids?.length || 0} stops</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~{route.estimated_duration_minutes || 'N/A'} min</span>
                </div>
            </CardContent>
            <CardFooter>
                <Link to={`/routedetail?id=${route.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}