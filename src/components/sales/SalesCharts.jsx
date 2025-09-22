
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SalesCharts({ sales = [], machines = [], locations = [], products = [], isLoading }) {
  const getDailyRevenue = () => {
    const last30Days = eachDayOfInterval({
      start: startOfDay(subDays(new Date(), 29)),
      end: startOfDay(new Date())
    });

    return last30Days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.sale_datetime);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });
      
      const revenue = daySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const transactions = daySales.length;
      
      return {
        date: format(day, 'MMM dd'),
        revenue: revenue,
        transactions: transactions
      };
    });
  };

  const getTopProducts = () => {
    const productSales = {};
    
    sales.forEach(sale => {
      const product = products.find(p => p.sku === sale.product_sku);
      const productName = product ? product.name : sale.product_sku;
      
      if (!productSales[productName]) {
        productSales[productName] = {
          name: productName,
          revenue: 0,
          quantity: 0
        };
      }
      
      productSales[productName].revenue += sale.total_amount || 0;
      productSales[productName].quantity += sale.quantity || 0;
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getMachinePerformance = () => {
    const machineData = {};
    
    sales.forEach(sale => {
      const machine = machines.find(m => m.id === sale.machine_id);
      const machineLabel = machine ? `Machine ${machine.machine_id}` : `Machine ${sale.machine_id}`;
      
      if (!machineData[machineLabel]) {
        machineData[machineLabel] = {
          name: machineLabel,
          revenue: 0,
          transactions: 0
        };
      }
      
      machineData[machineLabel].revenue += sale.total_amount || 0;
      machineData[machineLabel].transactions += 1;
    });
    
    return Object.values(machineData)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  };

  const dailyData = getDailyRevenue();
  const topProducts = getTopProducts();
  const machinePerformance = getMachinePerformance();

  return (
    <div className="space-y-6">
      {/* Daily Revenue Trend */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Daily Revenue Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toFixed(2)}` : value, 
                    name === 'revenue' ? 'Revenue' : 'Transactions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No sales data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Machine Performance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Machine Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : machinePerformance.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No machine data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={machinePerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {machinePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Sales Pattern */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Hourly Sales Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getHourlyPattern()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Transactions']} />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function getHourlyPattern() {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: 0
    }));

    sales.forEach(sale => {
      const hour = new Date(sale.sale_datetime).getHours();
      hourlyData[hour].count += 1;
    });

    return hourlyData;
  }
}
