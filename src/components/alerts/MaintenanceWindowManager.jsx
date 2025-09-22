import React, { useState, useEffect } from 'react';
import { MaintenanceWindow } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function MaintenanceWindowManager() {
    const [windows, setWindows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadWindows();
    }, []);

    const loadWindows = async () => {
        setIsLoading(true);
        try {
            const data = await MaintenanceWindow.list('-start_time');
            setWindows(data);
        } catch (error) {
            toast.error("Failed to load maintenance windows.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Loading Maintenance Windows..." />;
    }

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Maintenance Windows</CardTitle>
                        <CardDescription>Define periods to suppress alerts for specific machines or locations.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Window
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {windows.map(win => (
                        <div key={win.id} className="border p-4 rounded-lg">
                            <h3 className="font-semibold">{win.name}</h3>
                            <p className="text-sm text-slate-500">
                                Target: {win.target_type} <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{win.target_id}</span>
                            </p>
                            <p className="text-sm text-slate-500">
                                From: {format(new Date(win.start_time), 'PPpp')}
                            </p>
                            <p className="text-sm text-slate-500">
                                To: {format(new Date(win.end_time), 'PPpp')}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}