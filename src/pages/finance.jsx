import React, { useState, useEffect } from 'react';
import { Sale, Product, Payout } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BarChart, TrendingUp, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { subDays, startOfDay, endOfDay } from 'date-fns';

import FinanceOverview from '../components/finance/FinanceOverview';
import ProfitLossChart from '../components/finance/ProfitLossChart';
import PayoutsTable from '../components/finance/PayoutsTable';
import AccountingSync from '../components/finance/AccountingSync';
import TaxDashboard from '../components/finance/TaxDashboard';
import BankReconciliation from '../components/finance/BankReconciliation';
import SendReportDialog from '../components/shared/SendReportDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function FinancePage() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSendDialog, setShowSendDialog] = useState(false);
    
    const [dateRange, setDateRange] = useState({
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date()),
    });

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        setIsLoading(true);
        try {
            const [salesData, productsData, payoutsData] = await Promise.all([
                Sale.list('-sale_datetime', 1000),
                Product.list(),
                Payout.list('-payout_date', 100)
            ]);
            setSales(salesData || []);
            setProducts(productsData || []);
            setPayouts(payoutsData || []);
        } catch (error) {
            console.error("Failed to load financial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.sale_datetime);
        return (!dateRange.from || saleDate >= dateRange.from) && (!dateRange.to || saleDate <= dateRange.to);
    });

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Financial Hub</h1>
                        <p className="text-slate-600 mt-1">Track revenue, profits, payouts, and manage accounting.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                         <Button variant="outline" onClick={() => setShowSendDialog(true)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email Report
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <Tabs defaultValue="overview">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="payouts">Payouts</TabsTrigger>
                            <TabsTrigger value="accounting">Accounting</TabsTrigger>
                            <TabsTrigger value="tax">Tax Center</TabsTrigger>
                            <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview">
                            <div className="space-y-6">
                                <FinanceOverview sales={filteredSales} products={products} payouts={payouts} />
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                            Profit & Loss Trend
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ProfitLossChart sales={filteredSales} products={products} />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="payouts">
                            <PayoutsTable payouts={payouts} />
                        </TabsContent>
                        
                        <TabsContent value="accounting">
                           <AccountingSync />
                        </TabsContent>

                        <TabsContent value="tax">
                           <TaxDashboard sales={filteredSales} />
                        </TabsContent>
                        
                        <TabsContent value="reconciliation">
                            <BankReconciliation payouts={payouts} />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
            
            <SendReportDialog
                open={showSendDialog}
                onOpenChange={setShowSendDialog}
                allowedReports={['sales', 'finance']}
                defaultReportType='finance'
            />
        </div>
    );
}