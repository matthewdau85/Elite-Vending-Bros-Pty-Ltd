import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Coffee, MapPin, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { usePeriod, ComparisonIndicator } from '../analytics/PeriodToolbar';
import { formatCompactNumber } from '../analytics/EnhancedChart';
import { differenceInDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const StatCard = ({ title, value, previousValue, icon: Icon, href, isLoading, format = 'number' }) => {
  const formatValue = (val) => {
    if (format === 'currency') return formatCompactNumber(val, { currency: true });
    if (format === 'percentage') return `${val.toFixed(1)}%`;
    return formatCompactNumber(val);
  };

  const content = (
    <Card className="hover:bg-slate-50 transition-colors shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold mb-1">{formatValue(value)}</div>
            <ComparisonIndicator 
              current={value} 
              previous={previousValue} 
              format={format}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link to={href}>{content}</Link> : content;
};

export default function StatsOverview({ machines, sales, alerts, payouts, isLoading }) {
  const { dateRange } = usePeriod();
  
  // Filter data for current and comparison periods
  const currentPeriodSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_datetime);
    return isWithinInterval(saleDate, dateRange);
  });
  
  const comparisonPeriodSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_datetime);
    return isWithinInterval(saleDate, dateRange.comparison);
  });

  // Calculate current period stats
  const currentRevenue = currentPeriodSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const currentTransactions = currentPeriodSales.length;
  const activeMachines = machines.filter(machine => machine.status === 'online').length;
  const openAlerts = alerts.filter(alert => alert.status === 'open').length;

  // Calculate comparison period stats
  const previousRevenue = comparisonPeriodSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const previousTransactions = comparisonPeriodSales.length;
  
  // Calculate uptime percentage
  const totalMachines = machines.length;
  const uptimePercentage = totalMachines > 0 ? (activeMachines / totalMachines) * 100 : 0;
  
  // For comparison, assume previous uptime was similar (in real app, this would be historical data)
  const previousUptime = totalMachines > 0 ? ((machines.filter(m => m.status !== 'offline').length) / totalMachines) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard 
        title="Revenue" 
        value={currentRevenue / 100} // Convert cents to dollars
        previousValue={previousRevenue / 100}
        icon={DollarSign} 
        isLoading={isLoading} 
        href="/sales"
        format="currency"
      />
      <StatCard 
        title="Transactions" 
        value={currentTransactions}
        previousValue={previousTransactions}
        icon={TrendingUp} 
        isLoading={isLoading} 
        href="/sales"
      />
      <StatCard 
        title="Fleet Uptime" 
        value={uptimePercentage}
        previousValue={previousUptime}
        icon={Coffee} 
        isLoading={isLoading} 
        href="/machines"
        format="percentage"
      />
      <StatCard 
        title="Active Alerts" 
        value={openAlerts}
        previousValue={openAlerts} // Alerts don't have meaningful comparison
        icon={AlertTriangle} 
        isLoading={isLoading} 
        href="/alerts"
      />
    </div>
  );
}