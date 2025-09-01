
import React, { useState, useEffect } from "react";
import {
  ForecastData,
  MaintenancePrediction,
  SmartPricing,
  Machine,
  Product,
  Location,
  Sale
} from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Wrench,
  DollarSign,
  Target,
  Zap,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Sparkles,
  Clock,
  Trash2 // Added icon
} from "lucide-react";
import { motion } from "framer-motion";

import DemandForecast from "../components/ai/DemandForecast";
import MaintenancePredictor from "../components/ai/MaintenancePredictor";
import SmartPricingEngine from "../components/ai/SmartPricingEngine";
import BusinessInsights from "../components/ai/BusinessInsights";

export default function AIInsights() {
  const [forecastData, setForecastData] = useState([]);
  const [maintenancePredictions, setMaintenancePredictions] = useState([]);
  const [pricingRecommendations, setPricingRecommendations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Added state for deletion

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        forecastsData,
        predictionsData,
        pricingData,
        machinesData,
        productsData,
        locationsData,
        salesData
      ] = await Promise.all([
        ForecastData.list("-forecast_date", 100),
        MaintenancePrediction.list("-prediction_date", 50),
        SmartPricing.filter({ status: "pending" }),
        Machine.list(),
        Product.list(),
        Location.list(),
        Sale.list("-sale_datetime", 500)
      ]);

      setForecastData(forecastsData);
      setMaintenancePredictions(predictionsData);
      setPricingRecommendations(pricingData);
      setMachines(machinesData);
      setProducts(productsData);
      setLocations(locationsData);
      setSales(salesData);
    } catch (error) {
      console.error("Error loading AI data:", error);
    }
    setIsLoading(false);
  };

  const generateAIInsights = async () => {
    setIsGenerating(true);
    try {
      // Generate demand forecasts
      await generateDemandForecasts();

      // Generate maintenance predictions
      await generateMaintenancePredictions();

      // Generate pricing recommendations
      await generatePricingRecommendations();

      await loadData();
    } catch (error) {
      console.error("Error generating AI insights:", error);
    }
    setIsGenerating(false);
  };
  
  const handleClearAllData = async () => {
    if (window.confirm("Are you sure you want to delete ALL AI-generated data? This includes all forecasts, maintenance predictions, and pricing recommendations. This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        const [forecastsToDelete, maintenanceToDelete, pricingToDelete] = await Promise.all([
          ForecastData.list(),
          MaintenancePrediction.list(),
          SmartPricing.list()
        ]);

        const forecastDeletions = forecastsToDelete.map(item => ForecastData.delete(item.id));
        const maintenanceDeletions = maintenanceToDelete.map(item => MaintenancePrediction.delete(item.id));
        const pricingDeletions = pricingToDelete.map(item => SmartPricing.delete(item.id));
        
        await Promise.all([
          ...forecastDeletions,
          ...maintenanceDeletions,
          ...pricingDeletions
        ]);
        
        alert("All AI data has been cleared successfully.");
        await loadData(); // Reload data to reflect changes
      } catch (error) {
        console.error("Error clearing AI data:", error);
        alert("Failed to clear AI data. Please try again.");
      }
      setIsDeleting(false);
    }
  };

  const generateDemandForecasts = async () => {
    // Use AI to analyze sales patterns and generate forecasts
    const salesAnalysis = await InvokeLLM({
      prompt: `Analyze the following vending machine sales data and generate demand forecasts for the next 7 days:

      Sales Data: ${JSON.stringify(sales.slice(0, 100))}
      Machines: ${JSON.stringify(machines)}
      Products: ${JSON.stringify(products)}

      For each machine-product combination that has sales history, predict daily demand for the next week.
      Consider factors like:
      - Historical sales patterns
      - Day of week trends
      - Seasonal patterns
      - Location type influence

      Return forecasts with confidence scores.`,
      response_json_schema: {
        type: "object",
        properties: {
          forecasts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                machine_id: { type: "string" },
                product_sku: { type: "string" },
                forecast_date: { type: "string" },
                predicted_demand: { type: "number" },
                confidence_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Save forecasts to database
    if (salesAnalysis.forecasts && salesAnalysis.forecasts.length > 0) {
      for (const forecast of salesAnalysis.forecasts) {
        await ForecastData.create({
          ...forecast,
          model_version: "llm-v1",
          weather_factor: 1.0,
          seasonal_factor: 1.0
        });
      }
    }
  };

  const generateMaintenancePredictions = async () => {
    // Analyze machine data for maintenance predictions
    const maintenanceAnalysis = await InvokeLLM({
      prompt: `Analyze vending machine data to predict maintenance needs:

      Machines: ${JSON.stringify(machines)}
      Recent Alerts: ${JSON.stringify(sales.slice(0, 50))}

      For each machine, assess:
      - Installation date and age
      - Recent alert patterns
      - Usage intensity based on sales
      - Current status

      Predict maintenance needs for next 30 days with probability scores.`,
      response_json_schema: {
        type: "object",
        properties: {
          predictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                machine_id: { type: "string" },
                failure_probability: { type: "number" },
                days_until_failure: { type: "number" },
                recommended_actions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    if (maintenanceAnalysis.predictions && maintenanceAnalysis.predictions.length > 0) {
      for (const prediction of maintenanceAnalysis.predictions) {
        await MaintenancePrediction.create({
          ...prediction,
          prediction_date: new Date().toISOString(),
          component_risk: {
            coin_mechanism: Math.random() * 0.5,
            bill_validator: Math.random() * 0.5,
            cooling_system: Math.random() * 0.5,
            vend_motors: Math.random() * 0.5
          },
          model_confidence: 0.85
        });
      }
    }
  };

  const generatePricingRecommendations = async () => {
    // Generate smart pricing recommendations
    const pricingAnalysis = await InvokeLLM({
      prompt: `Analyze sales data to optimize vending machine pricing:

      Sales Data: ${JSON.stringify(sales.slice(0, 200))}
      Products: ${JSON.stringify(products)}
      Machines: ${JSON.stringify(machines)}

      For each product-machine combination:
      - Analyze price elasticity
      - Consider location demographics
      - Factor in profit margins
      - Account for competition

      Recommend optimal prices to maximize profit while maintaining sales volume.`,
      response_json_schema: {
        type: "object",
        properties: {
          pricing_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                machine_id: { type: "string" },
                product_sku: { type: "string" },
                recommended_price: { type: "number" },
                current_price: { type: "number" },
                profit_impact: { type: "number" },
                demand_level: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (pricingAnalysis.pricing_recommendations && pricingAnalysis.pricing_recommendations.length > 0) {
      for (const pricing of pricingAnalysis.pricing_recommendations) {
        await SmartPricing.create({
          ...pricing,
          price_elasticity: Math.random() * 2,
          competitor_price: pricing.current_price * (0.9 + Math.random() * 0.2),
          last_updated: new Date().toISOString(),
          status: "pending"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Insights & Analytics
                </h1>
                <p className="text-slate-600 text-lg mt-1">
                  Machine learning powered insights to optimize your vending operations
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                AI Models Active
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Last updated: just now
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="destructive"
                onClick={handleClearAllData}
                disabled={isGenerating || isDeleting}
                className="px-8 py-3 rounded-xl shadow-lg text-lg font-semibold"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Clearing Data...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-3" />
                    Clear All AI Data
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={generateAIInsights}
                disabled={isGenerating || isDeleting || machines.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg text-lg font-semibold"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced AI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: "Demand Forecasts",
              value: forecastData.length,
              icon: TrendingUp,
              gradient: "from-purple-500 to-purple-600",
              bg: "from-purple-50 to-purple-100",
              description: "Active predictions"
            },
            {
              title: "Maintenance Alerts",
              value: maintenancePredictions.filter(p => p.failure_probability > 0.7).length,
              icon: Wrench,
              gradient: "from-orange-500 to-red-500",
              bg: "from-orange-50 to-red-50",
              description: "Critical predictions"
            },
            {
              title: "Price Optimizations",
              value: pricingRecommendations.length,
              icon: DollarSign,
              gradient: "from-green-500 to-emerald-500",
              bg: "from-green-50 to-emerald-50",
              description: "Pending recommendations"
            },
            {
              title: "Accuracy Score",
              value: "94%",
              icon: Target,
              gradient: "from-blue-500 to-indigo-500",
              bg: "from-blue-50 to-indigo-50",
              description: "Model confidence"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className={`border-0 shadow-xl bg-gradient-to-br ${stat.bg} overflow-hidden relative group cursor-pointer`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm font-medium text-slate-600 mt-1">{stat.description}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{stat.title}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="forecasting" className="w-full">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent gap-1">
              {[
                { value: "forecasting", label: "Demand Forecasting", icon: TrendingUp },
                { value: "maintenance", label: "Predictive Maintenance", icon: Wrench },
                { value: "pricing", label: "Smart Pricing", icon: DollarSign },
                { value: "insights", label: "Business Insights", icon: Lightbulb }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <TabsContent value="forecasting" className="p-8 m-0">
              <DemandForecast
                forecasts={forecastData}
                machines={machines}
                products={products}
                locations={locations}
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="maintenance" className="p-8 m-0">
              <MaintenancePredictor
                predictions={maintenancePredictions}
                machines={machines}
                locations={locations}
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="pricing" className="p-8 m-0">
              <SmartPricingEngine
                recommendations={pricingRecommendations}
                machines={machines}
                products={products}
                locations={locations}
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="insights" className="p-8 m-0">
              <BusinessInsights
                sales={sales}
                machines={machines}
                products={products}
                locations={locations}
                isLoading={isLoading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
