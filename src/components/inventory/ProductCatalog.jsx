
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Package,
  DollarSign,
  AlertTriangle,
  Edit,
  MoreVertical,
  Trash2,
  Truck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { safeArray, safeIncludes } from "../shared/SearchUtils";

const categoryColors = {
  snacks: "bg-orange-100 text-orange-800 border-orange-200",
  beverages: "bg-blue-100 text-blue-800 border-blue-200",
  healthy: "bg-green-100 text-green-800 border-green-200",
  coffee: "bg-amber-100 text-amber-800 border-amber-200",
  fresh_food: "bg-purple-100 text-purple-800 border-purple-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  discontinued: "bg-red-100 text-red-800 border-red-200",
  seasonal: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function ProductCatalog({
  products,
  stockSummary,
  suppliers,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  onEdit,
  onDelete,
  onManagePricing,
  onUpdate,
  isLoading
}) {
  // state related to image dialog seems unused, but kept as per original code
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const categories = ["all", "snacks", "beverages", "healthy", "coffee", "fresh_food", "other"];
  const statuses = ["all", "active", "discontinued", "seasonal"];

  const filteredProducts = safeArray(products).filter(product => {
    if (!product) return false;

    const matchesSearch =
      safeIncludes(product.name, searchTerm) ||
      safeIncludes(product.sku, searchTerm) ||
      safeIncludes(product.brand, searchTerm);

    const matchesCategory = categoryFilter === "all" || (product.category || "") === categoryFilter;
    const matchesStatus = statusFilter === "all" || (product.status || "") === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* New Select for Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-md">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-12 border-0 shadow-md">
          <CardContent>
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {products.length === 0 ? "No Products Added" : "No Products Found"}
            </h3>
            <p className="text-slate-500 mb-6">
              {products.length === 0
                ? "Add your first product to start building your catalog"
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => {
            const stock = stockSummary[product.sku] || { total_stock: 0, machines_count: 0, low_stock_machines: 0 };
            const supplier = suppliers.find(s => s.id === product.supplier_id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold text-slate-900 truncate">
                          {product.name}
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          {product.brand} • {product.sku}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onManagePricing(product)}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Manage Pricing
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(product.id, product.name)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-2">
                      <Badge className={categoryColors[product.category] || categoryColors.other}>
                        {product.category?.replace("_", " ")}
                      </Badge>
                      <Badge className={statusColors[product.status] || statusColors.active}>
                        {product.status}
                      </Badge>
                      {stock.low_stock_machines > 0 && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Supplier Info */}
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <Truck className="w-4 h-4" />
                        <span>{supplier ? supplier.name : "No supplier assigned"}</span>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Cost</p>
                          <p className="text-sm font-medium text-slate-900">
                            ${product.base_cost?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Price</p>
                          <p className="text-sm font-medium text-slate-900">
                            ${product.base_price?.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">Total Stock</p>
                            <p className="text-sm font-medium text-slate-900">
                              {stock.total_stock} units
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">In Machines</p>
                            <p className="text-sm font-medium text-slate-900">
                              {stock.machines_count}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
