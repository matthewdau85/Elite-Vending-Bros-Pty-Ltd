
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  MapPin, 
  Coffee,
  Save,
  Plus
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MachineStock, Machine, Location } from "@/api/entities";
import { toast } from "sonner"; // Added toast import

export default function PricingDialog({ open, onClose, product, onPriceUpdated }) { // Renamed onUpdate to onPriceUpdated
  const [machineStocks, setMachineStocks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Preserved initial state as true for loading data
  const [isSaving, setIsSaving] = useState(false);
  const [priceChanges, setPriceChanges] = useState({});
  const [basePrice, setBasePrice] = useState(0); // Added new state variable
  const [baseCost, setBaseCost] = useState(0); // Added new state variable

  const loadPricingData = useCallback(async () => {
    // Enhanced Guard Clause: Ensure product and its SKU exist before fetching data.
    if (!product || !product.sku) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [stocksData, machinesData, locationsData] = await Promise.all([
        MachineStock.filter({ product_sku: product.sku }),
        Machine.list(),
        Location.list()
      ]);
      
      setMachineStocks(stocksData);
      setMachines(machinesData);
      setLocations(locationsData);
      setPriceChanges({}); // Reset changes when new data is loaded

      // Set basePrice and baseCost from product data if available
      setBasePrice(product.base_price || 0);
      setBaseCost(product.base_cost || 0);

    } catch (error) {
      console.error("Error loading pricing data:", error);
      toast.error("Failed to load pricing data."); // Added toast notification
    }
    setIsLoading(false);
  }, [product]);

  useEffect(() => {
    // Only load data if the dialog is open and a product is provided
    if (open) {
      loadPricingData();
    }
    // No need for 'product' in this useEffect dependency array directly, 
    // as 'loadPricingData' already depends on 'product'
    // and 'loadPricingData' is a stable reference due to useCallback.
  }, [open, loadPricingData]);


  const getMachineInfo = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return { machine_id: "Unknown", location_name: "Unknown" };
    
    const location = locations.find(l => l.id === machine.location_id);
    return {
      machine_id: machine.machine_id,
      location_name: location ? location.name : "Unknown Location"
    };
  };

  const handlePriceChange = (stockId, newPrice) => {
    setPriceChanges(prev => ({
      ...prev,
      [stockId]: parseFloat(newPrice) || 0
    }));
  };

  const getCurrentPrice = (stock) => {
    if (priceChanges[stock.id] !== undefined) {
      return priceChanges[stock.id];
    }
    return stock.selling_price || product.base_price || 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update all changed prices
      const updatePromises = Object.entries(priceChanges).map(([stockId, newPrice]) => {
        const stock = machineStocks.find(s => s.id === stockId);
        // Ensure stock is found before attempting to update it, though typically stockId comes from machineStocks
        if (stock) {
          return MachineStock.update(stockId, {
            ...stock,
            selling_price: newPrice
          });
        }
        return Promise.resolve(); // Resolve immediately if stock not found
      });
      
      await Promise.all(updatePromises);
      
      // Notify parent component to refresh data
      if (onPriceUpdated) { // Changed onUpdate to onPriceUpdated
        await onPriceUpdated();
      }
      
      toast.success("Prices updated successfully!"); // Added toast notification
      onClose(); // Close the dialog on successful save
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error("Failed to update prices. Please try again."); // Added toast notification
    } finally {
      setIsSaving(false);
    }
  };

  const setUniformPrice = () => {
    const basePriceForUniform = product.base_price || 0; // Use product's base_price as reference
    const newChanges = {};
    machineStocks.forEach(stock => {
      newChanges[stock.id] = basePriceForUniform;
    });
    setPriceChanges(newChanges);
  };

  // If product is null or undefined, don't render the dialog content
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto"> {/* Preserved existing classNames */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"> {/* Preserved existing title and icon */}
            <DollarSign className="w-5 h-5 text-green-600" />
            Pricing: {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Overview */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Base Cost</p>
                  <p className="font-medium">${product.base_cost?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Base Price</p>
                  <p className="font-medium">${product.base_price?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">GST Rate</p>
                  <p className="font-medium">{(product.gst_rate * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={setUniformPrice}>
              <Plus className="w-4 h-4 mr-2" />
              Set All to Base Price (${product.base_price?.toFixed(2) || "0.00"})
            </Button>
          </div>

          {/* Machine Pricing Table */}
          <Card>
            <CardHeader>
              <CardTitle>Machine-Specific Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500">Loading pricing data...</p>
                </div>
              ) : machineStocks.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-slate-500">This product is not stocked in any machines yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Machine</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Slot</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Selling Price (ex GST)</TableHead>
                        <TableHead>Price incl GST</TableHead>
                        <TableHead>Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {machineStocks.map((stock) => {
                        const machineInfo = getMachineInfo(stock.machine_id);
                        const currentPrice = getCurrentPrice(stock);
                        // Ensure product.gst_rate is a number before calculation
                        const gstRate = typeof product.gst_rate === 'number' ? product.gst_rate : 0.1; // Default to 0.1 if not defined
                        const priceInclGst = currentPrice * (1 + gstRate);
                        const margin = currentPrice - (product.base_cost || 0);
                        const marginPercent = product.base_cost > 0 ? (margin / product.base_cost) * 100 : 0;
                        
                        return (
                          <TableRow key={stock.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Coffee className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{machineInfo.machine_id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{machineInfo.location_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{stock.slot_number}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {stock.current_stock || 0}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={currentPrice.toFixed(2)}
                                onChange={(e) => handlePriceChange(stock.id, e.target.value)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">${priceInclGst.toFixed(2)}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <span className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ${margin.toFixed(2)}
                                </span>
                                <span className={`text-xs block ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({marginPercent.toFixed(1)}%)
                                </span>
                              </div>
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

          {/* Summary */}
          {Object.keys(priceChanges).length > 0 && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Price Changes</h4>
                    <p className="text-sm text-slate-600">
                      {Object.keys(priceChanges).length} machine(s) will have updated prices
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {Object.keys(priceChanges).length} changes pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || Object.keys(priceChanges).length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Prices"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
