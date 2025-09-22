
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CloudSun, 
  TrendingUp, 
  Droplets, 
  Thermometer,
  Wind,
  BarChart3,
  Zap,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { WeatherData, Sale, Location } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function WeatherSalesAnalytics({ locations, isLoading: parentLoading }) {
  const [weatherData, setWeatherData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');

  const generateCorrelationData = useCallback(async (weather, sales) => {
    try {
      // Group sales by hour and location
      const salesByHour = {};
      sales.forEach(sale => {
        const hour = new Date(sale.sale_datetime).toISOString().slice(0, 13) + ':00:00.000Z';
        const locationId = sale.location_id || 'unknown';
        const key = `${hour}_${locationId}`;
        
        if (!salesByHour[key]) {
          salesByHour[key] = { count: 0, revenue: 0, hour, locationId };
        }
        salesByHour[key].count += 1;
        salesByHour[key].revenue += sale.total_amount || 0;
      });

      // Match with weather data
      const correlations = [];
      weather.forEach(weatherPoint => {
        const locationSalesKey = `${weatherPoint.timestamp_hour}_${weatherPoint.location_id}`;
        const salesPoint = salesByHour[locationSalesKey];
        
        if (salesPoint) {
          correlations.push({
            timestamp: weatherPoint.timestamp_hour,
            location_id: weatherPoint.location_id,
            temperature: weatherPoint.temperature_c,
            humidity: weatherPoint.humidity_percent,
            precipitation: weatherPoint.precipitation_mm || 0,
            wind_speed: weatherPoint.wind_kph || 0,
            sales_count: salesPoint.count,
            revenue: salesPoint.revenue,
            weather_condition: weatherPoint.weather_condition || 'Unknown'
          });
        }
      });

      setCorrelationData(correlations);
    } catch (error) {
      console.error('Error generating correlation data:', error);
    }
  }, []); // generateCorrelationData does not depend on any state or props outside its arguments, so empty deps array is fine.

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [weatherResponse, salesResponse] = await Promise.all([
        WeatherData.list('-timestamp_hour', 500),
        Sale.list('-sale_datetime', 1000)
      ]);
      
      setWeatherData(weatherResponse || []);
      setSalesData(salesResponse || []);
      
      // Generate correlation data
      await generateCorrelationData(weatherResponse || [], salesResponse || []);
    } catch (error) {
      console.error('Error loading weather-sales data:', error);
      toast.error('Failed to load analytics data');
    }
    setIsLoading(false);
  }, [generateCorrelationData]); // loadData depends on generateCorrelationData

  useEffect(() => {
    loadData();
  }, [loadData]); // useEffect depends on loadData

  const analyzeWeatherImpact = async () => {
    setIsAnalyzing(true);
    try {
      const analysisPrompt = `
        Analyze the correlation between weather conditions and vending machine sales:
        
        Weather-Sales Data: ${JSON.stringify(correlationData.slice(0, 200))}
        
        Find patterns and provide insights on:
        1. How temperature affects sales (optimal temperature ranges)
        2. Impact of weather conditions (rain, sun, etc.) on different product categories
        3. Seasonal trends and recommendations
        4. Optimal inventory strategies based on weather forecasts
        
        Provide specific, actionable insights with data to support them.
      `;

      const analysis = await InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            temperature_insights: {
              type: "object",
              properties: {
                optimal_range: { type: "string" },
                sales_increase_per_degree: { type: "number" },
                peak_sales_temp: { type: "number" }
              }
            },
            weather_impact: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  condition: { type: "string" },
                  sales_multiplier: { type: "number" },
                  recommended_action: { type: "string" }
                }
              }
            },
            inventory_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  weather_forecast: { type: "string" },
                  stock_adjustment: { type: "string" },
                  priority_products: { type: "array", items: { type: "string" } }
                }
              }
            },
            key_insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setInsights([analysis]);
      toast.success('Weather impact analysis complete!');
    } catch (error) {
      console.error('Error analyzing weather impact:', error);
      toast.error('Failed to analyze weather impact');
    }
    setIsAnalyzing(false);
  };

  const filteredCorrelationData = selectedLocation === 'all' 
    ? correlationData 
    : correlationData.filter(d => d.location_id === selectedLocation);

  const temperatureCorrelationData = filteredCorrelationData.map(d => ({
    temperature: d.temperature,
    sales: d.sales_count,
    revenue: d.revenue
  }));

  const weatherConditionSummary = filteredCorrelationData.reduce((acc, d) => {
    const condition = d.weather_condition || 'Unknown';
    if (!acc[condition]) {
      acc[condition] = { count: 0, totalSales: 0, totalRevenue: 0 };
    }
    acc[condition].count += 1;
    acc[condition].totalSales += d.sales_count;
    acc[condition].totalRevenue += d.revenue;
    return acc;
  }, {});

  const conditionChartData = Object.entries(weatherConditionSummary).map(([condition, data]) => ({
    condition,
    avgSales: Math.round(data.totalSales / data.count),
    avgRevenue: Math.round(data.totalRevenue / data.count)
  }));

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="w-6 h-6 text-blue-500" />
                Weather-Sales Intelligence
              </CardTitle>
              <p className="text-slate-600 mt-1">
                AI-powered analysis of how weather conditions impact your sales performance
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={loadData}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button
                onClick={analyzeWeatherImpact}
                disabled={isAnalyzing || correlationData.length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    AI Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-medium">Data Points</p>
                  <p className="text-2xl font-bold text-blue-900">{correlationData.length.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium">Avg Temperature</p>
                  <p className="text-2xl font-bold text-green-900">
                    {correlationData.length > 0 ? 
                      Math.round(correlationData.reduce((sum, d) => sum + d.temperature, 0) / correlationData.length) + '°C'
                      : '--'
                    }
                  </p>
                </div>
                <Thermometer className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-medium">Weather Conditions</p>
                  <p className="text-2xl font-bold text-purple-900">{Object.keys(weatherConditionSummary).length}</p>
                </div>
                <CloudSun className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 font-medium">Locations</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {new Set(correlationData.map(d => d.location_id)).size}
                  </p>
                </div>
                <Wind className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <Tabs defaultValue="correlation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="correlation">Temperature vs Sales</TabsTrigger>
              <TabsTrigger value="conditions">Weather Conditions</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="correlation" className="mt-6">
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Temperature vs Sales Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={temperatureCorrelationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="temperature" 
                        name="Temperature (°C)" 
                        label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        dataKey="sales" 
                        name="Sales Count" 
                        label={{ value: 'Sales Count', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [value, name === 'sales' ? 'Sales Count' : name]}
                        labelFormatter={(value) => `Temperature: ${value}°C`}
                      />
                      <Scatter dataKey="sales" fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conditions" className="mt-6">
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Average Sales by Weather Condition</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={conditionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="condition" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgSales" stroke="#8884d8" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              {insights.length > 0 ? (
                <div className="space-y-6">
                  {insights.map((analysis, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Temperature Insights */}
                      {analysis.temperature_insights && (
                        <Card className="border-green-200 bg-green-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                              <Thermometer className="w-5 h-5" />
                              Temperature Impact Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-green-900">
                            <p><strong>Optimal Temperature Range:</strong> {analysis.temperature_insights.optimal_range}</p>
                            {analysis.temperature_insights.peak_sales_temp && (
                              <p><strong>Peak Sales Temperature:</strong> {analysis.temperature_insights.peak_sales_temp}°C</p>
                            )}
                            {analysis.temperature_insights.sales_increase_per_degree && (
                              <p><strong>Sales Increase per Degree:</strong> {analysis.temperature_insights.sales_increase_per_degree}%</p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Weather Impact */}
                      {analysis.weather_impact && analysis.weather_impact.length > 0 && (
                        <Card className="border-blue-200 bg-blue-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                              <CloudSun className="w-5 h-5" />
                              Weather Condition Impact
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3">
                              {analysis.weather_impact.map((impact, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                  <div>
                                    <p className="font-medium text-blue-900">{impact.condition}</p>
                                    <p className="text-sm text-blue-700">{impact.recommended_action}</p>
                                  </div>
                                  <Badge className={impact.sales_multiplier > 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                    {impact.sales_multiplier > 1 ? '+' : ''}{((impact.sales_multiplier - 1) * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Key Insights */}
                      {analysis.key_insights && analysis.key_insights.length > 0 && (
                        <Card className="border-purple-200 bg-purple-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-800">
                              <TrendingUp className="w-5 h-5" />
                              Key Insights & Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.key_insights.map((insight, i) => (
                                <li key={i} className="flex items-start gap-2 text-purple-900">
                                  <span className="text-purple-600 font-bold">•</span>
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border border-slate-200">
                  <CardContent className="text-center py-12">
                    <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No AI Analysis Yet</h3>
                    <p className="text-slate-500 mb-6">
                      Click "AI Analysis" to get intelligent insights about how weather affects your sales
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
