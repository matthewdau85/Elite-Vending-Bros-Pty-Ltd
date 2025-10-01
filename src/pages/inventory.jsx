
import React, { useState, useEffect } from "react";
import { Product, MachineStock, Machine, Location, Supplier, ForecastData } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  List,
  ClipboardList,
  PackagePlus,
  Download
} from "lucide-react";
import { useLocation } from "react-router-dom";

import ProductCatalog from "@/components/inventory/ProductCatalog";
import StockOverview from "@/components/inventory/StockOverview";
import ReorderPlanner from "@/components/inventory/ReorderPlanner";
import AddProductDialog from "@/components/inventory/AddProductDialog";
import PricingDialog from "@/components/inventory/PricingDialog";
import BatchManager from '@/components/inventory/BatchManager';
import PickingListDialog from '@/components/inventory/PickingListDialog';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { safeArray, safeIncludes } from '@/components/utils/safe';
import { withTenantFilters, TenantAccessError } from '@/lib/tenantContext';
import { createTenantEntityExport } from '@/lib/tenantExports';
import { toast } from 'sonner';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [machineStocks, setMachineStocks] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("catalog");

  const [isPickingListOpen, setIsPickingListOpen] = useState(false);
  const [reorderItems, setReorderItems] = useState([]);

  // New states for ConfirmationDialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [exportingFormat, setExportingFormat] = useState(null);

  const location = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [productsData, stocksData, machinesData, locationsData, suppliersData, forecastsData] = await Promise.all([
        Product.list("-updated_date", { filter: withTenantFilters() }),
        MachineStock.list({ filter: withTenantFilters() }),
        Machine.list({ filter: withTenantFilters() }),
        Location.list({ filter: withTenantFilters() }),
        Supplier.list({ filter: withTenantFilters() }),
        ForecastData.list({ filter: withTenantFilters() })
      ]);

      setProducts(safeArray(productsData));
      setMachineStocks(safeArray(stocksData));
      setMachines(safeArray(machinesData));
      setLocations(safeArray(locationsData));
      setSuppliers(safeArray(suppliersData));
      setForecasts(safeArray(forecastsData));
    } catch (error) {
      console.error("Error loading inventory data:", error);
      if (error instanceof TenantAccessError) {
        setLoadError('You are not authorized to view inventory data for this tenant.');
      } else {
        setLoadError('Error loading inventory data. Please try again.');
      }
      setProducts([]);
      setMachineStocks([]);
      setMachines([]);
      setLocations([]);
      setSuppliers([]);
      setForecasts([]);
    }
    setIsLoading(false);
  };

  const handleInventoryExport = async (format) => {
    try {
      setExportingFormat(format);
      const exportResult = await createTenantEntityExport({
        entityName: 'Product',
        format,
        filters: {},
        exportName: `inventory_products_${format}`,
      });

      if (exportResult?.downloadUrl) {
        window.open(exportResult.downloadUrl, '_blank', 'noopener');
      }

      toast.success(`Inventory export ready in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error('Inventory export failed:', error);
      if (error instanceof TenantAccessError) {
        toast.error('You are not authorized to export data for this tenant.');
      } else {
        toast.error(error.message || 'Failed to export inventory data.');
      }
    } finally {
      setExportingFormat(null);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleManagePricing = (product) => {
    setEditingProduct(product);
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

  // New function to handle confirmation and deletion of selected products
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Assuming Product.delete can handle individual product IDs.
      // If a bulk delete API endpoint exists, it should be used here.
      await Promise.all(selectedProducts.map(productId => Product.delete(productId)));
      await loadData(); // Reload all data after deletion
      setSelectedProducts([]); // Clear selection after successful deletion
      setConfirmDeleteOpen(false); // Close the dialog
    } catch (error) {
      console.error("Failed to delete selected products:", error);
      alert("There was an error deleting the selected products.");
    } finally {
      setIsDeleting(false);
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

  const getLowStockItems = () => {
    return machineStocks.filter(stock =>
      (stock.current_stock || 0) <= (stock.par_level || 0)
    );
  };

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

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600 mt-1">Oversee your product catalog, stock levels, and reordering.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setIsAddDialogOpen(true);
                setEditingProduct(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleInventoryExport('jsonl')}
              disabled={isLoading || exportingFormat === 'jsonl'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSONL
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleInventoryExport('parquet')}
              disabled={isLoading || exportingFormat === 'parquet'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Parquet
            </Button>
            {/* Button to trigger bulk delete for selected products */}
            {selectedProducts.length > 0 && activeTab === "catalog" && (
                <Button
                    variant="destructive"
                    onClick={() => setConfirmDeleteOpen(true)}
                >
                    Delete Selected ({selectedProducts.length})
                </Button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="catalog">
                <Package className="w-4 h-4 mr-2" /> Product Catalog
              </TabsTrigger>
              <TabsTrigger value="stock">
                <List className="w-4 h-4 mr-2" /> Stock Overview
              </TabsTrigger>
              <TabsTrigger value="reorder">
                <ClipboardList className="w-4 h-4 mr-2" /> Reorder Planning
              </TabsTrigger>
              <TabsTrigger value="batches">
                <PackagePlus className="w-4 h-4 mr-2" /> Batch Tracking
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
                forecasts={forecasts}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="batches" className="mt-6">
              <BatchManager
                products={products}
                machineStocks={machineStocks}
                onUpdate={loadData}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
      <AddProductDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
        }}
        onProductAdded={loadData}
        suppliers={suppliers}
      />

      <PickingListDialog
        open={isPickingListOpen}
        onClose={() => setIsPickingListOpen(false)}
        items={reorderItems}
      />

      {editingProduct && (
        <PricingDialog
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onPriceUpdated={loadData}
        />
      )}
      
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => {
            setConfirmDeleteOpen(false);
            setIsDeleting(false); // Reset loading state if dialog is closed without confirming
        }}
        onConfirm={confirmDelete}
        title="Delete Product(s)"
        description={`Are you sure you want to delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
