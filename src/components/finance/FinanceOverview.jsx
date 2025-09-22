
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Landmark, Percent } from 'lucide-react';

export default function FinanceOverview({ metrics, isLoading }) {
  // Provide default values to prevent undefined errors
  const safeMetrics = {
    totalRevenue: 0,
    grossProfit: 0,
    grossMargin: 0,
    totalFees: 0,
    totalGst: 0,
    ...metrics
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${safeMetrics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Gross sales including GST"
    },
    {
      title: "Gross Profit",
      value: `$${safeMetrics.grossProfit.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: `Margin: ${safeMetrics.grossMargin.toFixed(1)}%`
    },
    {
      title: "Processing Fees",
      value: `$${safeMetrics.totalFees.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Fees from payment processors"
    },
    {
      title: "GST Collected",
      value: `$${safeMetrics.totalGst.toFixed(2)}`,
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "GST component of total sales"
    },
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
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className={`p-3 rounded-xl ${stat.bgColor} w-min`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
