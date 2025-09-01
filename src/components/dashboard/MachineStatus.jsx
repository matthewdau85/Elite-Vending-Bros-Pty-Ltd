import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, Wifi, WifiOff, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const statusConfig = {
  online: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Wifi,
    iconColor: "text-green-600"
  },
  offline: {
    color: "bg-red-100 text-red-800 border-red-200", 
    icon: WifiOff,
    iconColor: "text-red-600"
  },
  maintenance: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Wrench,
    iconColor: "text-orange-600"
  },
  retired: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Coffee,
    iconColor: "text-gray-600"
  }
};

export default function MachineStatus({ machines, isLoading }) {
  const recentMachines = machines.slice(0, 8);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-white">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Coffee className="w-5 h-5 text-blue-600" />
          Machine Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-8">
            <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No Machines Added</h3>
            <p className="text-slate-500 text-sm">Add your first vending machine to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentMachines.map((machine, index) => {
              const config = statusConfig[machine.status] || statusConfig.online;
              const StatusIcon = config.icon;
              
              return (
                <motion.div
                  key={machine.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl(`MachineDetail?id=${machine.id}`)}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                        <StatusIcon className={`w-5 h-5 ${config.iconColor} group-hover:text-blue-600 transition-colors`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                          Machine {machine.machine_id}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {machine.model || "Unknown Model"}
                        </p>
                      </div>
                      <Badge className={`${config.color} text-xs group-hover:shadow-sm transition-shadow`}>
                        {machine.status}
                      </Badge>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {machines.length > 8 && (
          <div className="mt-6 pt-4 border-t">
            <Link to={createPageUrl("Machines")}>
              <p className="text-center text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                View all {machines.length} machines →
              </p>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}