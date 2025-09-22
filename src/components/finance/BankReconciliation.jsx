import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Payout } from '@/api/entities';
import { fetchWestpacTransactions } from '@/api/functions';
import { toast } from 'sonner';
import { Banknote, RefreshCw, CheckCircle, AlertCircle, Link, Scale } from 'lucide-react';
import { format } from 'date-fns';

export default function BankReconciliation() {
  const [payouts, setPayouts] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [payoutsRes, bankRes] = await Promise.all([
        Payout.list('-payout_date', 20),
        fetchWestpacTransactions()
      ]);
      setPayouts(payoutsRes || []);
      setBankTransactions(bankRes.data.transactions || []);
      toast.success("Fetched latest data from internal records and bank.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data for reconciliation.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const reconciledData = bankTransactions.map(bt => {
    // Basic reconciliation logic: match description and amount
    const matchedPayout = payouts.find(p => 
      bt.description.includes('NAYAX') && 
      Math.abs(p.net_amount - bt.amount) < 0.01 // Floating point safe comparison
    );
    return { bank: bt, payout: matchedPayout };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Bank Reconciliation (Westpac)
                </CardTitle>
                <CardDescription>
                    Match Nayax payouts with transactions from your bank account.
                </CardDescription>
            </div>
            <Button onClick={fetchData} disabled={isLoading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
            <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Banknote className="w-5 h-5 text-green-600"/>Westpac Bank Transactions</h3>
                <div className="border rounded-lg h-96 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {bankTransactions.map(t => (
                            <TableRow key={t.transactionId}>
                                <TableCell className="text-xs">{format(new Date(t.postedDateTime), 'dd/MM/yy')}</TableCell>
                                <TableCell className="text-xs">{t.description}</TableCell>
                                <TableCell className="text-right text-xs font-mono">${t.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Link className="w-5 h-5 text-blue-600"/>Reconciliation Status</h3>
                 <div className="border rounded-lg h-96 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bank Transaction</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Matched Payout</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {reconciledData.map(item => (
                            <TableRow key={item.bank.transactionId}>
                                <TableCell className="text-xs">{item.bank.description}<br/><span className="font-mono">${item.bank.amount.toFixed(2)}</span></TableCell>
                                <TableCell>
                                {item.payout ? (
                                    <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-4 h-4"/>Matched</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-orange-500 text-xs"><AlertCircle className="w-4 h-4"/>Unmatched</span>
                                )}
                                </TableCell>
                                <TableCell className="text-xs">
                                {item.payout ? `ID: ${item.payout.payout_id.substring(0,8)}...` : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}