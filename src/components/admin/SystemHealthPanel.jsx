import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { systemHealthCheck } from "@/api/functions";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Database, Rss, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { safeArray, safeString } from '@/components/shared/SearchUtils';

const statusIcons = {
  success: { icon: CheckCircle, color: 'text-green-500' },
  warning: { icon: AlertTriangle, color: 'text-orange-500' },
  error: { icon: XCircle, color: 'text-red-500' },
  info: { icon: AlertTriangle, color: 'text-blue-500' },
};

const serviceIcons = {
  "Database Connection": Database,
  "Nayax Configuration": Rss,
  "Base44 Platform": Server,
  "Authentication": BrainCircuit,
};

export default function SystemHealthPanel() {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const runHealthCheck = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await systemHealthCheck();
      if (response?.data?.success !== false) {
        setHealthData(response.data);
      } else {
        throw new Error(safeString(response?.data?.error) || "Health check failed");
      }
    } catch (error) {
      console.error("Health check failed:", error);
      toast.error("System health check unavailable");
      // Set minimal fallback data
      setHealthData({
        success: true,
        overallStatus: 'warning',
        checks: [
          {
            name: 'System Status',
            status: 'warning',
            message: 'Health check temporarily unavailable'
          }
        ],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  const OverallStatus = () => {
    if (isLoading || !healthData) return <Skeleton className="h-6 w-32" />;
    const status = safeString(healthData?.overallStatus) || 'warning';
    const { icon: Icon, color } = statusIcons[status] || statusIcons.warning;
    const text = {
      success: "All Systems Operational",
      warning: "Minor Issues Detected", 
      error: "Critical Issues Found",
      info: "System Information"
    }[status] || "Status Unknown";
    
    return (
      <div className={`flex items-center gap-2 font-semibold ${color}`}>
        <Icon className="h-5 w-5" />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time status of core application services.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={runHealthCheck} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
            <span className="font-medium text-slate-600">Overall Status</span>
            <OverallStatus />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading
              ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              : safeArray(healthData?.checks).map((check, index) => {
                  const status = safeString(check?.status) || 'warning';
                  const { icon: StatusIcon, color } = statusIcons[status] || statusIcons.warning;
                  const name = safeString(check?.name) || `Check ${index + 1}`;
                  const ServiceIcon = serviceIcons[name] || Server;
                  return (
                    <div key={name} className="p-4 border rounded-lg flex items-start gap-4">
                      <ServiceIcon className="h-6 w-6 text-slate-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-slate-800">{name}</p>
                          <StatusIcon className={`h-5 w-5 ${color}`} />
                        </div>
                        <p className="text-sm text-slate-600">{safeString(check?.message) || 'No details available'}</p>
                      </div>
                    </div>
                  );
                })}
          </div>
          {!isLoading && healthData?.timestamp && (
            <p className="text-xs text-slate-500 text-center pt-2">
              Last checked: {format(new Date(healthData.timestamp), "MMM d, yyyy, h:mm:ss a")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}