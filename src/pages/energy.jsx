
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, TrendingDown, TrendingUp, Leaf, 
  DollarSign, AlertTriangle, Settings, 
  BarChart3, Calendar, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import FeatureGate from '../components/features/FeatureGate';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Energy-specific components
import EnergyDashboard from '../components/energy/EnergyDashboard';
import ConsumptionAnalytics from '../components/energy/ConsumptionAnalytics';
import TariffManager from '../components/energy/TariffManager';
import OptimizationEngine from '../components/energy/OptimizationEngine';
import ESGReporting from '../components/energy/ESGReporting';
import EnergyAlertsPanel from '../components/energy/EnergyAlertsPanel';

export default function EnergyModule() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize energy monitoring
    const initializeModule = async () => {
      try {
        setLoading(true);
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (error) {
        console.error('Failed to initialize energy module:', error);
        toast.error('Failed to load energy monitoring');
      } finally {
        setLoading(false);
      }
    };

    initializeModule();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner text="Loading Energy & ESG Module..." />
        </div>
      </div>
    );
  }

  return (
    <FeatureGate featureKey="energy.monitoring" fallback={
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Energy Monitoring Not Available</h2>
              <p className="text-slate-600">This feature is not enabled for your account.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <Toaster />
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                Energy & ESG
              </h1>
              <p className="text-slate-600 mt-2">
                Monitor energy consumption, optimize costs, and track sustainability metrics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <FeatureGate featureKey="esg.reports">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export ESG Report
                </Button>
              </FeatureGate>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="optimization">
                <Zap className="w-4 h-4 mr-2" />
                Optimization
              </TabsTrigger>
              <TabsTrigger value="tariffs">
                <DollarSign className="w-4 h-4 mr-2" />
                Tariffs
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alerts
              </TabsTrigger>
              <FeatureGate featureKey="esg.reports">
                <TabsTrigger value="esg">
                  <Leaf className="w-4 h-4 mr-2" />
                  ESG Reports
                </TabsTrigger>
              </FeatureGate>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <EnergyDashboard />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <ConsumptionAnalytics />
            </TabsContent>

            {/* Optimization Tab */}
            <TabsContent value="optimization" className="mt-6">
              <OptimizationEngine />
            </TabsContent>

            {/* Tariffs Tab */}
            <TabsContent value="tariffs" className="mt-6">
              <TariffManager />
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="mt-6">
              <EnergyAlertsPanel />
            </TabsContent>

            {/* ESG Reports Tab */}
            <FeatureGate featureKey="esg.reports">
              <TabsContent value="esg" className="mt-6">
                <ESGReporting />
              </TabsContent>
            </FeatureGate>
          </Tabs>
        </div>
      </div>
    </FeatureGate>
  );
}
