
import React, { useState, useEffect } from "react";
import { Product, MachineStock, Machine, Location, Supplier } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  TrendingDown,
  ShoppingCart,
  Truck,
  Printer 
} from "lucide-react";

import ProductCatalog from "../components/inventory/ProductCatalog";
import StockOverview from "../components/inventory/StockOverview";
import ReorderPlanner from "../components/inventory/ReorderPlanner";
import AddProductDialog from "../components/inventory/AddProductDialog";
import PricingDialog from "../components/inventory/PricingDialog";
import BulkOperations from "../components/inventory/BulkOperations";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [machineStocks, setMachineStocks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pricingProduct, setPricingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, stocksData, machinesData, locationsData, suppliersData] = await Promise.all([
        Product.list("-updated_date"),
        MachineStock.list(),
        Machine.list(),
        Location.list(),
        Supplier.list()
      ]);
      
      setProducts(productsData);
      setMachineStocks(stocksData);
      setMachines(machinesData);
      setLocations(locationsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error loading inventory data:", error);
    }
    setIsLoading(false);
  };

  const handleFormSubmit = async (productData) => {
    if (editingProduct) {
      await Product.update(editingProduct.id, productData);
    } else {
      await Product.create(productData);
    }
    setShowAddDialog(false);
    setEditingProduct(null);
    loadData();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddDialog(true);
  };

  const handleManagePricing = (product) => {
    setPricingProduct(product);
  };
  
  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        await Product.delete(productId);
        loadData();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("There was an error deleting the product.");
      }
    }
  };

  const handleProductSelection = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // Get low stock items
  const getLowStockItems = () => {
    return machineStocks.filter(stock => 
      (stock.current_stock || 0) <= (stock.par_level || 0)
    );
  };

  // Get stock summary by product
  const getStockSummary = () => {
    const summary = {};
    machineStocks.forEach(stock => {
      if (!summary[stock.product_sku]) {
        summary[stock.product_sku] = {
          total_stock: 0,
          machines_count: 0,
          low_stock_machines: 0
        };
      }
      summary[stock.product_sku].total_stock += stock.current_stock || 0;
      summary[stock.product_sku].machines_count += 1;
      if (stock.current_stock <= (stock.par_level || 0)) {
        summary[stock.product_sku].low_stock_machines += 1;
      }
    });
    return summary;
  };

  const stockSummary = getStockSummary();
  const lowStockItems = getLowStockItems();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600 mt-1">
              Manage products, monitor stock levels, and plan restocking operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => {
                setEditingProduct(null);
                setShowAddDialog(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-medium text-slate-600">Total Products</p>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-red-50">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-medium text-slate-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-green-50">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-medium text-slate-600">Active SKUs</p>
              <p className="text-2xl font-bold text-slate-900">
                {products.filter(p => p.status === "active").length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-purple-50">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-medium text-slate-600">Suppliers</p>
              <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3">
            <TabsTrigger value="catalog">
              <Package className="w-4 h-4 mr-2" /> Product Catalog
            </TabsTrigger>
            <TabsTrigger value="stock">
              <TrendingDown className="w-4 h-4 mr-2" /> Stock Overview
            </TabsTrigger>
            <TabsTrigger value="reorder">
              <ShoppingCart className="w-4 h-4 mr-2" /> Reorder Planning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-6">
            <ProductCatalog
              products={products}
              stockSummary={stockSummary}
              suppliers={suppliers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onEdit={handleEdit}
              onManagePricing={handleManagePricing}
              onDelete={handleDelete}
              isLoading={isLoading}
              selectedProducts={selectedProducts}
              onProductSelection={handleProductSelection}
            />
          </TabsContent>

          <TabsContent value="stock" className="mt-6">
            <StockOverview
              machineStocks={machineStocks}
              products={products}
              machines={machines}
              locations={locations}
              onUpdate={loadData}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="reorder" className="mt-6">
            <ReorderPlanner
              products={products}
              machineStocks={machineStocks}
              machines={machines}
              locations={locations}
              suppliers={suppliers}
              lowStockItems={lowStockItems}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <AddProductDialog
          open={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            setEditingProduct(null);
          }}
          onSubmit={handleFormSubmit}
          suppliers={suppliers}
          product={editingProduct}
        />

        {/* Pricing Management Dialog */}
        <PricingDialog
          open={!!pricingProduct}
          onClose={() => setPricingProduct(null)}
          product={pricingProduct}
          onUpdate={loadData}
        />

        {/* Bulk Operations */}
        <BulkOperations
          selectedProducts={selectedProducts}
          onUpdate={loadData}
          onClearSelection={clearSelection}
        />
      </div>
    </div>
  );
}
