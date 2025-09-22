
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  DollarSign,
  Clock,
  Coffee,
  MapPin,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { safeArray, safeIncludes, safeString } from "../shared/SearchUtils";

const statusColors = {
  completed: "bg-green-100 text-green-800",
  refunded: "bg-red-100 text-red-800",
  failed: "bg-orange-100 text-orange-800"
};

const paymentColors = {
  card: "bg-blue-100 text-blue-800",
  cash: "bg-green-100 text-green-800",
  mobile: "bg-purple-100 text-purple-800",
  contactless: "bg-indigo-100 text-indigo-800"
};

export default function TransactionTable({ sales, machines, locations, products, isLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Pagination for performance

  // Helper function to get machine information for display in the table
  const getMachineInfo = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return { machine_id: machineId, location_name: "Unknown" };

    const location = locations.find(l => l.id === machine.location_id);
    return {
      machine_id: machine.machine_id,
      location_name: location ? location.name : "Unknown Location"
    };
  };

  // Helper function to get product name for display in the table
  const getProductName = (sku) => {
    const product = products.find(p => p.sku === sku);
    return product ? product.name : sku;
  };

  // New helper function as suggested by the outline, to get full objects for filtering
  const getProductAndLocation = (sale) => {
    const machine = machines.find(m => m.id === sale.machine_id);
    const location = locations.find(l => l.id === machine?.location_id);
    const product = products.find(p => p.sku === sale.product_sku);
    return { product, location, machine };
  };

  const filteredSales = safeArray(sales).filter(sale => {
    if (!sale) return false;

    // Use the new helper to get related objects for robust filtering
    const { product, location, machine } = getProductAndLocation(sale);

    // Apply filtering logic using the new 'safeIncludes' function.
    // Preserves original 'OR' search logic across multiple fields for the single search input.
    return (
      safeIncludes(sale.transaction_id, searchTerm) ||
      safeIncludes(machine?.machine_id, searchTerm) ||
      safeIncludes(location?.name, searchTerm) ||
      safeIncludes(product?.name, searchTerm) ||
      safeIncludes(sale.product_sku, searchTerm) // Keep product_sku search from original functionality
    );
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex); // Renamed currentSales to paginatedSales

  return (
    <div className="space-y-6">
      {/* Search Input Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search transactions by ID, machine, location, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Transaction Log ({filteredSales.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            // Skeleton Loader while loading
            <div className="p-6 space-y-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : paginatedSales.length === 0 ? (
            // No transactions or no results found
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">
                {sales.length === 0 ? "No Transactions" : "No Transactions Found"}
              </h3>
              <p className="text-slate-500 text-sm">
                {sales.length === 0
                  ? "Transaction data will appear here as sales occur"
                  : "Try adjusting your search criteria"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-center">Amount</TableHead>
                      <TableHead className="text-center">Payment</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale) => {
                      // Re-using existing display helpers for table cell rendering
                      const machineInfo = getMachineInfo(sale.machine_id);
                      const productName = getProductName(sale.product_sku);

                      return (
                        <TableRow key={sale.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-sm">
                            {sale.transaction_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-sm">
                                  {format(new Date(sale.sale_datetime), "MMM d, yyyy")}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {format(new Date(sale.sale_datetime), "h:mm a")}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-sm">{productName}</p>
                                <p className="text-xs text-slate-500">{sale.product_sku}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{machineInfo.machine_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-sm">{machineInfo.location_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {sale.quantity || 1}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            ${(sale.total_amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={paymentColors[safeString(sale.payment_method)] || "bg-gray-100 text-gray-800"}>
                              {safeString(sale.payment_method)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusColors[safeString(sale.status)] || "bg-gray-100 text-gray-800"}>
                              {safeString(sale.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t bg-slate-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} of {filteredSales.length} transactions
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-2 text-sm font-medium">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
