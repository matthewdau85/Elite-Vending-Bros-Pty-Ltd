
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SalesCharts from '../components/sales/SalesCharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import SalesOverview from '../components/sales/SalesOverview';
import { PageSkeleton } from '../components/shared/Skeletons';
import { Sale } from '@/api/entities';
import { Machine } from '@/api/entities';
import { Location } from '@/api/entities';
import { Product } from '@/api/entities';

export default function AnalyticsPage() {
  const [sales, setSales] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [salesData, machinesData, locationsData, productsData] = await Promise.all([
          Sale.list('-sale_datetime', 1000),
          Machine.list(),
          Location.list(),
          Product.list()
        ]);
        setSales(salesData || []);
        setMachines(machinesData || []);
        setLocations(locationsData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Analytics & Reports
          </h1>
          <p className="text-slate-600 mt-1">
            Deep dive into your sales, customer, and machine performance data.
          </p>
        </header>

        <SalesOverview 
          sales={sales}
          machines={machines}
          locations={locations}
          products={products}
          isLoading={isLoading}
        />
        
        <SalesCharts 
          sales={sales}
          machines={machines}
          locations={locations}
          products={products}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Customer Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                This section will provide insights into customer behavior, repeat purchases, and peak activity times.
              </p>
              <div className="mt-4 p-4 text-center bg-slate-100 rounded-md">
                <p className="font-semibold">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Machine Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Analyze machine uptime, error rates, and profitability per unit.
              </p>
              <div className="mt-4 p-4 text-center bg-slate-100 rounded-md">
                <p className="font-semibold">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Profitability Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Break down profit margins by product, location, and machine.
              </p>
              <div className="mt-4 p-4 text-center bg-slate-100 rounded-md">
                <p className="font-semibold">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
