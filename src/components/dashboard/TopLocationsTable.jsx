import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkline, formatCompactNumber } from '../analytics/EnhancedChart';
import { usePeriod } from '../analytics/PeriodToolbar';
import { isWithinInterval, eachDayOfInterval, format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TopLocationsTable({ sales, locations, machines, isLoading }) {
  const { dateRange } = usePeriod();

  const locationData = useMemo(() => {
    if (!sales.length || !locations.length) return [];

    // Filter sales for current period
    const currentSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_datetime);
      return isWithinInterval(saleDate, dateRange);
    });

    // Group by location
    const locationStats = {};
    
    currentSales.forEach(sale => {
      // Find machine to get location_id
      const machine = machines.find(m => m.id === sale.machine_id);
      if (!machine?.location_id) return;
      
      const locationId = machine.location_id;
      if (!locationStats[locationId]) {
        locationStats[locationId] = {
          locationId,
          revenue: 0,
          transactions: 0,
          dailyData: [],
          avgTicket: 0
        };
      }
      
      locationStats[locationId].revenue += sale.total_amount || 0;
      locationStats[locationId].transactions += 1;
    });

    // Generate daily sparkline data for each location
    const days = eachDayOfInterval(dateRange);
    
    Object.keys(locationStats).forEach(locationId => {
      const locationSales = currentSales.filter(sale => {
        const machine = machines.find(m => m.id === sale.machine_id);
        return machine?.location_id === locationId;
      });

      locationStats[locationId].dailyData = days.map(day => {
        const dayStart = day;
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        
        const daySales = locationSales.filter(sale => {
          const saleDate = new Date(sale.sale_datetime);
          return saleDate >= dayStart && saleDate <= dayEnd;
        });
        
        const dayRevenue = daySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
        
        return {
          date: format(day, 'MMM dd'),
          revenue: dayRevenue / 100, // Convert to dollars
          transactions: daySales.length
        };
      });

      // Calculate average ticket
      if (locationStats[locationId].transactions > 0) {
        locationStats[locationId].avgTicket = locationStats[locationId].revenue / locationStats[locationId].transactions;
      }
    });

    // Convert to array and add location details
    return Object.values(locationStats)
      .map(stat => {
        const location = locations.find(l => l.id === stat.locationId);
        const locationMachines = machines.filter(m => m.location_id === stat.locationId);
        
        return {
          ...stat,
          name: location?.name || 'Unknown Location',
          machineCount: locationMachines.length,
          onlineMachines: locationMachines.filter(m => m.status === 'online').length,
          revenue: stat.revenue / 100 // Convert cents to dollars
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 locations
  }, [sales, locations, machines, dateRange]);

  const getTrendIcon = (data) => {
    if (data.length < 2) return <Minus className="w-3 h-3 text-slate-400" />;
    
    const recent = data[data.length - 1].revenue;
    const previous = data[data.length - 2].revenue;
    
    if (recent > previous) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (recent < previous) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-1 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
                </div>
                <div className="w-16 h-5 bg-slate-200 rounded animate-pulse" />
                <div className="w-20 h-6 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top Locations</span>
          <Badge variant="outline" className="text-xs">
            {locationData.length} locations
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {locationData.map((location, index) => (
            <div key={location.locationId} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {location.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {location.transactions.toLocaleString()} transactions • {location.onlineMachines}/{location.machineCount} online
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold text-sm">
                    {formatCompactNumber(location.revenue, { currency: true })}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatCompactNumber(location.avgTicket / 100, { currency: true })} avg
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Sparkline 
                    data={location.dailyData} 
                    dataKey="revenue" 
                    width={60} 
                    height={24}
                    color="#3b82f6"
                  />
                  {getTrendIcon(location.dailyData)}
                </div>
              </div>
            </div>
          ))}
          
          {locationData.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No location data available for the selected period.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}