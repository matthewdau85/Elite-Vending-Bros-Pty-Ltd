import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Product } from "@/api/entities";
import { 
  Package, 
  Edit3, 
  Trash2, 
  DollarSign,
  Tag
} from "lucide-react";

export default function BulkOperations({ selectedProducts, onUpdate, onClearSelection }) {
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkOperation, setBulkOperation] = useState("");
  const [bulkValue, setBulkValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkOperation = async () => {
    setIsSubmitting(true);
    
    try {
      for (const productId of selectedProducts) {
        let updateData = {};
        
        switch (bulkOperation) {
          case "update_status":
            updateData.status = bulkValue;
            break;
          case "update_category":
            updateData.category = bulkValue;
            break;
          case "price_increase":
            const product = await Product.filter({ id: productId });
            if (product[0]) {
              const increasePercent = parseFloat(bulkValue) / 100;
              updateData.base_price = product[0].base_price * (1 + increasePercent);
            }
            break;
          case "price_decrease":
            const productDec = await Product.filter({ id: productId });
            if (productDec[0]) {
              const decreasePercent = parseFloat(bulkValue) / 100;
              updateData.base_price = productDec[0].base_price * (1 - decreasePercent);
            }
            break;
        }
        
        if (Object.keys(updateData).length > 0) {
          await Product.update(productId, updateData);
        }
      }
      
      onUpdate();
      onClearSelection();
      setShowBulkDialog(false);
    } catch (error) {
      console.error("Bulk operation failed:", error);
    }
    
    setIsSubmitting(false);
  };

  if (selectedProducts.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 bg-white border shadow-lg rounded-lg p-4 z-50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedProducts.length} products selected
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setBulkOperation("update_status");
                setShowBulkDialog(true);
              }}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Bulk Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setBulkOperation("price_increase");
                setShowBulkDialog(true);
              }}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Adjust Prices
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onClearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Operation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Operation Type</Label>
              <Select value={bulkOperation} onValueChange={setBulkOperation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update_status">Update Status</SelectItem>
                  <SelectItem value="update_category">Update Category</SelectItem>
                  <SelectItem value="price_increase">Increase Prices (%)</SelectItem>
                  <SelectItem value="price_decrease">Decrease Prices (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {bulkOperation === "update_status" && (
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={bulkValue} onValueChange={setBulkValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {bulkOperation === "update_category" && (
              <div className="space-y-2">
                <Label>New Category</Label>
                <Select value={bulkValue} onValueChange={setBulkValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="fresh_food">Fresh Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(bulkOperation === "price_increase" || bulkOperation === "price_decrease") && (
              <div className="space-y-2">
                <Label>Percentage Change</Label>
                <Input
                  type="number"
                  placeholder="Enter percentage (e.g., 10 for 10%)"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkOperation}
              disabled={!bulkOperation || !bulkValue || isSubmitting}
            >
              {isSubmitting ? "Processing..." : `Apply to ${selectedProducts.length} Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}