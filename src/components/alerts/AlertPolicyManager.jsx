import React, { useState, useEffect } from 'react';
import { AlertPolicy } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import { toast } from 'sonner';

export default function AlertPolicyManager() {
    const [policies, setPolicies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        setIsLoading(true);
        try {
            const data = await AlertPolicy.list();
            setPolicies(data);
        } catch (error) {
            toast.error("Failed to load alert policies.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner text="Loading Policies..." />;
    }

    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Alert Policies</CardTitle>
                        <CardDescription>Define how and when alerts are sent and escalated.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Policy
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {policies.map(policy => (
                        <div key={policy.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{policy.name}</h3>
                                    <p className="text-sm text-slate-500">For alert type: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{policy.alert_type}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                                    <Button variant="destructive" size="sm"><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Escalation Chain</h4>
                                <div className="space-y-2">
                                    {policy.escalation_chain.sort((a,b) => a.level - b.level).map(step => (
                                        <div key={step.level} className="text-sm p-2 bg-slate-50 rounded">
                                            Level {step.level}: Send to <span className="font-semibold">{step.target_type} '{step.target_id}'</span> via <span className="font-semibold">{step.channels.join(', ')}</span>.
                                            {step.escalate_after_minutes && ` Escalate after ${step.escalate_after_minutes} mins.`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}