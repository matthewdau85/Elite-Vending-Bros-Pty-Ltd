import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Plus, Minus, Scan, Check, X 
} from 'lucide-react';
import { toast } from 'sonner';

export default function PartTracker({ ticket, onClose, onUpdate }) {
  const [partsUsed, setPartsUsed] = useState([]);
  const [newPart, setNewPart] = useState({
    name: '',
    part_number: '',
    quantity: 1,
    cost_cents: 0
  });

  const commonParts = [
    { name: 'Coin Mechanism', part_number: 'CM-001', cost_cents: 12500 },
    { name: 'Bill Validator', part_number: 'BV-002', cost_cents: 25000 },
    { name: 'Vend Motor', part_number: 'VM-003', cost_cents: 8500 },
    { name: 'Compressor', part_number: 'CP-004', cost_cents: 35000 },
    { name: 'Temperature Sensor', part_number: 'TS-005', cost_cents: 3500 }
  ];

  const addCommonPart = (part) => {
    setPartsUsed(prev => [...prev, { ...part, quantity: 1, id: Date.now() }]);
    toast.success(`Added ${part.name}`);
  };

  const addCustomPart = () => {
    if (!newPart.name.trim()) {
      toast.error('Part name is required');
      return;
    }

    const part = {
      ...newPart,
      id: Date.now(),
      cost_cents: Math.round(newPart.cost_cents * 100)
    };

    setPartsUsed(prev => [...prev, part]);
    setNewPart({ name: '', part_number: '', quantity: 1, cost_cents: 0 });
    toast.success('Part added');
  };

  const updatePartQuantity = (id, change) => {
    setPartsUsed(prev => prev.map(part => 
      part.id === id 
        ? { ...part, quantity: Math.max(0, part.quantity + change) }
        : part
    ).filter(part => part.quantity > 0));
  };

  const removePart = (id) => {
    setPartsUsed(prev => prev.filter(part => part.id !== id));
  };

  const getTotalCost = () => {
    return partsUsed.reduce((total, part) => 
      total + (part.cost_cents * part.quantity), 0
    );
  };

  const scanBarcode = () => {
    // Simulate barcode scanning
    toast.info('Barcode scanner activated');
    
    // Mock scan result
    setTimeout(() => {
      const randomPart = commonParts[Math.floor(Math.random() * commonParts.length)];
      setNewPart(prev => ({
        ...prev,
        name: randomPart.name,
        part_number: randomPart.part_number,
        cost_cents: randomPart.cost_cents / 100
      }));
      toast.success(`Scanned: ${randomPart.part_number}`);
    }, 1500);
  };

  const handleSave = () => {
    const partData = {
      parts_used: partsUsed.map(part => ({
        part_name: part.name,
        part_number: part.part_number,
        quantity: part.quantity,
        cost_cents: part.cost_cents
      })),
      total_parts_cost_cents: getTotalCost(),
      parts_updated_at: new Date().toISOString()
    };

    onUpdate(ticket.id, partData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Parts Tracker
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto">
          {/* Common Parts */}
          <div>
            <Label>Common Parts</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {commonParts.map(part => (
                <Button
                  key={part.part_number}
                  variant="outline"
                  size="sm"
                  onClick={() => addCommonPart(part)}
                  className="justify-start text-xs p-2 h-auto"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <div className="text-left">
                    <div className="font-medium">{part.name}</div>
                    <div className="text-slate-500">
                      ${(part.cost_cents / 100).toFixed(2)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Add Custom Part */}
          <div className="border-t pt-4">
            <Label>Add Custom Part</Label>
            <div className="space-y-2 mt-2">
              <Input
                placeholder="Part name"
                value={newPart.name}
                onChange={(e) => setNewPart(prev => ({ 
                  ...prev, name: e.target.value 
                }))}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Part #"
                  value={newPart.part_number}
                  onChange={(e) => setNewPart(prev => ({ 
                    ...prev, part_number: e.target.value 
                  }))}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={scanBarcode}
                >
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={newPart.quantity}
                  onChange={(e) => setNewPart(prev => ({ 
                    ...prev, quantity: parseInt(e.target.value) || 1 
                  }))}
                  className="w-20"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Cost $"
                  value={newPart.cost_cents}
                  onChange={(e) => setNewPart(prev => ({ 
                    ...prev, cost_cents: parseFloat(e.target.value) || 0 
                  }))}
                  className="flex-1"
                />
                <Button onClick={addCustomPart} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Parts Used */}
          {partsUsed.length > 0 && (
            <div className="border-t pt-4">
              <Label>Parts Used</Label>
              <div className="space-y-2 mt-2">
                {partsUsed.map(part => (
                  <Card key={part.id} className="border">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{part.name}</p>
                          <p className="text-sm text-slate-600">{part.part_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePartQuantity(part.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{part.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePartQuantity(part.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePart(part.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        ${(part.cost_cents / 100).toFixed(2)} each • 
                        Total: ${((part.cost_cents * part.quantity) / 100).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Total */}
              <Card className="bg-slate-50 mt-3">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Parts Cost:</span>
                    <span className="font-bold">
                      ${(getTotalCost() / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Save Parts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}