import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  MapPin,
  Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function StatsOverview({ stats, isLoading }) {
  const statCards = [
    {
      title: "Machines Online",
      value: `${stats.onlineMachines}/${stats.totalMachines}`,
      icon: Coffee,
      color: stats.onlineMachines === stats.totalMachines ? "text-green-600" : "text-amber-600",
      bgColor: stats.onlineMachines === stats.totalMachines ? "bg-green-50" : "bg-amber-50"
    },
    {
      title: "Today's Revenue",
      value: `$${stats.todaysRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: `${stats.todaysTransactions} transactions`
    },
    {
      title: "Critical Alerts",
      value: stats.criticalAlerts,
      icon: AlertTriangle,
      color: stats.criticalAlerts > 0 ? "text-red-600" : "text-green-600",
      bgColor: stats.criticalAlerts > 0 ? "bg-red-50" : "bg-green-50"
    },
    {
      title: "Active Locations",
      value: stats.totalLocations,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bgColor} rounded-full opacity-20 transform translate-x-8 -translate-y-8`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.title === "Machines Online" && stats.onlineMachines === stats.totalMachines && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    All Online
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                )}
                {stat.trend && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}