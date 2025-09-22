
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity, Zap, Clock, AlertTriangle, ShieldCheck, TrendingUp, GitBranch
} from 'lucide-react';
import { SystemMetric, ServiceLevelObjective, SystemEvent } from '@/api/entities';
import { toast } from 'sonner';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useFeatureGate } from '../components/features/useFeatureGate';

import { systemHealthCheck } from '@/api/functions';
import { ShieldAlert, Server, Database, PlugZap } from 'lucide-react';

// Mock components for the dashboard
const SLOStatus = ({ slo }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800';
            case 'at_risk': return 'bg-yellow-100 text-yellow-800';
            case 'breached': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{slo.slo_name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">{slo.target_percentage}%</p>
                    <Badge className={getStatusColor(slo.status)}>{slo.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2">Error Budget: {slo.error_budget_remaining?.toFixed(3)}%</p>
            </CardContent>
        </Card>
    )
};

const MetricExplorer = ({ metrics }) => (
    <Card>
        <CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader>
        <CardContent className="space-y-2">
            {metrics.map(m => (
                <div key={m.name} className="flex justify-between items-center text-sm">
                    <p className="text-slate-600">{m.name}</p>
                    <p className="font-medium">{m.value}</p>
                </div>
            ))}
        </CardContent>
    </Card>
);

const WebhookStatus = () => (
    <Card>
        <CardHeader><CardTitle>Webhook Health</CardTitle></CardHeader>
        <CardContent>
            <div className="text-center">
                <p className="text-3xl font-bold text-green-600">99.98%</p>
                <p className="text-sm text-slate-500">Success Rate (Last 7 Days)</p>
            </div>
            <div className="mt-4 flex justify-around text-xs">
                <div><p className="font-bold">5,432</p><p>Success</p></div>
                <div><p className="font-bold">7</p><p>Failed</p></div>
                <div><p className="font-bold">3</p><p>Retrying</p></div>
            </div>
        </CardContent>
    </Card>
);

const SystemEventLog = ({ events }) => (
    <Card className="col-span-1 md:col-span-2">
        <CardHeader><CardTitle>System Event Stream</CardTitle></CardHeader>
        <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {events.map(e => (
                    <div key={e.id} className="flex items-start gap-3 text-xs">
                        <Badge variant="outline" className="text-slate-500">{new Date(e.created_date).toLocaleTimeString()}</Badge>
                        <p className="font-medium">{e.source}: {e.event_type}</p>
                        <p className="text-slate-600 truncate">{JSON.stringify(e.details)}</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const SystemHealthPanel = () => {
    const [healthStatus, setHealthStatus] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const runCheck = async () => {
        setIsChecking(true);
        try {
            const { data } = await systemHealthCheck();
            setHealthStatus(data);
            if(data.overallStatus === 'OK') {
                toast.success('System health check passed.');
            } else {
                toast.warning('System health check found issues.');
            }
        } catch (error) {
            setHealthStatus({
                overallStatus: 'CRITICAL',
                results: [],
                error: 'Failed to run health check function.'
            });
            toast.error('Failed to run system health check.');
        } finally {
            setIsChecking(false);
        }
    };
    
    const getStatusIcon = (status) => {
        switch(status) {
            case 'OK': return <ShieldCheck className="w-5 h-5 text-green-600" />;
            case 'ERROR': return <ShieldAlert className="w-5 h-5 text-red-600" />;
            case 'SKIPPED': return <div className="w-5 h-5 text-slate-400">-</div>;
            default: return <Server className="w-5 h-5 text-slate-500" />;
        }
    }

    return (
        <Card className="col-span-1 md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Health Check</CardTitle>
                <Button onClick={runCheck} disabled={isChecking} size="sm">
                    {isChecking ? <LoadingSpinner text="Checking..."/> : "Run Check"}
                </Button>
            </CardHeader>
            <CardContent>
                {!healthStatus ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>Click "Run Check" to perform a live system health diagnostic.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {healthStatus.results.map((check, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(check.status)}
                                    <p className="font-medium text-slate-800">{check.name}</p>
                                </div>
                                <p className="text-sm text-slate-600">{check.message}</p>
                            </div>
                        ))}
                         {healthStatus.error && (
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-5 h-5 text-red-600" />
                                    <p className="font-medium text-red-800">Critical Error</p>
                                </div>
                                <p className="text-sm text-red-600">{healthStatus.error}</p>
                            </div>
                         )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function ObservabilityPage() {
    const [metrics, setMetrics] = useState([]);
    const [slos, setSlos] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const observabilityEnabled = useFeatureGate('obs.core');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [metricsData, slosData, eventsData] = await Promise.all([
                SystemMetric.list('-created_date', 100),
                ServiceLevelObjective.list(),
                SystemEvent.list('-created_date', 20)
            ]);
            
            // This would be more complex in a real app
            const keyMetrics = [
                { name: 'Refund Latency (p95)', value: '120ms' },
                { name: 'Ingest Lag', value: '3.2s' },
                { name: 'Route Gen Time (avg)', value: '450ms' },
                { name: 'Mobile Sync Conflicts', value: '2' },
            ];

            setMetrics(keyMetrics);
            setSlos(slosData.length > 0 ? slosData : [
                { id: 1, slo_name: 'Webhook Success', target_percentage: 99.9, status: 'healthy', error_budget_remaining: 0.08 },
                { id: 2, slo_name: 'API Uptime (v1)', target_percentage: 99.95, status: 'healthy', error_budget_remaining: 0.045 },
            ]);
            setEvents(eventsData);
        } catch (error) {
            toast.error("Failed to load observability data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return <LoadingSpinner text="Loading Observability Deck..." />;
    }
    
    if (!observabilityEnabled) {
        return (
            <Card className="p-8 text-center">
                <CardHeader>
                    <CardTitle>Observability Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                    <p>The full Observability module is not enabled for your account.</p>
                    <p className="text-sm text-slate-500">Contact support to enable advanced monitoring and SLOs.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-600" />
                        Observability & System Health
                    </h1>
                    <p className="text-slate-600">Monitoring system performance, reliability, and service level objectives.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {slos.map(slo => <SLOStatus key={slo.id} slo={slo} />)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricExplorer metrics={metrics} />
                <WebhookStatus />
                <SystemEventLog events={events} />
                <SystemHealthPanel />
            </div>
        </div>
    );
}
