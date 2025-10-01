import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Alert,
  Machine,
  Payout,
  Sale,
  Location,
} from "@/api/entities";
import { PeriodProvider } from "../components/analytics/PeriodToolbar";
import PeriodToolbar from "../components/analytics/PeriodToolbar";
import StatsOverview from "../components/dashboard/StatsOverview";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import LiveMapWidget from "../components/dashboard/LiveMapWidget";
import TodaysSales from "../components/dashboard/TodaysSales";
import TopLocationsTable from "../components/dashboard/TopLocationsTable";
import WeatherWidget from "../components/dashboard/WeatherWidget";
import WeatherSalesAnalytics from "../components/dashboard/WeatherSalesAnalytics";
import { safeArray } from "../components/utils/safe";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

function DashboardContent() {
  const [machines, setMachines] = useState([]);
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingOverview, setIsRefreshingOverview] = useState(false);
  const [isRefreshingAlerts, setIsRefreshingAlerts] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadOverviewData = useCallback(async ({ initial = false } = {}) => {
    if (initial) {
      setIsLoading(true);
    } else {
      setIsRefreshingOverview(true);
    }

    try {
      const [machinesData, salesData, alertsData, payoutsData, locationsData] = await Promise.all([
        Machine.list(),
        Sale.list("-sale_datetime", 500),
        Alert.list("-alert_datetime", 50),
        Payout.list("-payout_date", 50),
        Location.list(),
      ]);

      setMachines(safeArray(machinesData));
      setSales(safeArray(salesData));
      setAlerts(safeArray(alertsData));
      setPayouts(safeArray(payoutsData));
      setLocations(safeArray(locationsData));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setMachines([]);
      setSales([]);
      setAlerts([]);
      setPayouts([]);
      setLocations([]);
    }

    if (initial) {
      setIsLoading(false);
    } else {
      setIsRefreshingOverview(false);
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    setIsRefreshingAlerts(true);
    try {
      const alertData = await Alert.list("-alert_datetime", 50);
      setAlerts(safeArray(alertData));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh alerts:", error);
    }
    setIsRefreshingAlerts(false);
  }, []);

  useEffect(() => {
    loadOverviewData({ initial: true });
  }, [loadOverviewData]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return "Just now";
    }
    return formatDistanceToNow(lastUpdated, { addSuffix: true });
  }, [lastUpdated]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-slate-600">
            Monitor fleet performance, sales trends, and operational alerts in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            Updated {lastUpdatedLabel}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOverviewData({ initial: false })}
            disabled={isRefreshingOverview}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshingOverview ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <PeriodToolbar
        showExport={false}
        additionalFilters={
          <Badge variant="outline" className="text-xs font-medium text-slate-500">
            Showing {safeArray(sales).length.toLocaleString()} recent sales
          </Badge>
        }
      />

      <StatsOverview
        machines={machines}
        sales={sales}
        alerts={alerts}
        payouts={payouts}
        isLoading={isLoading || isRefreshingOverview}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <LiveMapWidget
          machines={machines}
          locations={locations}
          isLoading={isLoading || isRefreshingOverview}
        />
        <div className="space-y-6">
          <AlertsPanel
            alerts={alerts}
            isLoading={isLoading || isRefreshingAlerts || isRefreshingOverview}
            onRefresh={refreshAlerts}
          />
          <WeatherWidget />
        </div>
      </div>

      <TopLocationsTable
        sales={sales}
        locations={locations}
        machines={machines}
        isLoading={isLoading || isRefreshingOverview}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TodaysSales />
        <WeatherSalesAnalytics
          locations={locations}
          isLoading={isLoading || isRefreshingOverview}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <PeriodProvider>
          <DashboardContent />
        </PeriodProvider>
      </div>
    </div>
  );
}
