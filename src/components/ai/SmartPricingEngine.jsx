import React, { useState } from "react";
import { SmartPricing } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SmartPricingEngine({ recommendations, machines, products, locations, isLoading, onRefresh }) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPricing = async (recommendationId, action) => {
    setIsApplying(true);
    try {
      await SmartPricing.update(recommendationId, { 
        status: action === "apply" ? "applied" : "rejected" 
      });
      onRefresh();
    } catch (error) {
      console.error("Error updating pricing:", error);
    }
    setIsApplying(false);
  };

  const getTotalProfitImpact = () => {
    return recommendations.reduce((sum, rec) => sum + (rec.profit_impact || 0), 0);
  };

  const getPriceChangeDirection = (current, recommended) => {
    if (recommended > current) return { direction: "increase", icon: TrendingUp, color: "text-green-600" };
    if (recommended < current) return { direction: "decrease", icon: TrendingDown, color: "text-red-600" };
    return { direction: "maintain", icon: Target, color: "text-blue-600" };
  };

  const totalProfitImpact = getTotalProfitImpact();

  return (
    <div className="space-y-6">
      {/* Profit Impact Summary */}
      {recommendations.length > 0 && (
        <Alert className={totalProfitImpact > 0 ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
          <DollarSign className={`w-4 h-4 ${totalProfitImpact > 0 ? "text-green-600" : "text-blue-600"}`} />
          <AlertDescription className={totalProfitImpact > 0 ? "text-green-800" : "text-blue-800"}>
            Implementing all pricing recommendations could 
            <strong> {totalProfitImpact > 0 ? "increase" : "change"} monthly profit by ${Math.abs(totalProfitImpact).toFixed(2)}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Price Increases</p>
                <p className="text-2xl font-bold text-green-900">
                  {recommendations.filter(r => r.recommended_price > r.current_price).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Price Decreases</p>
                <p className="text-2xl font-bold text-orange-900">
                  {recommendations.filter(r => r.recommended_price < r.current_price).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Optimal Prices</p>
                <p className="text-2xl font-bold text-blue-900">
                  {recommendations.filter(r => Math.abs(r.recommended_price - r.current_price) < 0.05).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Recommendations Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Pricing Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No Pricing Recommendations</h3>
              <p className="text-slate-500 text-sm">
                Click "Generate AI Insights" to get smart pricing suggestions based on demand and competition
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Recommended Price</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Profit Impact</TableHead>
                  <TableHead>Demand Level</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.map((rec) => {
                  const machine = machines.find(m => m.id === rec.machine_id);
                  const product = products.find(p => p.sku === rec.product_sku);
                  const priceChange = getPriceChangeDirection(rec.current_price, rec.recommended_price);
                  const ChangeIcon = priceChange.icon;
                  
                  return (
                    <TableRow key={`${rec.machine_id}-${rec.product_sku}`}>
                      <TableCell>
                        <span className="font-medium">Machine {machine?.machine_id || rec.machine_id}</span>
                      </TableCell>
                      <TableCell>
                        {product?.name || rec.product_sku}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">${rec.current_price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold">${rec.recommended_price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ChangeIcon className={`w-4 h-4 ${priceChange.color}`} />
                          <span className={`font-medium ${priceChange.color}`}>
                            ${Math.abs(rec.recommended_price - rec.current_price).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={rec.profit_impact > 0 ? "text-green-600 font-semibold" : "text-red-600"}>
                          ${rec.profit_impact > 0 ? "+" : ""}{rec.profit_impact.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          rec.demand_level === "high" ? "bg-green-100 text-green-800" :
                          rec.demand_level === "medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-blue-100 text-blue-800"
                        }>
                          {rec.demand_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleApplyPricing(rec.id, "apply")}
                            disabled={isApplying}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplyPricing(rec.id, "reject")}
                            disabled={isApplying}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}