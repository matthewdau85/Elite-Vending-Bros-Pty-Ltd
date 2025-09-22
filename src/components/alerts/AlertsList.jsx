
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom"; 
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Wifi, 
  Package, 
  Thermometer, 
  Clock, 
  Eye,
  CheckCircle2,
  XCircle,
  Trash2
} from "lucide-react";
import { createPageUrl } from '@/layout'; 
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Alert } from "@/api/entities";
import AlertDetailsDialog from './AlertDetailsDialog';

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

const statusColors = {
  open: "bg-red-100 text-red-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  ignored: "bg-gray-100 text-gray-800"
};

export default function AlertsList({ 
  alerts, 
  machines, 
  locations, 
  selectedAlerts, 
  onSelectAlert, 
  onSelectAll, 
  // onViewAlert, // This prop is now handled internally
  onUpdateAlert,
  isLoading 
}) {
  const [selectedAlert, setSelectedAlert] = useState(null); // State to manage the alert details dialog

  const handleStatusChange = async (alert, newStatus) => {
    const updateData = { status: newStatus };
    
    if (newStatus === "acknowledged") {
      updateData.acknowledged_at = new Date().toISOString();
      updateData.acknowledged_by = "current_user@example.com"; // Placeholder for current user
    } else if (newStatus === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = "current_user@example.com"; // Placeholder for current user
    }
    
    await Alert.update(alert.id, updateData);
    onUpdateAlert(); // Trigger a refresh of alerts in the parent component
  };

  const handleDeleteAlert = async (alert) => {
    if (window.confirm(`Are you sure you want to delete this alert: "${alert.title}"? This action cannot be undone.`)) {
      try {
        await Alert.delete(alert.id);
        onUpdateAlert(); // Trigger a refresh of alerts in the parent component
      } catch (error) {
        console.error("Error deleting alert:", error);
        alert("Failed to delete alert. Please try again.");
      }
    }
  };

  const getMachineInfo = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return { machine_id: machineId || "Unknown", location_name: "Unknown" };
    
    const location = locations.find(l => l.id === machine.location_id);
    return {
      machine_id: machine.machine_id || "Unknown",
      location_name: location ? (location.name || "Unknown") : "Unknown"
    };
  };

  // Internal handler to open the AlertDetailsDialog
  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Loading Alerts...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="text-center py-12 border-0 shadow-md">
        <CardContent>
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear!</h3>
          <p className="text-slate-500">No alerts match your current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Checkbox
                checked={selectedAlerts.length === alerts.length && alerts.length > 0}
                onCheckedChange={onSelectAll}
              />
              Alerts ({alerts.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const IconComponent = alertIcons[alert.alert_type] || alertIcons.default;
                const machineInfo = getMachineInfo(alert.machine_id);
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedAlerts.includes(alert.id)}
                        onCheckedChange={() => onSelectAlert(alert.id)}
                      />
                      
                      <div className="p-2 rounded-lg bg-slate-100">
                        <IconComponent className="w-5 h-5 text-slate-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">
                            {alert.title}
                          </h4>
                          <div className="flex gap-2">
                            <Badge className={priorityColors[alert.priority]}>
                              {alert.priority}
                            </Badge>
                            <Badge className={statusColors[alert.status]}>
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2">
                          {alert.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Machine {machineInfo.machine_id}</span>
                          <span>•</span>
                          <span>{machineInfo.location_name}</span>
                          <span>•</span>
                          <span>{alert.alert_datetime ? format(new Date(alert.alert_datetime), "MMM d, h:mm a") : 'No date'}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAlert(alert)} 
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {alert.status === "open" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(alert, "acknowledged")}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        
                        {alert.status === "acknowledged" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(alert, "resolved")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {selectedAlert && (
        <AlertDetailsDialog
          open={!!selectedAlert} 
          onClose={() => setSelectedAlert(null)} 
          alert={selectedAlert}
          onUpdate={onUpdateAlert} 
        />
      )}
    </div>
  );
}
