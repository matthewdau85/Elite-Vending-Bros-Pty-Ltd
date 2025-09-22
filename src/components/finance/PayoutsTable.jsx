
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Landmark, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { safeArray, safeIncludes } from "../shared/SearchUtils"; // Updated path as per outline

const statusConfig = {
  paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Clock },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function PayoutsTable({ 
  payouts, 
  isLoading, 
  searchTerm = "", 
  setSearchTerm, 
  statusFilter = "all", 
  setStatusFilter 
}) {
  // Add pagination to handle large datasets
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // First, apply search and status filters to the full list of payouts
  const allFilteredPayouts = safeArray(payouts).filter(payout => {
    const matchesSearch = !searchTerm ||
      safeIncludes(payout?.payout_id, searchTerm) ||
      safeIncludes(payout?.bank_reference, searchTerm) ||
      safeIncludes(payout?.notes, searchTerm);
      
    const matchesStatus = statusFilter === "all" || payout?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate total pages for the filtered set
  const totalPages = Math.ceil(allFilteredPayouts.length / itemsPerPage);

  // Then, apply pagination slicing to get the payouts for the current page
  const paginatedPayouts = allFilteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-green-600" />
          Payout History
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search payouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm?.(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Payout Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
                <TableHead className="text-right">Fees</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : allFilteredPayouts.length === 0 ? ( // Check allFilteredPayouts length for "no results" message
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">No Payouts Found</h3>
                      <p className="text-slate-500 text-sm">Payout data from your payment processor will appear here.</p>
                    </TableCell>
                  </TableRow>
              ) : (
                paginatedPayouts.map((payout) => { // Render paginated payouts
                  const config = statusConfig[payout?.status] || statusConfig.pending;
                  return (
                    <TableRow key={payout?.id} className="hover:bg-slate-50">
                      <TableCell>{payout?.payout_date ? format(new Date(payout.payout_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell>
                        {payout?.period_start && payout?.period_end
                          ? `${format(new Date(payout.period_start), 'MMM d')} - ${format(new Date(payout.period_end), 'MMM d, yyyy')}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell className="text-right font-semibold">${(payout?.net_amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-red-600">
                        (${((payout?.processing_fees || 0) + (payout?.service_fees || 0)).toFixed(2)})
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${config.color} gap-1.5`}>
                          <config.icon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{payout?.bank_reference || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination controls can be added here if needed, using currentPage and totalPages */}
        {/* For example:
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4">
            <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        )}
        */}
      </CardContent>
    </Card>
  );
}
