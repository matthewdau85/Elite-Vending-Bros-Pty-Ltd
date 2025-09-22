import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Leaf, TrendingUp, Download, Calendar, 
  BarChart3, PieChart, Target, Award,
  Globe, Recycle, Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart as RechartsPieChart, Cell } from 'recharts';
import { ESGMetric, Location } from '@/api/entities';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';
import { generateESGReport } from '@/api/functions';

export default function ESGReporting() {
  const [metrics, setMetrics] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      let dateFilter = {};
      const now = new Date();
      switch (selectedPeriod) {
        case 'monthly':
          dateFilter = {
            metric_date: {
              $gte: startOfMonth(now).toISOString().split('T')[0],
              $lte: endOfMonth(now).toISOString().split('T')[0]
            }
          };
          break;
        case 'quarterly':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          dateFilter = {
            metric_date: {
              $gte: quarterStart.toISOString().split('T')[0],
              $lte: now.toISOString().split('T')[0]
            }
          };
          break;
        case 'annual':
          dateFilter = {
            metric_date: {
              $gte: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
              $lte: now.toISOString().split('T')[0]
            }
          };
          break;
      }

      if (selectedLocation !== 'all') {
        dateFilter.location_id = selectedLocation;
      }

      const [esgMetrics, locationData] = await Promise.all([
        ESGMetric.filter(dateFilter, '-metric_date'),
        Location.list()
      ]);

      setMetrics(esgMetrics);
      setLocations(locationData);
    } catch (error) {
      console.error('Error loading ESG data:', error);
      toast.error('Failed to load ESG metrics');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await generateESGReport({
        period: selectedPeriod,
        location_id: selectedLocation !== 'all' ? selectedLocation : null
      });
      setReportData(response.data);
      toast.success('ESG report generated successfully');
    } catch (error) {
      toast.error('Failed to generate ESG report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const calculateSummaryMetrics = () => {
    if (metrics.length === 0) return null;

    const totalConsumption = metrics.reduce((sum, m) => sum + (m.total_kwh_consumed || 0), 0);
    const totalRenewable = metrics.reduce((sum, m) => sum + (m.renewable_kwh || 0), 0);
    const totalEmissions = metrics.reduce((sum, m) => sum + (m.carbon_emissions_kg || 0), 0);
    const totalCost = metrics.reduce((sum, m) => sum + (m.energy_cost_cents || 0), 0);
    const totalSavings = metrics.reduce((sum, m) => sum + (m.savings_achieved_kwh || 0), 0);

    return {
      totalConsumption: totalConsumption.toFixed(1),
      renewablePercentage: totalConsumption > 0 ? ((totalRenewable / totalConsumption) * 100).toFixed(1) : '0',
      totalEmissions: totalEmissions.toFixed(1),
      totalCost: (totalCost / 100).toFixed(2),
      totalSavings: totalSavings.toFixed(1),
      avgEfficiencyGrade: calculateAverageGrade(metrics.map(m => m.efficiency_grade).filter(Boolean))
    };
  };

  const calculateAverageGrade = (grades) => {
    if (grades.length === 0) return 'N/A';
    const gradeValues = { 'A+': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
    const avgValue = grades.reduce((sum, grade) => sum + (gradeValues[grade] || 0), 0) / grades.length;
    const gradeKeys = Object.keys(gradeValues);
    return gradeKeys.find(key => gradeValues[key] === Math.round(avgValue)) || 'N/A';
  };

  const prepareChartData = () => {
    return metrics.map(metric => ({
      date: format(new Date(metric.metric_date), 'MMM dd'),
      consumption: metric.total_kwh_consumed || 0,
      renewable: metric.renewable_kwh || 0,
      emissions: metric.carbon_emissions_kg || 0,
      cost: (metric.energy_cost_cents || 0) / 100,
      savings: metric.savings_achieved_kwh || 0
    })).reverse();
  };

  const summary = calculateSummaryMetrics();
  const chartData = prepareChartData();

  if (loading) {
    return <LoadingSpinner text="Loading ESG metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ESG Reporting</h2>
          <p className="text-slate-600">Environmental, Social, and Governance metrics and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={generatingReport}>
            <Download className="w-4 h-4 mr-2" />
            {generatingReport ? 'Generating...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{summary.totalConsumption}</div>
                  <p className="text-sm text-slate-600">kWh Consumed</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{summary.renewablePercentage}%</div>
                  <p className="text-sm text-slate-600">Renewable</p>
                </div>
                <Leaf className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{summary.totalEmissions}</div>
                  <p className="text-sm text-slate-600">kg CO₂</p>
                </div>
                <Globe className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">${summary.totalCost}</div>
                  <p className="text-sm text-slate-600">Energy Cost</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{summary.totalSavings}</div>
                  <p className="text-sm text-slate-600">kWh Saved</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{summary.avgEfficiencyGrade}</div>
                  <p className="text-sm text-slate-600">Efficiency Grade</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consumption">Energy Consumption</TabsTrigger>
          <TabsTrigger value="emissions">Carbon Emissions</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value} kWh`, 'Consumption']} />
                    <Area type="monotone" dataKey="consumption" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Renewable vs Total Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="consumption" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="renewable" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sustainability Initiatives */}
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Initiatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Recycle className="w-6 h-6 text-green-600" />
                    <h4 className="font-semibold text-green-800">Energy Optimization</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Automated scheduling and temperature optimization reducing consumption by up to 15%
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Leaf className="w-6 h-6 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Renewable Energy</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Partnering with renewable energy providers to increase clean energy usage
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Carbon Neutral Goals</h4>
                  </div>
                  <p className="text-sm text-purple-700">
                    Working towards carbon neutrality by 2030 through efficiency and offsets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption">
          <Card>
            <CardHeader>
              <CardTitle>Energy Consumption Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="consumption" stroke="#3b82f6" name="Total Consumption (kWh)" />
                  <Line type="monotone" dataKey="savings" stroke="#10b981" name="Energy Saved (kWh)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emissions">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Emissions Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} kg`, 'CO₂ Emissions']} />
                  <Area type="monotone" dataKey="emissions" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sustainability">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Grades by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.slice(0, 10).map((metric, index) => {
                      const location = locations.find(l => l.id === metric.location_id);
                      const gradeColor = {
                        'A+': 'bg-green-100 text-green-800',
                        'A': 'bg-green-100 text-green-800',
                        'B': 'bg-blue-100 text-blue-800',
                        'C': 'bg-yellow-100 text-yellow-800',
                        'D': 'bg-orange-100 text-orange-800',
                        'F': 'bg-red-100 text-red-800'
                      }[metric.efficiency_grade] || 'bg-gray-100 text-gray-800';

                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location?.name || 'Unknown'}</span>
                          <Badge className={gradeColor}>
                            Grade {metric.efficiency_grade || 'N/A'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost vs Savings Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`$${value}`, name === 'cost' ? 'Energy Cost' : 'Cost Savings']} />
                      <Line type="monotone" dataKey="cost" stroke="#ef4444" name="cost" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* ESG Goals */}
            <Card>
              <CardHeader>
                <CardTitle>ESG Goals & Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
                    <p className="text-sm text-slate-600">Renewable Energy Target</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${summary?.renewablePercentage || 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15%</div>
                    <p className="text-sm text-slate-600">Energy Reduction Target</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">2030</div>
                    <p className="text-sm text-slate-600">Carbon Neutral Target</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}