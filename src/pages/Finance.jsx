
import React, { useState, useEffect } from 'react';
import { Sale, Product, Payout } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { subDays, startOfDay, endOfDay, format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Filter, Printer, Mail } from 'lucide-react';

import FinanceOverview from '../components/finance/FinanceOverview';
import ProfitLossChart from '../components/finance/ProfitLossChart';
import PayoutsTable from '../components/finance/PayoutsTable';
import SendReportDialog from "../components/shared/SendReportDialog";

export default function Finance() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const [dateRange, setDateRange] = useState({
    from: startOfDay(subDays(new Date(), 90)),
    to: endOfDay(new Date())
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, productsData, payoutsData] = await Promise.all([
        Sale.list("-sale_datetime", 5000), // Fetch more sales for financial analysis
        Product.list(),
        Payout.list("-payout_date", 100),
      ]);
      setSales(salesData);
      setProducts(productsData);
      setPayouts(payoutsData);
    } catch (error) {
      console.error("Error loading finance data:", error);
    }
    setIsLoading(false);
  };

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_datetime);
    return (!dateRange.from || saleDate >= dateRange.from) && 
           (!dateRange.to || saleDate <= dateRange.to);
  });
  
  const filteredPayouts = payouts.filter(p => {
      const payoutDate = new Date(p.payout_date);
      return (!dateRange.from || payoutDate >= dateRange.from) && 
             (!dateRange.to || payoutDate <= dateRange.to);
  });

  const getFinancialMetrics = () => {
    const productCosts = products.reduce((acc, p) => {
      acc[p.sku] = p.base_cost || 0;
      return acc;
    }, {});

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalGst = 0;
    let totalFees = 0;

    filteredSales.forEach(sale => {
      totalRevenue += sale.total_amount || 0;
      totalCogs += (productCosts[sale.product_sku] || 0) * (sale.quantity || 1);
      totalGst += sale.gst_amount || 0;
      totalFees += sale.processing_fee || 0;
    });

    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalCogs, grossProfit, totalGst, totalFees, grossMargin };
  };

  const getChartData = () => {
    const productCosts = products.reduce((acc, p) => {
      acc[p.sku] = p.base_cost || 0;
      return acc;
    }, {});

    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });

    return months.map(monthStart => {
      const monthEnd = endOfMonth(monthStart);
      const monthName = format(monthStart, 'MMM yyyy');

      const monthSales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.sale_datetime);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });

      const revenue = monthSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const cogs = monthSales.reduce((sum, sale) => sum + (productCosts[sale.product_sku] || 0) * (sale.quantity || 1), 0);
      
      return {
        name: monthName,
        revenue,
        cogs,
        profit: revenue - cogs,
      };
    });
  };

  const metrics = getFinancialMetrics();
  const chartData = getChartData();

  // New handler for printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Financials</h1>
            <p className="text-slate-600 mt-1">
              Analyze revenue, profit, payouts, and taxes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSendDialog(true)}>
              <Mail className="w-4 h-4 mr-2" />
              Send Report
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-5 h-5" />
              Filter by Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DatePickerWithRange 
              date={dateRange}
              onDateChange={setDateRange}
            />
          </CardContent>
        </Card>

        <FinanceOverview metrics={metrics} isLoading={isLoading} />
        
        <ProfitLossChart data={chartData} isLoading={isLoading} />
        
        <PayoutsTable payouts={filteredPayouts} isLoading={isLoading} />
      </div>
      <SendReportDialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        reportType="finance"
        reportName="Financial Report"
      />
    </div>
  );
}
