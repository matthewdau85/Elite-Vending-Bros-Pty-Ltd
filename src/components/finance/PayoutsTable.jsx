import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Landmark, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Clock },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function PayoutsTable({ payouts, isLoading }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-green-600" />
          Payout History
        </CardTitle>
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
              ) : payouts.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">No Payouts Found</h3>
                      <p className="text-slate-500 text-sm">Payout data from your payment processor will appear here.</p>
                    </TableCell>
                  </TableRow>
              ) : (
                payouts.map((payout) => {
                  const config = statusConfig[payout.status] || statusConfig.pending;
                  return (
                    <TableRow key={payout.id} className="hover:bg-slate-50">
                      <TableCell>{format(new Date(payout.payout_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {format(new Date(payout.period_start), 'MMM d')} - {format(new Date(payout.period_end), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right font-semibold">${payout.net_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-red-600">
                        (${(payout.processing_fees + (payout.service_fees || 0)).toFixed(2)})
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${config.color} gap-1.5`}>
                          <config.icon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{payout.bank_reference}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}