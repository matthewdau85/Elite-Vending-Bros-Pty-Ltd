
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import { MachineStock } from "@/api/entities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, RotateCw, Filter } from "lucide-react";
import { safeArray, safeIncludes } from "../shared/SearchUtils";

export default function StockOverview({ machineStocks, products, machines, locations, onUpdate, isLoading }) {
  const [editingStockId, setEditingStockId] = useState(null);
  const [editableStock, setEditableStock] = useState({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const machineIdParam = params.get("machine");
    if (machineIdParam) {
      setMachineFilter(machineIdParam);
    }
  }, [location.search]);

  const handleEdit = (stock) => {
    setEditingStockId(stock.id);
    setEditableStock({ ...stock });
  };

  const handleCancel = () => {
    setEditingStockId(null);
    setEditableStock({});
  };

  const handleSave = async () => {
    if (!editableStock.id) return;
    try {
      const { id, ...updateData } = editableStock;
      // Ensure numeric fields are numbers
      updateData.current_stock = Number(updateData.current_stock);
      updateData.par_level = Number(updateData.par_level);
      
      await MachineStock.update(id, updateData);
      setEditingStockId(null);
      onUpdate();
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Update failed. Please try again.");
    }
  };

  const handleChange = (field, value) => {
    setEditableStock(prev => ({ ...prev, [field]: value }));
  };

  const getProductAndLocation = useCallback((stock) => {
    const product = products.find(p => p.sku === stock.product_sku);
    const machine = machines.find(m => m.id === stock.machine_id);
    const location = locations.find(l => l.id === machine?.location_id);
    return { product, location, machine };
  }, [products, machines, locations]);

  const filteredStocks = useMemo(() => {
    return safeArray(machineStocks).filter(stock => {
      const { product, location, machine } = getProductAndLocation(stock);
      
      const matchesLocation = locationFilter === 'all' || location?.id === locationFilter;
      const matchesMachine = machineFilter === 'all' || machine?.id === machineFilter;
      const matchesSearch = !searchTerm ||
                            safeIncludes(product?.name, searchTerm) ||
                            safeIncludes(product?.sku, searchTerm) ||
                            safeIncludes(machine?.machine_id, searchTerm);

      return matchesLocation && matchesMachine && matchesSearch;
    });
  }, [machineStocks, searchTerm, locationFilter, machineFilter, getProductAndLocation]);

  const availableMachines = useMemo(() => {
    if (locationFilter === 'all') return machines;
    return machines.filter(m => m.location_id === locationFilter);
  }, [machines, locationFilter]);

  const stockLevelColor = (current, par) => {
    const stock = current ?? 0;
    const parLevel = par ?? 0;
    if (stock <= 0) return "bg-red-100 text-red-800";
    if (stock <= parLevel) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-4 border rounded-lg bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 md:col-span-1">
          <Filter className="w-4 h-4" /> Filters
        </h3>
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input 
            placeholder="Search by product or machine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={machineFilter} onValueChange={setMachineFilter}>
            <SelectTrigger><SelectValue placeholder="All Machines" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {availableMachines.map(m => <SelectItem key={m.id} value={m.id}>{m.machine_id}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Product</TableHead>
              <TableHead>Location / Machine</TableHead>
              <TableHead className="text-center">Stock Level</TableHead>
              <TableHead className="text-center">Par Level</TableHead>
              <TableHead>Last Restocked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="p-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredStocks.length > 0 ? (
              filteredStocks.map(stock => {
                const { product, location, machine } = getProductAndLocation(stock);
                const isEditing = editingStockId === stock.id;
                
                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <div>{product?.name || "Unknown Product"}</div>
                      <div className="text-xs text-slate-500">SKU: {stock.product_sku}</div>
                    </TableCell>
                    <TableCell>
                      <div>{location?.name || "Unknown Location"}</div>
                      <div className="text-xs text-slate-500">Machine: {machine?.machine_id}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input 
                          type="number" 
                          value={editableStock.current_stock || ''} 
                          onChange={(e) => handleChange('current_stock', e.target.value)}
                          className="w-20 mx-auto"
                        />
                      ) : (
                        <Badge className={stockLevelColor(stock.current_stock, stock.par_level)}>
                          {stock.current_stock ?? 'N/A'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input 
                          type="number" 
                          value={editableStock.par_level || ''}
                          onChange={(e) => handleChange('par_level', e.target.value)}
                          className="w-20 mx-auto"
                        />
                      ) : (
                        stock.par_level ?? 'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {stock.last_restocked ? new Date(stock.last_restocked).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <Button size="icon" variant="ghost" onClick={handleSave}><Save className="w-4 h-4 text-green-600"/></Button>
                          <Button size="icon" variant="ghost" onClick={handleCancel}><X className="w-4 h-4 text-red-600"/></Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(stock)}>
                          <Edit className="w-3 h-3 mr-2" /> Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="font-semibold">No stock data found</p>
                  <p className="text-slate-500">Try adjusting your filters or add products to machines.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
