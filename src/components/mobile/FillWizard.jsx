
import React, { useState, useEffect, useCallback } from 'react';
import { Product, MachineStock } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Scan, Plus, Minus, Check, X,
  Camera, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function FillWizard({ visit, machine, onClose, onSave }) {
  const [products, setProducts] = useState([]);
  const [machineStock, setMachineStock] = useState([]);
  const [fillData, setFillData] = useState({});
  const [scanMode, setScanMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProductData = useCallback(async () => {
    if (!machine?.id) return; // Guard clause for when machine.id is not available
    try {
      const [allProducts, stockData] = await Promise.all([
        Product.list(),
        MachineStock.filter({ machine_id: machine.id })
      ]);
      
      setProducts(allProducts);
      setMachineStock(stockData);
      
      // Initialize fill data from visit plan
      const initialFill = {};
      visit.items_to_fill?.forEach(item => {
        initialFill[item.product_sku] = {
          planned: item.quantity_needed,
          actual: 0
        };
      });
      setFillData(initialFill);
    } catch (error) {
      console.error('Error loading product data:', error);
      toast.error('Failed to load product information');
    } finally {
      setLoading(false);
    }
  }, [machine?.id, visit?.items_to_fill]); // Dependencies for useCallback

  useEffect(() => {
    loadProductData();
  }, [loadProductData]); // useEffect now depends on the memoized loadProductData

  const updateFillQuantity = (sku, change) => {
    setFillData(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        actual: Math.max(0, (prev[sku]?.actual || 0) + change)
      }
    }));
  };

  const setFillQuantity = (sku, value) => {
    const quantity = parseInt(value) || 0;
    setFillData(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        actual: Math.max(0, quantity)
      }
    }));
  };

  const startBarcodeScanner = () => {
    setScanMode(true);
    
    // In a real implementation, this would integrate with a barcode scanner
    // For now, we'll simulate it
    toast.info('Barcode scanner activated');
    
    // Mock scan result after 2 seconds
    setTimeout(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      if (randomProduct && fillData[randomProduct.sku]) {
        updateFillQuantity(randomProduct.sku, 1);
        toast.success(`Scanned: ${randomProduct.name}`);
      }
      setScanMode(false);
    }, 2000);
  };

  const handleSave = () => {
    const itemsActuallyFilled = Object.entries(fillData)
      .filter(([_, data]) => data.actual > 0)
      .map(([sku, data]) => ({
        product_sku: sku,
        quantity_added: data.actual
      }));

    onSave({
      items_actually_filled: itemsActuallyFilled,
      fill_completed_at: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            Loading product data...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Fill Machine
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto">
          {/* Scan Controls */}
          <div className="mb-4">
            <Button
              onClick={startBarcodeScanner}
              disabled={scanMode}
              className="w-full"
              variant="outline"
            >
              <Scan className="w-4 h-4 mr-2" />
              {scanMode ? 'Scanning...' : 'Scan Barcode'}
            </Button>
          </div>

          {/* Product List */}
          <div className="space-y-3">
            {Object.entries(fillData).map(([sku, data]) => {
              const product = products.find(p => p.sku === sku);
              const stock = machineStock.find(s => s.product_sku === sku);
              
              if (!product) return null;
              
              return (
                <Card key={sku} className="border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-slate-600">
                          Slot {stock?.slot_number || '?'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        Plan: {data.planned}
                      </Badge>
                    </div>
                    
                    {/* Current Stock Info */}
                    <div className="text-xs text-slate-500 mb-2">
                      Current: {stock?.current_stock || 0}/{stock?.capacity || '?'}
                      {stock?.current_stock <= (stock?.par_level || 0) && (
                        <AlertTriangle className="inline w-3 h-3 ml-1 text-orange-500" />
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFillQuantity(sku, -1)}
                          disabled={data.actual <= 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={data.actual}
                          onChange={(e) => setFillQuantity(sku, e.target.value)}
                          className="w-16 text-center"
                          min="0"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFillQuantity(sku, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {data.actual !== data.planned && (
                        <Badge variant={data.actual > data.planned ? "default" : "secondary"}>
                          {data.actual > data.planned ? '+' : ''}{data.actual - data.planned}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Save Fill
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
