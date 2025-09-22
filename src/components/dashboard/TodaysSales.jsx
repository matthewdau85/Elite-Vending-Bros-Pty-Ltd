import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/api/entities';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import PeriodToolbar from '../analytics/PeriodToolbar';
import { EnhancedLineChart } from '../analytics/EnhancedChart';
import { formatCurrency, exportToCSV } from '../analytics/chartHelpers';
import { CardSkeleton } from '../shared/Skeletons';

export default function TodaysSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date())
  });

  const loadSales = async () => {
    setLoading(true);
    try {
      const salesData = await Sale.list('-sale_datetime', 1000);
      setSales(salesData);
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_datetime);
    return isWithinInterval(saleDate, dateRange);
  });

  // Process data for charts
  const processChartData = () => {
    const dailyData = {};
    
    filteredSales.forEach(sale => {
      const date = format(new Date(sale.sale_datetime), 'yyyy-MM-dd');
      if (!dailyData[date]) {
        dailyData[date] = {
          date: format(new Date(sale.sale_datetime), 'MMM d'),
          fullDate: date,
          revenue: 0,
          transactions: 0
        };
      }
      dailyData[date].revenue += sale.total_amount || 0;
      dailyData[date].transactions += 1;
    });

    return Object.values(dailyData).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  };

  const chartData = processChartData();

  // Calculate summary stats
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalTransactions = filteredSales.length;
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const handleExportCsv = async () => {
    const exportData = filteredSales.map(sale => ({
      date: format(new Date(sale.sale_datetime), 'yyyy-MM-dd HH:mm:ss'),
      transaction_id: sale.transaction_id,
      machine_id: sale.machine_id,
      product_sku: sale.product_sku,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      total_amount: sale.total_amount,
      payment_method: sale.payment_method,
      status: sale.status
    }));

    const filename = `sales-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}`;
    exportToCSV(exportData, filename);
  };

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PeriodToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportCsv={handleExportCsv}
        exportLabel="Export Sales CSV"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, true)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgTransaction)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLineChart
            data={chartData}
            dataKeys={['revenue']}
            xAxisKey="date"
            height={350}
            formatValue={formatCurrency}
          />
        </CardContent>
      </Card>

      {/* Transactions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLineChart
            data={chartData}
            dataKeys={['transactions']}
            xAxisKey="date"
            height={300}
            formatValue={(value) => value.toLocaleString()}
          />
        </CardContent>
      </Card>
    </div>
  );
}