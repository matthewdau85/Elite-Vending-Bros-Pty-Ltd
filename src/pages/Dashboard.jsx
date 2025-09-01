import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, Machine, Sale, MachineStock, Location } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Coffee, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Calendar,
  Bell,
  Zap,
  Printer 
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import StatsOverview from "../components/dashboard/StatsOverview";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import MachineStatus from "../components/dashboard/MachineStatus";
import TodaysSales from "../components/dashboard/TodaysSales";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [todaysSales, setTodaysSales] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [alertsData, machinesData, salesData, locationsData] = await Promise.all([
        Alert.filter({ status: "open" }, "-alert_datetime", 10),
        Machine.list("-updated_date", 20),
        Sale.list("-sale_datetime", 50),
        Location.list()
      ]);

      setAlerts(alertsData);
      setMachines(machinesData);
      setTodaysSales(salesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getStatsData = () => {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    
    const todaysTransactions = todaysSales.filter(
      sale => new Date(sale.sale_datetime) >= todayStart
    );
    
    const todaysRevenue = todaysTransactions.reduce(
      (sum, sale) => sum + (sale.total_amount || 0), 
      0
    );

    const onlineMachines = machines.filter(m => m.status === "online").length;
    const criticalAlerts = alerts.filter(a => a.priority === "critical").length;

    return {
      totalMachines: machines.length,
      onlineMachines,
      todaysRevenue,
      todaysTransactions: todaysTransactions.length,
      criticalAlerts,
      totalLocations: locations.length
    };
  };

  const stats = getStatsData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Operations Dashboard</h1>
            <p className="text-slate-600 mt-1">
              {format(new Date(), "EEEE, MMMM d, yyyy")} • Real-time overview
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate(createPageUrl("Admin"))}>
              <Zap className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          stats={stats}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Alerts & Machine Status */}
          <div className="lg:col-span-2 space-y-6">
            <AlertsPanel 
              alerts={alerts}
              isLoading={isLoading}
              onRefresh={loadDashboardData}
            />
            
            <MachineStatus 
              machines={machines}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Today's Sales */}
          <div>
            <TodaysSales 
              sales={todaysSales}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to={createPageUrl("Alerts")}>
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:shadow-md transition-all">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-sm">View All Alerts</span>
                </Button>
              </Link>
              <Link to={createPageUrl("Machines")}>
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:shadow-md transition-all">
                  <Coffee className="w-6 h-6" />
                  <span className="text-sm">Manage Machines</span>
                </Button>
              </Link>
              <Link to={createPageUrl("Routes")}>
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:shadow-md transition-all">
                  <MapPin className="w-6 h-6" />
                  <span className="text-sm">Plan Routes</span>
                </Button>
              </Link>
              <Link to={createPageUrl("Finance")}>
                <Button variant="outline" className="h-20 w-full flex flex-col gap-2 hover:shadow-md transition-all">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Financial Report</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}