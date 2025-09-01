import React, { useState } from "react";
import { UnmappedProduct, Product } from "@/api/entities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Puzzle, PackagePlus, Link2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

function MapProductDialog({ open, onClose, unmappedProduct, products, onUpdate }) {
  const [mapTo, setMapTo] = useState("");
  
  const handleMap = async () => {
    if (!mapTo) return;
    
    const productToUpdate = products.find(p => p.id === mapTo);
    if (productToUpdate) {
      await Product.update(productToUpdate.id, { 
        nayax_product_id: unmappedProduct.nayax_product_id 
      });
      await UnmappedProduct.update(unmappedProduct.id, { status: "mapped" });
      onUpdate();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Map Nayax Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            Map Nayax Product ID <strong>{unmappedProduct?.nayax_product_id}</strong> ({unmappedProduct?.nayax_product_name}) to an existing product in your catalog.
          </p>
          <div className="space-y-2">
            <Label>Select Product to Link</Label>
            <Select onValueChange={setMapTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleMap} disabled={!mapTo}>
            <Link2 className="w-4 h-4 mr-2" /> Map Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UnmappedProductsTable({ unmappedProducts, products, onUpdate, isLoading }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const handleIgnore = async (id) => {
    await UnmappedProduct.update(id, { status: "ignored" });
    onUpdate();
  };
  
  const handleCreateNew = (unmapped) => {
    // In a real app, this would open a dialog pre-filled with Nayax data
    alert(`Functionality to create new product from '${unmapped.nayax_product_name}' would be implemented here.`);
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (unmappedProducts.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-slate-50">
        <Puzzle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-medium text-slate-900">All Products Mapped</h3>
        <p className="mt-2 text-sm text-slate-600">
          No unrecognized products from Nayax to review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nayax Product ID</TableHead>
              <TableHead>Nayax Product Name</TableHead>
              <TableHead>First Seen on Machine</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unmappedProducts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono">{p.nayax_product_id}</TableCell>
                <TableCell>{p.nayax_product_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{p.nayax_machine_id}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleCreateNew(p)}>
                    <PackagePlus className="w-4 h-4 mr-1" /> Create
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProduct(p)}>
                    <Link2 className="w-4 h-4 mr-1" /> Link
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleIgnore(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedProduct && (
        <MapProductDialog
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          unmappedProduct={selectedProduct}
          products={products}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}