
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Check, X, RefreshCw, Sparkles, DollarSign } from "lucide-react";
import { SmartPricing, MachineStock } from "@/api/entities";

import PermissionCheck from "../shared/PermissionCheck";
import ConfirmationDialog from "../shared/ConfirmationDialog";

export default function SmartPricingEngine({ recommendations = [], machines = [], products = [], locations = [], isLoading, onRefresh }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState(null);

  const handleApply = async (recommendation) => {
    // Step 1: Update the MachineStock selling_price
    const machineStocks = await MachineStock.filter({
      machine_id: recommendation.machine_id,
      product_sku: recommendation.product_sku
    });

    if (machineStocks.length > 0) {
      const stockToUpdate = machineStocks[0];
      await MachineStock.update(stockToUpdate.id, {
        selling_price: recommendation.recommended_price
      });
    } else {
       console.warn(`Could not find MachineStock for machine ${recommendation.machine_id} and product ${recommendation.product_sku} to update price.`);
    }

    // Step 2: Mark the recommendation as "applied"
    await SmartPricing.update(recommendation.id, { status: "applied", current_price: recommendation.recommended_price });
    onRefresh();
  };

  const handleReject = async (id) => {
    await SmartPricing.update(id, { status: "rejected" });
    onRefresh();
  };

  const openConfirmDialog = (item) => {
    setConfirmingItem(item);
    setIsConfirming(true);
  };

  const onConfirmApply = () => {
    if (confirmingItem) {
      handleApply(confirmingItem);
    }
    setIsConfirming(false);
    setConfirmingItem(null);
  };

  const getProduct = (sku) => products.find(p => p.sku === sku);
  const getMachine = (id) => machines.find(m => m.id === id);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Smart Pricing Recommendations
              </CardTitle>
              <CardDescription>
                AI-driven price optimizations to maximize profitability.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Recommended Price</TableHead>
                  <TableHead className="text-right">Profit Impact</TableHead>
                  <TableHead className="text-center">Demand</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : recommendations.length > 0 ? (
                  recommendations.map(rec => {
                    const product = getProduct(rec.product_sku);
                    const machine = getMachine(rec.machine_id);
                    const isPriceIncrease = rec.recommended_price > rec.current_price;

                    return (
                      <TableRow key={rec.id}>
                        <TableCell>
                          <div className="font-medium">{product?.name || rec.product_sku}</div>
                        </TableCell>
                        <TableCell>
                          <div>Machine {machine?.machine_id || rec.machine_id}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${rec.current_price?.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${isPriceIncrease ? 'text-green-600' : 'text-red-600'}`}>
                          ${rec.recommended_price?.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right flex items-center justify-end gap-1 ${rec.profit_impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rec.profit_impact > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          {Math.abs(rec.profit_impact * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="capitalize">{rec.demand_level}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <PermissionCheck requiredRole="ops_admin">
                              <Button
                                size="sm"
                                onClick={() => openConfirmDialog(rec)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Apply
                              </Button>
                            </PermissionCheck>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(rec.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div>
                        <Sparkles className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                          No pending price recommendations
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Run the AI Insights generator to get new suggestions.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ConfirmationDialog
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={onConfirmApply}
        title="Confirm Price Change"
        description={`This will immediately apply the new price of $${confirmingItem?.recommended_price.toFixed(2)} to ${getProduct(confirmingItem?.product_sku)?.name || 'the product'} at Machine ${getMachine(confirmingItem?.machine_id)?.machine_id || 'N/A'}. This action updates the live machine stock price and cannot be easily undone.`}
        confirmationText="APPLY"
        confirmButtonText="Apply Price"
        confirmButtonVariant="default"
      />
    </>
  );
}
