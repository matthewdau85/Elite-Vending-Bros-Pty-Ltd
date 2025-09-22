import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

export default function RefundStatsOverview({ refunds }) {
  const totalRefunds = refunds.length;
  const pendingRefunds = refunds.filter(r => r.status === 'pending').length;
  const totalRefundValue = refunds.reduce((sum, r) => sum + r.amount_cents, 0) / 100;
  const approvedValue = refunds
    .filter(r => ['approved', 'paid'].includes(r.status))
    .reduce((sum, r) => sum + r.amount_cents, 0) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Cases</p>
              <p className="text-2xl font-bold text-slate-900">{totalRefunds}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-slate-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRefunds}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Claimed</p>
              <p className="text-2xl font-bold text-red-600">${totalRefundValue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Approved Value</p>
              <p className="text-2xl font-bold text-green-600">${approvedValue.toFixed(0)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}