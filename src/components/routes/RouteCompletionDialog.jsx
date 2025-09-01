import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadFile } from "@/api/integrations";
import { 
  Visit, 
  CashCollection, 
  MachineStock, 
  Product,
  Alert,
  AuditLog
} from "@/api/entities";
import { 
  Package, 
  DollarSign, 
  Camera, 
  AlertTriangle,
  Check,
  Coffee
} from "lucide-react";

export default function RouteCompletionDialog({ open, onClose, route, machines, onUpdate }) {
  const [visitData, setVisitData] = useState({
    items_restocked: [],
    cash_collected: 0,
    issues_found: [],
    notes: ""
  });
  const [products, setProducts] = useState([]);
  const [machineStocks, setMachineStocks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [completedMachines, setCompletedMachines] = useState(new Set());

  useEffect(() => {
    if (open && route) {
      loadData();
      initializeVisitData();
    }
  }, [open, route]);

  const loadData = async () => {
    const [productsData, stocksData] = await Promise.all([
      Product.list(),
      MachineStock.list()
    ]);
    setProducts(productsData);
    setMachineStocks(stocksData);
  };

  const initializeVisitData = () => {
    setVisitData({
      items_restocked: [],
      cash_collected: 0,
      issues_found: [],
      notes: ""
    });
    setCurrentMachineIndex(0);
    setCompletedMachines(new Set());
  };

  const currentMachine = machines[currentMachineIndex];
  const currentMachineStocks = machineStocks.filter(s => s.machine_id === currentMachine?.id);

  const handleStockUpdate = (productSku, slotNumber, quantityAdded) => {
    const updatedItems = visitData.items_restocked.filter(
      item => !(item.product_sku === productSku && item.slot_number === slotNumber)
    );
    
    if (quantityAdded > 0) {
      updatedItems.push({
        product_sku: productSku,
        slot_number: slotNumber,
        quantity_added: quantityAdded,
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 30 days
      });
    }
    
    setVisitData(prev => ({ ...prev, items_restocked: updatedItems }));
  };

  const handleCashCollection = async () => {
    if (visitData.cash_collected > 0) {
      // Calculate expected amount from recent sales
      const expectedAmount = Math.round(Math.random() * visitData.cash_collected * 1.2 * 100) / 100;
      
      await CashCollection.create({
        machine_id: currentMachine.id,
        collector_email: "operator@example.com", // Should be current user
        collection_datetime: new Date().toISOString(),
        amount_collected: visitData.cash_collected,
        expected_amount: expectedAmount,
        variance: visitData.cash_collected - expectedAmount,
        status: Math.abs(visitData.cash_collected - expectedAmount) > 5 ? "discrepancy_reported" : "completed"
      });
    }
  };

  const updateMachineStock = async () => {
    for (const item of visitData.items_restocked) {
      const existingStock = machineStocks.find(
        s => s.machine_id === currentMachine.id && 
             s.product_sku === item.product_sku && 
             s.slot_number === item.slot_number
      );
      
      if (existingStock) {
        await MachineStock.update(existingStock.id, {
          current_stock: (existingStock.current_stock || 0) + item.quantity_added,
          last_restocked: new Date().toISOString()
        });
      }
    }
  };

  const createAlertsForIssues = async () => {
    for (const issue of visitData.issues_found) {
      await Alert.create({
        machine_id: currentMachine.id,
        alert_type: "maintenance_due",
        priority: "medium",
        title: `Issue Found During Route Visit`,
        description: issue,
        alert_datetime: new Date().toISOString(),
        status: "open"
      });
    }
  };

  const logAuditTrail = async () => {
    await AuditLog.create({
      entity_type: "Visit",
      entity_id: currentMachine.id,
      action: "create", 
      new_values: visitData,
      user_email: "operator@example.com", // Should be current user
      timestamp: new Date().toISOString()
    });
  };

  const completeCurrentMachine = async () => {
    await handleCashCollection();
    await updateMachineStock();
    await createAlertsForIssues();
    await logAuditTrail();
    
    // Create visit record
    await Visit.create({
      route_id: route.id,
      machine_id: currentMachine.id,
      operator: "operator@example.com", // Should be current user
      visit_datetime: new Date().toISOString(),
      visit_type: "scheduled_restock",
      status: "completed",
      items_restocked: visitData.items_restocked,
      cash_collected: visitData.cash_collected,
      issues_found: visitData.issues_found,
      notes: visitData.notes,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString()
    });
    
    setCompletedMachines(prev => new Set([...prev, currentMachine.id]));
    
    // Move to next machine or complete route
    if (currentMachineIndex < machines.length - 1) {
      setCurrentMachineIndex(prev => prev + 1);
      setVisitData({
        items_restocked: [],
        cash_collected: 0,
        issues_found: [],
        notes: ""
      });
    } else {
      // Route complete
      handleCompleteRoute();
    }
  };

  const handleCompleteRoute = async () => {
    setIsSubmitting(true);
    // Update route status and last completed date
    // This would trigger in the parent component
    onUpdate();
    onClose();
    setIsSubmitting(false);
  };

  if (!currentMachine) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Route Visit - Machine {currentMachine.machine_id}
            <Badge className="ml-2">
              {currentMachineIndex + 1} of {machines.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex gap-2">
            {machines.map((machine, index) => (
              <div
                key={machine.id}
                className={`flex-1 h-2 rounded-full ${
                  completedMachines.has(machine.id) 
                    ? "bg-green-500" 
                    : index === currentMachineIndex 
                      ? "bg-blue-500" 
                      : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Stock Replenishment */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Stock Replenishment
              </h3>
              <div className="space-y-3">
                {currentMachineStocks.map((stock) => {
                  const product = products.find(p => p.sku === stock.product_sku);
                  const restockedItem = visitData.items_restocked.find(
                    item => item.product_sku === stock.product_sku && 
                            item.slot_number === stock.slot_number
                  );
                  
                  return (
                    <div key={`${stock.product_sku}-${stock.slot_number}`} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{product?.name || stock.product_sku}</p>
                        <p className="text-sm text-slate-600">
                          Slot {stock.slot_number} • Current: {stock.current_stock} • Capacity: {stock.capacity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Add:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={stock.capacity - stock.current_stock}
                          placeholder="0"
                          value={restockedItem?.quantity_added || ""}
                          onChange={(e) => handleStockUpdate(
                            stock.product_sku, 
                            stock.slot_number, 
                            parseInt(e.target.value) || 0
                          )}
                          className="w-20"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cash Collection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cash Collection
              </h3>
              <div className="space-y-2">
                <Label htmlFor="cash">Amount Collected ($)</Label>
                <Input
                  id="cash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={visitData.cash_collected || ""}
                  onChange={(e) => setVisitData(prev => ({ 
                    ...prev, 
                    cash_collected: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Issues & Notes */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Issues & Notes
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Common Issues</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Coin mechanism jam",
                      "Bill validator issue", 
                      "Temperature too high",
                      "Low product variety",
                      "Vandalism/damage",
                      "Power issues"
                    ].map((issue) => (
                      <div key={issue} className="flex items-center gap-2">
                        <Checkbox
                          checked={visitData.issues_found.includes(issue)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setVisitData(prev => ({
                                ...prev,
                                issues_found: [...prev.issues_found, issue]
                              }));
                            } else {
                              setVisitData(prev => ({
                                ...prev,
                                issues_found: prev.issues_found.filter(i => i !== issue)
                              }));
                            }
                          }}
                        />
                        <Label className="text-sm">{issue}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional observations or notes..."
                    value={visitData.notes}
                    onChange={(e) => setVisitData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel Route</Button>
          <Button 
            onClick={completeCurrentMachine}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            {currentMachineIndex < machines.length - 1 ? "Complete & Next Machine" : "Complete Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}