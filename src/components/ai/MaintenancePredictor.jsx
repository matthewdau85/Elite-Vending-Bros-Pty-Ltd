
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Zap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, addDays } from "date-fns";
import { motion } from "framer-motion";

export default function MaintenancePredictor({ predictions = [], machines = [], locations = [], isLoading, onRefresh }) {
  const getHighRiskMachines = () => {
    return predictions
      .filter(p => p.failure_probability > 0.7)
      .sort((a, b) => b.failure_probability - a.failure_probability);
  };

  const getMaintenanceSchedule = () => {
    return predictions
      .filter(p => p.failure_probability > 0.5)
      .map(prediction => {
        const machine = machines.find(m => m.id === prediction.machine_id);
        const location = locations.find(l => l.id === machine?.location_id);
        
        return {
          ...prediction,
          machine,
          location,
          predicted_date: addDays(new Date(), prediction.days_until_failure || 30)
        };
      })
      .sort((a, b) => a.days_until_failure - b.days_until_failure);
  };

  const highRiskMachines = getHighRiskMachines();
  const maintenanceSchedule = getMaintenanceSchedule();

  const getRiskColor = (probability) => {
    if (probability > 0.8) return "bg-red-100 text-red-800 border-red-200";
    if (probability > 0.6) return "bg-orange-100 text-orange-800 border-orange-200";
    if (probability > 0.4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getRiskLabel = (probability) => {
    if (probability > 0.8) return "Critical";
    if (probability > 0.6) return "High Risk";
    if (probability > 0.4) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="space-y-6">
      {/* High Risk Alerts */}
      {highRiskMachines.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{highRiskMachines.length} machines</strong> have high failure probability and need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Critical Risk</p>
                <p className="text-2xl font-bold text-red-900">
                  {predictions.filter(p => p.failure_probability > 0.8).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">High Risk</p>
                <p className="text-2xl font-bold text-orange-900">
                  {predictions.filter(p => p.failure_probability > 0.6 && p.failure_probability <= 0.8).length}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Healthy</p>
                <p className="text-2xl font-bold text-green-900">
                  {machines.length - predictions.filter(p => p.failure_probability > 0.6).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Schedule */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Suggested Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceSchedule.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">All Machines Healthy</h3>
              <p className="text-slate-500 text-sm">
                No immediate maintenance predicted based on current data
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Predicted Date</TableHead>
                  <TableHead>Recommended Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceSchedule.map((prediction) => (
                  <TableRow key={prediction.machine_id}>
                    <TableCell>
                      <span className="font-medium">
                        Machine {prediction.machine?.machine_id || prediction.machine_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      {prediction.location?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(prediction.failure_probability)}>
                        {getRiskLabel(prediction.failure_probability)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(prediction.predicted_date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {prediction.recommended_actions?.slice(0, 2).map((action, i) => (
                          <p key={i} className="text-xs text-slate-600">• {action}</p>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Component Risk Analysis */}
      {predictions.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Component Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['coin_mechanism', 'bill_validator', 'cooling_system', 'vend_motors'].map(component => {
                const avgRisk = predictions.reduce((sum, p) => 
                  sum + (p.component_risk?.[component] || 0), 0
                ) / predictions.length;
                
                return (
                  <Card key={component} className="p-4">
                    <div className="text-center">
                      <h4 className="font-medium text-slate-900 capitalize">
                        {component.replace('_', ' ')}
                      </h4>
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              avgRisk > 0.7 ? 'bg-red-500' :
                              avgRisk > 0.5 ? 'bg-orange-500' :
                              avgRisk > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${avgRisk * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {Math.round(avgRisk * 100)}% risk
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
