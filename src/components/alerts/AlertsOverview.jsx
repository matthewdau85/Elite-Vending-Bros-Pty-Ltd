import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, XCircle, Zap } from 'lucide-react';

export default function AlertsOverview({ counts, isLoading }) {
  const statCards = [
    {
      title: "Total Alerts",
      value: counts.total,
      icon: AlertTriangle,
      color: "text-slate-600",
      bgColor: "bg-slate-50"
    },
    {
      title: "Open Alerts",
      value: counts.open,
      icon: Zap,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Acknowledged",
      value: counts.acknowledged,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Critical Alerts",
      value: counts.critical,
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Resolved Today",
      value: counts.resolved,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className={`p-3 rounded-xl ${stat.bgColor} w-min`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}