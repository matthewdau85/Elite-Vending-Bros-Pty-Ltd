import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeriodProvider } from '@/components/analytics/PeriodToolbar';
import PeriodToolbar from '@/components/analytics/PeriodToolbar';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TodaysSales from '@/components/dashboard/TodaysSales';
import LiveMapWidget from '@/components/dashboard/LiveMapWidget';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import TopLocationsTable from '@/components/dashboard/TopLocationsTable';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import WeatherSalesAnalytics from '@/components/dashboard/WeatherSalesAnalytics';
import { PageSkeleton } from '@/components/shared/Skeletons';
import { Sale, Machine, Location, Alert, Payout } from '@/api/entities';

function DashboardInner() {
  const [sales, setSales] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async ({ showSkeleton = false } = {}) => {
    if (showSkeleton) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [salesData, machinesData, locationsData, alertsData, payoutsData] = await Promise.all([
        Sale.list('-sale_datetime', 500).catch(() => []),
        Machine.list().catch(() => []),
        Location.list().catch(() => []),
        Alert.list('-alert_datetime', 50).catch(() => []),
        Payout.list('-payout_date', 50).catch(() => [])
      ]);

      setSales(Array.isArray(salesData) ? salesData : []);
      setMachines(Array.isArray(machinesData) ? machinesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData({ showSkeleton: true });
  }, [loadData]);

  const handleRefresh = () => loadData();

  const openAlerts = useMemo(
    () => alerts.filter(alert => (alert?.status || '').toLowerCase() !== 'resolved').slice(0, 10),
    [alerts]
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <PageSkeleton />
        </div>
      </div>
    );
  }

  const machineCount = machines.length;
  const locationCount = locations.length;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-blue-600" />
              Operations Dashboard
            </h1>
            <p className="text-slate-600 mt-2 text-sm md:text-base">
              Monitor sales trends, fleet health, and location performance across {machineCount} machines in {locationCount} locations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh data
            </Button>
          </div>
        </header>

        <PeriodToolbar showExport={false} className="border-0 shadow-sm" />

        <StatsOverview
          machines={machines}
          sales={sales}
          alerts={alerts}
          payouts={payouts}
          isLoading={isLoading || isRefreshing}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <TodaysSales />
            <TopLocationsTable
              sales={sales}
              locations={locations}
              machines={machines}
              isLoading={isLoading || isRefreshing}
            />
            <WeatherSalesAnalytics
              locations={locations}
              isLoading={isLoading || isRefreshing}
            />
          </div>
          <div className="space-y-6">
            <AlertsPanel
              alerts={openAlerts}
              isLoading={isLoading || isRefreshing}
              onRefresh={handleRefresh}
            />
            <LiveMapWidget
              machines={machines}
              locations={locations}
              isLoading={isLoading || isRefreshing}
            />
            <WeatherWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PeriodProvider>
      <DashboardInner />
    </PeriodProvider>
  );
}

