
import React, { useState } from "react";
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
import { safeArray } from "../shared/SearchUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SalesOverview({ sales = [], machines = [], locations = [], products = [], isLoading }) {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const getPeriodData = () => {
    const now = new Date();
    let startDate;

    // Create a new Date object to avoid modifying the 'now' variable directly in switch cases
    let tempDate = new Date(now.getTime());

    switch (selectedPeriod) {
      case "today":
        startDate = new Date(tempDate.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(tempDate.setDate(tempDate.getDate() - 7));
        startDate.setHours(0, 0, 0, 0); // Reset hours for consistency
        break;
      case "month":
        startDate = new Date(tempDate.setMonth(tempDate.getMonth() - 1));
        startDate.setHours(0, 0, 0, 0); // Reset hours for consistency
        break;
      default:
        startDate = new Date(tempDate.setHours(0, 0, 0, 0));
    }

    const filteredSales = safeArray(sales).filter(sale => {
      if (!sale?.sale_datetime) return false;
      try {
        const saleDate = new Date(sale.sale_datetime);
        return saleDate >= startDate;
      } catch (e) {
        console.error("Invalid sale_datetime for filtering:", sale.sale_datetime, e);
        return false;
      }
    });

    // --- Metrics calculations based on filteredSales (combination of original getMetrics and new outline) ---
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalTransactions = filteredSales.length;
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const completedSales = filteredSales.filter(s => (s.status || "").toLowerCase() === "completed");
    const refundedSales = filteredSales.filter(s => (s.status || "").toLowerCase() === "refunded");
    const failedSales = filteredSales.filter(s => (s.status || "").toLowerCase() === "failed");

    const paymentMethods = filteredSales.reduce((acc, sale) => {
      const method = sale.payment_method || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // --- Top selling products calculation (from outline) ---
    const productSales = {};
    filteredSales.forEach(sale => {
      const sku = (sale.product_sku || "unknown").toLowerCase(); // Normalize SKU to lowercase for grouping
      productSales[sku] = (productSales[sku] || 0) + (sale.quantity || 1);
    });

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sku, quantity]) => {
        // Find product with case-insensitive SKU match
        const product = safeArray(products).find(p => (p?.sku || "").toLowerCase() === sku);
        return {
          name: product ? (product.name || `SKU: ${sku}`) : `SKU: ${sku}`,
          quantity,
          // Calculate revenue for this specific product within the filtered sales
          revenue: filteredSales
            .filter(sale => (sale.product_sku || "").toLowerCase() === sku)
            .reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
        };
      });

    return {
      totalRevenue,
      totalTransactions,
      totalQuantity,
      avgTransaction,
      completedSales: completedSales.length,
      refundedSales: refundedSales.length,
      failedSales: failedSales.length,
      paymentMethods,
      topProducts,
      periodSales: filteredSales // This includes the actual sales objects for the period
    };
  };

  const getLocationInfo = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return { name: "Unknown", machine_count: 0 };

    const location = locations.find(l => l.id === machine.location_id);
    const locationMachines = machines.filter(m => m.location_id === machine.location_id);

    return {
      name: location ? (location.name || "Unknown") : "Unknown",
      machine_count: locationMachines.length
    };
  };

  const getProductInfo = (sku) => {
    const product = safeArray(products).find(p => (p.sku || "").toLowerCase() === (sku || "").toLowerCase());
    return {
      name: product ? (product.name || "Unknown Product") : "Unknown Product",
      category: product ? (product.category || "other") : "other"
    };
  };

  const metrics = getPeriodData(); // Now 'metrics' object contains all calculated data for the selected period

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
      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sales Overview</h2>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Top Selling Products (New section implied by outline, but not explicitly requested for UI) */}
      {/* If you wish to display top products, you would add another Card component here
          iterating over `metrics.topProducts` */}
    </div>
  );
}
