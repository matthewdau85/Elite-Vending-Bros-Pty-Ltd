import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  RefreshCw, 
  Clock,
  Thermometer,
  Wifi,
  Package
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const alertIcons = {
  machine_offline: Wifi,
  low_stock: Package,
  temperature_alarm: Thermometer,
  maintenance_due: Clock,
  default: AlertTriangle
};

const priorityColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

export default function AlertsPanel({ alerts, isLoading, onRefresh }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Active Alerts ({alerts.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No Active Alerts</h3>
            <p className="text-slate-500 text-sm">All systems are operating normally</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const IconComponent = alertIcons[alert.alert_type] || alertIcons.default;
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <IconComponent className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-slate-900 text-sm">
                            {alert.title}
                          </h4>
                          <Badge className={`${priorityColors[alert.priority]} text-xs shrink-0`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Machine {alert.machine_id}</span>
                          <span>•</span>
                          <span>{alert.alert_datetime ? format(new Date(alert.alert_datetime), "MMM d, h:mm a") : 'No date'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        
        {alerts.length > 0 && (
          <div className="p-4 border-t bg-slate-50">
            <Link to="/alerts">
              <Button variant="outline" className="w-full" size="sm">
                View All Alerts
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}