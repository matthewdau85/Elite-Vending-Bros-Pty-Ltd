
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner"; // Added toast import

const categories = [
  { value: "snacks", label: "Snacks" },
  { value: "beverages", label: "Beverages" },
  { value: "healthy", label: "Healthy Options" },
  { value: "coffee", label: "Coffee" },
  { value: "fresh_food", label: "Fresh Food" },
  { value: "other", label: "Other" }
];

const storageTypes = [
  { value: "ambient", label: "Ambient Temperature" },
  { value: "chilled", label: "Chilled" },
  { value: "frozen", label: "Frozen" }
];

const initialFormData = {
  sku: "",
  name: "",
  brand: "",
  category: "snacks",
  description: "",
  base_cost: "",
  base_price: "",
  gst_rate: "0.1",
  barcode: "",
  supplier_id: "",
  shelf_life_days: "",
  storage_temp: "ambient",
  image_url: ""
};

export default function AddProductDialog({ open, onClose, onProductAdded, suppliers, product }) { // Changed onSubmit to onProductAdded
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false); // Changed isSubmitting to isLoading

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        brand: product.brand || "",
        category: product.category || "snacks",
        description: product.description || "",
        base_cost: product.base_cost?.toString() || "",
        base_price: product.base_price?.toString() || "",
        gst_rate: product.gst_rate?.toString() || "0.1",
        barcode: product.barcode || "",
        supplier_id: product.supplier_id || "",
        shelf_life_days: product.shelf_life_days?.toString() || "",
        storage_temp: product.storage_temp || "ambient",
        image_url: product.image_url || ""
      });
    } else {
      setFormData(initialFormData);
    }
  }, [product, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Changed setIsSubmitting to setIsLoading
    
    try {
      const submissionData = {
        ...formData,
        base_cost: formData.base_cost ? parseFloat(formData.base_cost) : 0,
        base_price: formData.base_price ? parseFloat(formData.base_price) : 0,
        gst_rate: parseFloat(formData.gst_rate),
        shelf_life_days: formData.shelf_life_days ? parseInt(formData.shelf_life_days) : null,
        status: product?.status || "active"
      };
      
      await onProductAdded(submissionData); // Changed onSubmit to onProductAdded
      toast.success(`Product ${product ? 'updated' : 'added'} successfully!`); // Added success toast
      onClose(); // Let parent handle closing and state reset
    } catch (error) {
      console.error("Error submitting product form:", error);
      toast.error(`Failed to ${product ? 'update' : 'add'} product: ${error.message || 'An unknown error occurred'}`); // Added error toast
    }
    
    setIsLoading(false); // Changed setIsSubmitting to setIsLoading
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isEditMode = !!product;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"> {/* Preserved existing className */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"> {/* Preserved existing title logic */}
            {isEditMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {isEditMode ? `Edit Product: ${product.name}` : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="e.g., SNK001"
                required
                disabled={isEditMode} // Prevent SKU change on edit
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Tim Tams Original"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="e.g., Arnott's"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_cost">Cost (ex GST) *</Label>
              <Input
                id="base_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.base_cost}
                onChange={(e) => handleChange("base_cost", e.target.value)}
                placeholder="1.50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="base_price">Price (ex GST) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.base_price}
                onChange={(e) => handleChange("base_price", e.target.value)}
                placeholder="3.50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gst_rate">GST Rate</Label>
              <Input
                id="gst_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.gst_rate}
                onChange={(e) => handleChange("gst_rate", e.target.value)}
                placeholder="0.10"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleChange("barcode", e.target.value)}
                placeholder="9310072001234"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier</Label>
              <Select value={formData.supplier_id} onValueChange={(value) => handleChange("supplier_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shelf_life_days">Shelf Life (Days)</Label>
              <Input
                id="shelf_life_days"
                type="number"
                min="1"
                value={formData.shelf_life_days}
                onChange={(e) => handleChange("shelf_life_days", e.target.value)}
                placeholder="365"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storage_temp">Storage Temperature</Label>
              <Select value={formData.storage_temp} onValueChange={(value) => handleChange("storage_temp", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {storageTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.sku || !formData.name || !formData.base_cost || !formData.base_price} // Changed isSubmitting to isLoading
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Product")} {/* Changed text for isLoading */}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
