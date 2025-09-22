import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  AlertTriangle, 
  Truck,
  FileText,
  Calendar,
  Package
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PickingListDialog from "./PickingListDialog";

export default function ReorderPlanner({ 
  products, 
  machineStocks, 
  machines, 
  locations, 
  suppliers,
  lowStockItems,
  forecasts, // <-- New prop
  isLoading 
}) {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showPickingList, setShowPickingList] = useState(false);

  const getReorderSuggestions = useMemo(() => {
    const suggestions = {};
    const forecastByMachineProduct = {};

    // Aggregate forecast data for the next 7 days for easier lookup
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    forecasts.forEach(f => {
      if (new Date(f.forecast_date) <= sevenDaysFromNow) {
        const key = `${f.machine_id}-${f.product_sku}`;
        if (!forecastByMachineProduct[key]) {
          forecastByMachineProduct[key] = 0;
        }
        forecastByMachineProduct[key] += f.predicted_demand;
      }
    });

    // Use a combined list of all stocks, not just low stock items, for forecasting
    machineStocks.forEach(stock => {
      const product = products.find(p => p.sku === stock.product_sku);
      const machine = machines.find(m => m.id === stock.machine_id);
      const location = locations.find(l => l.id === machine?.location_id);
      
      if (!product || !machine) return;

      const forecastKey = `${machine.id}-${product.sku}`;
      const predictedDemand = forecastByMachineProduct[forecastKey] || (stock.par_level); // Fallback to par level if no forecast
      const neededQuantity = Math.max(0, Math.round(predictedDemand) - (stock.current_stock || 0));

      if (neededQuantity <= 0) return;

      const productKey = product.sku;
      if (!suggestions[productKey]) {
        suggestions[productKey] = {
          product,
          supplier: suppliers.find(s => s.id === product.supplier_id),
          machines_needing_stock: [],
          total_needed: 0,
          priority: 'medium'
        };
      }
      
      suggestions[productKey].machines_needing_stock.push({
        machine_id: machine?.machine_id,
        location_name: location?.name,
        slot_number: stock.slot_number,
        current_stock: stock.current_stock || 0,
        needed: neededQuantity
      });
      
      suggestions[productKey].total_needed += neededQuantity;
      
      if ((stock.current_stock || 0) === 0) {
        suggestions[productKey].priority = 'critical';
      } else if (suggestions[productKey].machines_needing_stock.length >= 3 && suggestions[productKey].priority !== 'critical') {
        suggestions[productKey].priority = 'high';
      }
    });
    
    return Object.values(suggestions).sort((a, b) => {
        const priorities = { critical: 3, high: 2, medium: 1 };
        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
    });
  }, [machineStocks, products, machines, locations, suppliers, forecasts]);

  const reorderSuggestions = getReorderSuggestions;

  const toggleItemSelection = (productSku) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(productSku)) {
      newSelection.delete(productSku);
    } else {
      newSelection.add(productSku);
    }
    setSelectedItems(newSelection);
  };

  const generatePickingList = () => {
    if (selectedItems.size === 0) {
      alert("Please select items to include in the picking list.");
      return;
    }
    setShowPickingList(true);
  };

  const priorityColors = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">AI-Powered Reorder Planning</h3>
              <p className="text-sm text-slate-600">
                {reorderSuggestions.length} products need restocking based on demand forecasts.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={generatePickingList} disabled={selectedItems.size === 0}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Picking List ({selectedItems.size})
              </Button>
              <Link to={createPageUrl("Routes")}>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Plan Routes
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Reorder Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-spin" />
              <p className="text-slate-500">Loading reorder suggestions...</p>
            </div>
          ) : reorderSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">All Stock Levels Good!</h3>
              <p className="text-slate-500 text-sm">
                No products currently need restocking based on demand forecasts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.size === reorderSuggestions.length && reorderSuggestions.length > 0}
                        onChange={() => {
                          if (selectedItems.size === reorderSuggestions.length) {
                            setSelectedItems(new Set());
                          } else {
                            setSelectedItems(new Set(reorderSuggestions.map(s => s.product.sku)));
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Machines Affected</TableHead>
                    <TableHead className="text-center">Total Needed</TableHead>
                    <TableHead className="text-center">Est. Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reorderSuggestions.map((suggestion) => {
                    const estimatedCost = suggestion.total_needed * (suggestion.product.base_cost || 0);
                    
                    return (
                      <TableRow key={suggestion.product.sku} className="hover:bg-slate-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedItems.has(suggestion.product.sku)}
                            onChange={() => toggleItemSelection(suggestion.product.sku)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{suggestion.product.name}</p>
                            <p className="text-xs text-slate-500">{suggestion.product.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">
                              {suggestion.supplier?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${priorityColors[suggestion.priority]} border`}>
                            {suggestion.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{suggestion.machines_needing_stock.length}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{suggestion.total_needed}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">${estimatedCost.toFixed(2)}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <PickingListDialog 
        open={showPickingList}
        onClose={() => setShowPickingList(false)}
        items={reorderSuggestions.filter(s => selectedItems.has(s.product.sku))}
      />
    </div>
  );
}