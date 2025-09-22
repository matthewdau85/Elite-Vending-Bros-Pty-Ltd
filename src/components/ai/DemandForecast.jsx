
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  Package,
  Target,
  AlertTriangle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, addDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function DemandForecast({ forecasts = [], machines = [], products = [], locations = [], isLoading, onRefresh }) {
  const [selectedMachine, setSelectedMachine] = useState("all");

  const getForecastChartData = () => {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i);
      return {
        date: format(date, 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        demand: 0
      };
    });

    const filteredForecasts = selectedMachine === "all" 
      ? forecasts 
      : forecasts.filter(f => f.machine_id === selectedMachine);

    filteredForecasts.forEach(forecast => {
      const dayData = next7Days.find(d => d.fullDate === forecast.forecast_date);
      if (dayData) {
        dayData.demand += forecast.predicted_demand;
      }
    });

    return next7Days;
  };

  const getTopProducts = () => {
    const productDemand = {};
    
    forecasts.forEach(forecast => {
      if (!productDemand[forecast.product_sku]) {
        const product = products.find(p => p.sku === forecast.product_sku);
        productDemand[forecast.product_sku] = {
          sku: forecast.product_sku,
          name: product?.name || forecast.product_sku,
          total_demand: 0,
          machines_count: 0,
          avg_confidence: 0
        };
      }
      
      productDemand[forecast.product_sku].total_demand += forecast.predicted_demand;
      productDemand[forecast.product_sku].machines_count += 1;
      productDemand[forecast.product_sku].avg_confidence += forecast.confidence_score;
    });

    return Object.values(productDemand)
      .map(item => ({
        ...item,
        avg_confidence: item.avg_confidence / item.machines_count
      }))
      .sort((a, b) => b.total_demand - a.total_demand)
      .slice(0, 10);
  };

  const chartData = getForecastChartData();
  const topProducts = getTopProducts();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">7-Day Demand Forecast</h3>
              <p className="text-sm text-slate-600">
                AI-powered predictions based on historical sales patterns
              </p>
            </div>
            <div className="flex gap-3">
              <select 
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Machines</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    Machine {machine.machine_id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Daily Demand Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="demand" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Top Products by Predicted Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((product, index) => (
                <div key={product.sku} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.machines_count} machines</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{Math.round(product.total_demand)}</p>
                    <p className="text-xs text-slate-500">{Math.round(product.avg_confidence * 100)}% conf.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Forecast Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Detailed Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {forecasts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No Forecasts Available</h3>
              <p className="text-slate-500 text-sm">
                Click "Generate AI Insights" to create demand forecasts based on your sales data
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Predicted Demand</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.slice(0, 20).map((forecast) => {
                  const machine = machines.find(m => m.id === forecast.machine_id);
                  const product = products.find(p => p.sku === forecast.product_sku);
                  
                  return (
                    <TableRow key={`${forecast.machine_id}-${forecast.product_sku}-${forecast.forecast_date}`}>
                      <TableCell>
                        <span className="font-medium">Machine {machine?.machine_id || forecast.machine_id}</span>
                      </TableCell>
                      <TableCell>
                        <span>{product?.name || forecast.product_sku}</span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(forecast.forecast_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{Math.round(forecast.predicted_demand)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          forecast.confidence_score > 0.8 
                            ? "bg-green-100 text-green-800" 
                            : forecast.confidence_score > 0.6
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }>
                          {Math.round(forecast.confidence_score * 100)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
