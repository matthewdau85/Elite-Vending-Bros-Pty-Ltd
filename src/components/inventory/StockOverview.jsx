
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Package, 
  MapPin,
  Coffee,
  Search,
  TrendingDown,
  Trash2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MachineStock } from "@/api/entities";

export default function StockOverview({ 
  machineStocks, 
  products, 
  machines, 
  locations, 
  onUpdate,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const getProductName = (sku) => {
    const product = products.find(p => p.sku === sku);
    return product ? product.name : sku;
  };

  const getMachineInfo = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return { machine_id: machineId, location_name: "Unknown" };
    
    const location = locations.find(l => l.id === machine.location_id);
    return {
      machine_id: machine.machine_id,
      location_name: location ? location.name : "Unknown Location"
    };
  };

  const handleDeleteStock = async (stockId) => {
    if (window.confirm("Are you sure you want to delete this stock record? This action cannot be undone.")) {
      try {
        await MachineStock.delete(stockId);
        onUpdate();
        alert("Stock record deleted successfully.");
      } catch (error) {
        console.error("Failed to delete stock record:", error);
        alert(`Failed to delete stock record: ${error.message}`);
      }
    }
  };

  const filteredStocks = machineStocks.filter(stock => {
    const productName = getProductName(stock.product_sku);
    const machineInfo = getMachineInfo(stock.machine_id);
    
    const matchesSearch = 
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machineInfo.machine_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machineInfo.location_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !showLowStockOnly || 
      (stock.current_stock || 0) <= (stock.par_level || 0);
    
    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (currentStock, parLevel) => {
    if (currentStock === 0) return { status: "empty", color: "bg-red-100 text-red-800", text: "Empty" };
    if (currentStock <= parLevel) return { status: "low", color: "bg-yellow-100 text-yellow-800", text: "Low" };
    return { status: "ok", color: "bg-green-100 text-green-800", text: "OK" };
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by product, machine, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={showLowStockOnly ? "default" : "outline"}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className="w-full md:w-auto"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {showLowStockOnly ? "Show All Stock" : "Show Low Stock Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Stock Levels ({filteredStocks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">
                {machineStocks.length === 0 ? "No Stock Data" : "No Stock Found"}
              </h3>
              <p className="text-slate-500 text-sm">
                {machineStocks.length === 0 
                  ? "Stock levels will appear here once machines are configured"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Product</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Par Level</TableHead>
                    <TableHead className="text-center">Capacity</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => {
                    const productName = getProductName(stock.product_sku);
                    const machineInfo = getMachineInfo(stock.machine_id);
                    const stockStatus = getStockStatus(
                      stock.current_stock || 0, 
                      stock.par_level || 0
                    );
                    
                    return (
                      <TableRow key={`${stock.machine_id}-${stock.product_sku}-${stock.slot_number}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{productName}</p>
                            <p className="text-xs text-slate-500">{stock.product_sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{machineInfo.machine_id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{machineInfo.location_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {stock.slot_number}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {stock.current_stock || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {stock.par_level || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {stock.capacity || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${stockStatus.color} border`}>
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteStock(stock.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}
