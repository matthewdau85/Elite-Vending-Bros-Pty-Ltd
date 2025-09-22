import React, { useState, useEffect } from "react";
import { Sale, Machine, Location, Product } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Printer,
  Mail
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { safeArray, safeIncludes } from "../components/utils/safe";
import LoadingSpinner, { LoadingTable } from "../components/shared/LoadingSpinner";
import { usePagination } from "../components/shared/usePagination";

import SalesOverview from "../components/sales/SalesOverview";
import SalesCharts from "../components/sales/SalesCharts";
import TransactionTable from "../components/sales/TransactionTable";
import SendReportDialog from "../components/shared/SendReportDialog";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date())
  });
  const [machineFilter, setMachineFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSendDialog, setShowSendDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, machinesData, locationsData, productsData] = await Promise.all([
        Sale.list("-sale_datetime", 1000), // Get recent 1000 sales
        Machine.list(),
        Location.list(),
        Product.list()
      ]);

      setSales(safeArray(salesData));
      setMachines(safeArray(machinesData));
      setLocations(safeArray(locationsData));
      setProducts(safeArray(productsData));
    } catch (error) {
      console.error("Error loading sales data:", error);
      setSales([]);
      setMachines([]);
      setLocations([]);
      setProducts([]);
    }
    setIsLoading(false);
  };

  const filteredSales = safeArray(sales).filter(sale => {
    if (!sale) return false;

    const saleDate = new Date(sale.sale_datetime);
    const inDateRange = (!dateRange.from || saleDate >= dateRange.from) &&
                       (!dateRange.to || saleDate <= dateRange.to);

    const matchesMachine = machineFilter === "all" || sale.machine_id === machineFilter;
    const matchesProduct = productFilter === "all" || sale.product_sku === productFilter;
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;

    // Location filter requires finding machine's location
    let matchesLocation = true;
    if (locationFilter !== "all") {
      const machine = safeArray(machines).find(m => m?.id === sale.machine_id);
      matchesLocation = machine && machine.location_id === locationFilter;
    }

    return inDateRange && matchesMachine && matchesProduct && matchesStatus && matchesLocation;
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Sales Analytics</h1>
            <p className="text-slate-600 mt-1">Loading sales data...</p>
          </div>
          <LoadingTable columns={6} rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Analytics</h1>
            <p className="text-slate-600 mt-1">
              Analyze sales performance with detailed insights and visualizations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSendDialog(true)}>
              <Mail className="w-4 h-4 mr-2" />
              Send Report
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Machine</label>
                <Select value={machineFilter} onValueChange={setMachineFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Machines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Machines</SelectItem>
                    {machines.map(machine => (
                      <SelectItem key={machine.id} value={machine.id}>
                        Machine {machine.machine_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product</label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.sku}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <DollarSign className="w-4 h-4 mr-2" /> Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <SalesOverview
              sales={filteredSales}
              machines={machines}
              locations={locations}
              products={products}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <SalesCharts
              sales={filteredSales}
              machines={machines}
              locations={locations}
              products={products}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionTable
              sales={filteredSales}
              machines={machines}
              locations={locations}
              products={products}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
      <SendReportDialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        reportType="sales"
        reportName="Sales Report"
      />
    </div>
  );
}