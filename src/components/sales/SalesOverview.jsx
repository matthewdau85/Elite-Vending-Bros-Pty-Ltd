import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function SalesOverview({ sales, machines, locations, products, isLoading }) {
  const getMetrics = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalTransactions = sales.length;
    const totalQuantity = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const completedSales = sales.filter(s => s.status === "completed");
    const refundedSales = sales.filter(s => s.status === "refunded");
    const failedSales = sales.filter(s => s.status === "failed");
    
    const paymentMethods = sales.reduce((acc, sale) => {
      acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalTransactions,
      totalQuantity,
      avgTransaction,
      completedSales: completedSales.length,
      refundedSales: refundedSales.length,
      failedSales: failedSales.length,
      paymentMethods
    };
  };

  const metrics = getMetrics();

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Transactions",
      value: metrics.totalTransactions,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: `${metrics.totalQuantity} items sold`
    },
    {
      title: "Avg Transaction",
      value: `$${metrics.avgTransaction.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Success Rate",
      value: `${metrics.totalTransactions > 0 ? ((metrics.completedSales / metrics.totalTransactions) * 100).toFixed(1) : 0}%`,
      icon: CreditCard,
      color: metrics.failedSales > 0 ? "text-orange-600" : "text-green-600",
      bgColor: metrics.failedSales > 0 ? "bg-orange-50" : "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
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

      {/* Payment Methods & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(metrics.paymentMethods).map(([method, count]) => (
                  <div key={method} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {method.replace("_", " ")}
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
                {Object.keys(metrics.paymentMethods).length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No payment data available</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Transaction Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Completed</span>
                  <Badge className="bg-green-100 text-green-800">{metrics.completedSales}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Refunded</span>
                  <Badge className="bg-red-100 text-red-800">{metrics.refundedSales}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Failed</span>
                  <Badge className="bg-orange-100 text-orange-800">{metrics.failedSales}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}