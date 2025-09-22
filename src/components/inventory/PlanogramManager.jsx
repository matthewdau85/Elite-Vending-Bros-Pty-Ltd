
import React, { useState, useEffect, useCallback } from 'react';
import { Planogram, Machine, Product, Location } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Coffee, Package, Plus, Edit, Save, X, 
  AlertTriangle, CheckCircle, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';
import FeatureGate from '../features/FeatureGate';

const SlotEditor = ({ slot, products, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    product_sku: slot?.product_sku || '',
    capacity: slot?.capacity || 10,
    par_level: slot?.par_level || 3,
    max_level: slot?.max_level || slot?.capacity || 10,
    selling_price_cents: slot?.selling_price_cents || 0,
    priority: slot?.priority || 1,
    is_active: slot?.is_active ?? true
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product_sku) {
      toast.error('Please select a product');
      return;
    }
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="product">Product</Label>
        <Select value={formData.product_sku} onValueChange={(value) => setFormData({...formData, product_sku: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map(product => (
              <SelectItem key={product.sku} value={product.sku}>
                {product.name} ({product.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label htmlFor="par_level">Par Level</Label>
          <Input
            id="par_level"
            type="number"
            value={formData.par_level}
            onChange={(e) => setFormData({...formData, par_level: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max_level">Max Level</Label>
          <Input
            id="max_level"
            type="number"
            value={formData.max_level}
            onChange={(e) => setFormData({...formData, max_level: parseInt(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 1})}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="price">Selling Price ($)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={(formData.selling_price_cents / 100).toFixed(2)}
          onChange={(e) => setFormData({...formData, selling_price_cents: Math.round(parseFloat(e.target.value) * 100) || 0})}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
        />
        <Label htmlFor="is_active">Active Slot</Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default function PlanogramManager() {
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [planograms, setPlanograms] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showSlotEditor, setShowSlotEditor] = useState(false);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [machineData, productData, locationData, planogramData] = await Promise.all([
        Machine.list(),
        Product.filter({ status: 'active' }),
        Location.list(),
        Planogram.list()
      ]);
      
      setMachines(machineData);
      setProducts(productData);
      setLocations(locationData);
      setPlanograms(planogramData);
      
      if (machineData.length > 0 && !selectedMachine) {
        setSelectedMachine(machineData[0]);
      }
    } catch (error) {
      toast.error('Failed to load planogram data');
      console.error('Error loading planogram data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMachine]); // Add selectedMachine to dependencies for useCallback
  
  useEffect(() => {
    loadData();
  }, [loadData]); // Add loadData to dependencies for useEffect
  
  const getMachinePlanogram = (machineId) => {
    return planograms.filter(p => p.machine_id === machineId);
  };
  
  const handleSlotSave = async (slotNumber, data) => {
    try {
      const existingSlot = planograms.find(p => 
        p.machine_id === selectedMachine.id && p.slot_number === slotNumber
      );
      
      const slotData = {
        ...data,
        machine_id: selectedMachine.id,
        slot_number: slotNumber,
        last_updated: new Date().toISOString(),
        updated_by: 'current_user' // Would be actual user email
      };
      
      if (existingSlot) {
        await Planogram.update(existingSlot.id, slotData);
      } else {
        await Planogram.create(slotData);
      }
      
      await loadData();
      setShowSlotEditor(false);
      setEditingSlot(null);
      toast.success('Slot configuration saved');
    } catch (error) {
      toast.error('Failed to save slot configuration');
      console.error('Error saving slot:', error);
    }
  };
  
  const copyPlanogramTo = async (targetMachineId) => {
    if (!selectedMachine || !targetMachineId) return;
    
    try {
      const sourcePlanogram = getMachinePlanogram(selectedMachine.id);
      const copyPromises = sourcePlanogram.map(slot => 
        Planogram.create({
          machine_id: targetMachineId,
          slot_number: slot.slot_number,
          product_sku: slot.product_sku,
          capacity: slot.capacity,
          par_level: slot.par_level,
          max_level: slot.max_level,
          selling_price_cents: slot.selling_price_cents,
          priority: slot.priority,
          is_active: slot.is_active,
          last_updated: new Date().toISOString(),
          updated_by: 'current_user'
        })
      );
      
      await Promise.all(copyPromises);
      await loadData();
      toast.success(`Copied planogram to machine ${targetMachineId}`);
    } catch (error) {
      toast.error('Failed to copy planogram');
      console.error('Error copying planogram:', error);
    }
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading planogram data..." />;
  }
  
  const machinePlanogram = selectedMachine ? getMachinePlanogram(selectedMachine.id) : [];
  const selectedLocation = selectedMachine?.location_id ? 
    locations.find(l => l.id === selectedMachine.location_id) : null;
  
  // Generate slot grid (assuming 6x8 = 48 slots)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];
  
  return (
    <FeatureGate feature="inventory.core">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Planogram Manager</h2>
            <p className="text-slate-600">Configure product placement and stock levels for each machine</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Planogram
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Copy Planogram</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Copy the current planogram from {selectedMachine?.machine_id} to another machine.
                  </p>
                  <Select onValueChange={copyPlanogramTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.filter(m => m.id !== selectedMachine?.id).map(machine => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.machine_id} ({locations.find(l => l.id === machine.location_id)?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Machine Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Machines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {machines.map(machine => {
                const location = locations.find(l => l.id === machine.location_id);
                const isSelected = selectedMachine?.id === machine.id;
                
                return (
                  <div
                    key={machine.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedMachine(machine)}
                  >
                    <div className="font-medium">{machine.machine_id}</div>
                    <div className="text-sm text-slate-600">{location?.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {getMachinePlanogram(machine.id).length} slots configured
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Planogram Grid */}
          <div className="lg:col-span-3">
            {selectedMachine ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {selectedMachine.machine_id}
                    </div>
                    <div className="text-sm font-normal text-slate-600">
                      {selectedLocation?.name}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-2">
                    {rows.map(row => 
                      cols.map(col => {
                        const slotNumber = `${row}${col}`;
                        const slotConfig = machinePlanogram.find(p => p.slot_number === slotNumber);
                        const product = slotConfig ? products.find(p => p.sku === slotConfig.product_sku) : null;
                        
                        return (
                          <div
                            key={slotNumber}
                            className={`aspect-square border-2 border-dashed border-slate-200 rounded-lg p-2 cursor-pointer transition-all hover:border-slate-300 ${
                              slotConfig ? (slotConfig.is_active ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-300') : ''
                            }`}
                            onClick={() => {
                              setEditingSlot(slotNumber);
                              setShowSlotEditor(true);
                            }}
                          >
                            <div className="h-full flex flex-col justify-between text-xs">
                              <div className="font-mono font-bold text-slate-700">{slotNumber}</div>
                              {slotConfig ? (
                                <div className="space-y-1">
                                  <div className="font-semibold truncate" title={product?.name}>
                                    {product?.name?.substring(0, 8)}
                                  </div>
                                  <div className="text-slate-600">
                                    {slotConfig.par_level}/{slotConfig.capacity}
                                  </div>
                                  <div className="text-slate-500">
                                    ${(slotConfig.selling_price_cents / 100).toFixed(2)}
                                  </div>
                                  {!slotConfig.is_active && (
                                    <Badge className="bg-red-100 text-red-800 text-xs">Inactive</Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="text-slate-400 text-center">
                                  <Plus className="w-4 h-4 mx-auto" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                      <span>Active Slot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-50 border border-slate-300 rounded"></div>
                      <span>Inactive Slot</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-dashed border-slate-200 rounded"></div>
                      <span>Empty Slot</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Select a machine to view its planogram</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Slot Editor Dialog */}
        <Dialog open={showSlotEditor} onOpenChange={setShowSlotEditor}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Configure Slot {editingSlot} - {selectedMachine?.machine_id}
              </DialogTitle>
            </DialogHeader>
            {editingSlot && (
              <SlotEditor
                slot={machinePlanogram.find(p => p.slot_number === editingSlot)}
                products={products}
                onSave={(data) => handleSlotSave(editingSlot, data)}
                onCancel={() => {
                  setShowSlotEditor(false);
                  setEditingSlot(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGate>
  );
}
