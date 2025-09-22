import React, { useState, useEffect } from 'react';
import { Sale, Machine, Product, MachineStock, Location } from '@/api/entities';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, TrendingUp, Target, AlertTriangle } from 'lucide-react';

import DemandForecast from '../components/ai/DemandForecast';
import MaintenancePredictor from '../components/ai/MaintenancePredictor';
import SmartPricingEngine from '../components/ai/SmartPricingEngine';
import BusinessInsights from '../components/ai/BusinessInsights';
import ProductAffinity from '../components/ai/ProductAffinity';
import LocationInsights from '../components/ai/LocationInsights';
import AnomalyDetector from '../components/ai/AnomalyDetector';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function AIInsightsPage() {
  const [sales, setSales] = useState([]);
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, machinesData, productsData, locationsData, stockData] = await Promise.all([
        Sale.list('-sale_datetime', 1000),
        Machine.list(),
        Product.list(),
        Location.list(),
        MachineStock.list()
      ]);

      setSales(salesData || []);
      setMachines(machinesData || []);
      setProducts(productsData || []);
      setLocations(locationsData || []);
      setStockLevels(stockData || []);
    } catch (error) {
      console.error("Failed to load AI insights data:", error);
      setSales([]);
      setMachines([]);
      setProducts([]);
      setLocations([]);
      setStockLevels([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-purple-600" />
              AI-Powered Business Insights
            </h1>
            <p className="text-slate-600 mt-1">
              Advanced analytics and machine learning insights for data-driven decisions.
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Tabs defaultValue="forecasting" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
              <TabsTrigger value="forecasting">
                <TrendingUp className="w-4 h-4 mr-2" />
                Forecasting
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <Target className="w-4 h-4 mr-2" />
                Smart Pricing
              </TabsTrigger>
              <TabsTrigger value="insights">
                <BrainCircuit className="w-4 h-4 mr-2" />
                Business Insights
              </TabsTrigger>
              <TabsTrigger value="products">
                Product Affinity
              </TabsTrigger>
              <TabsTrigger value="anomalies">
                Anomaly Detection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forecasting">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Demand Forecasting</CardTitle>
                  </CardHeader>
                </Card>
                <DemandForecast 
                  sales={sales}
                  machines={machines}
                  products={products}
                  locations={locations}
                />
              </div>
            </TabsContent>

            <TabsContent value="maintenance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Predictive Maintenance</CardTitle>
                  </CardHeader>
                </Card>
                <MaintenancePredictor 
                  machines={machines}
                  sales={sales}
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Pricing Optimization</CardTitle>
                  </CardHeader>
                </Card>
                <SmartPricingEngine 
                  sales={sales}
                  products={products}
                  machines={machines}
                  locations={locations}
                />
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="space-y-6">
                <BusinessInsights 
                  sales={sales}
                  machines={machines}
                  products={products}
                  locations={locations}
                />
                <LocationInsights 
                  sales={sales}
                  machines={machines}
                  locations={locations}
                />
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Affinity Analysis</CardTitle>
                  </CardHeader>
                </Card>
                <ProductAffinity 
                  sales={sales}
                  products={products}
                />
              </div>
            </TabsContent>

            <TabsContent value="anomalies">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Anomaly Detection</CardTitle>
                  </CardHeader>
                </Card>
                <AnomalyDetector 
                  sales={sales}
                  machines={machines}
                  stockLevels={stockLevels}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}