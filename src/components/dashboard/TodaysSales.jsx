
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function TodaysSales({ sales, isLoading }) {
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  
  const todaysSales = sales.filter(
    sale => new Date(sale.sale_datetime) >= todayStart
  );
  
  const recentSales = todaysSales
    .sort((a, b) => new Date(b.sale_datetime) - new Date(a.sale_datetime))
    .slice(0, 10);

  const totalRevenue = todaysSales.reduce(
    (sum, sale) => sum + (sale.total_amount || 0), 
    0
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5 text-green-600" />
            Today's Sales
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ${totalRevenue.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : recentSales.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No Sales Today</h3>
            <p className="text-slate-500 text-sm">Sales will appear here as they happen</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900 text-sm">
                        Machine {sale.machine_id}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {sale.product_sku}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(sale.sale_datetime), "h:mm a")}</span>
                      <span>•</span>
                      <span>{sale.payment_method}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      ${sale.total_amount?.toFixed(2)}
                    </p>
                    {sale.quantity > 1 && (
                      <p className="text-xs text-slate-500">
                        {sale.quantity}x
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {todaysSales.length > 0 && (
          <div className="p-4 border-t bg-slate-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {todaysSales.length} transactions today
              </span>
              <Link to={createPageUrl("Sales")} className="flex items-center gap-1 text-green-600 hover:underline">
                <TrendingUp className="w-3 h-3" />
                View Details
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
