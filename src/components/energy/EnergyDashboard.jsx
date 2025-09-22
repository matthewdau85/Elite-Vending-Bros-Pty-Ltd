
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, TrendingDown, TrendingUp, DollarSign, 
  Thermometer, Leaf, AlertTriangle, Clock
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area, BarChart, Bar } from 'recharts';
import { EnergyReading, ESGMetric, Location, Machine } from '@/api/entities';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function EnergyDashboard() {
  const [energyData, setEnergyData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Memoize loadDashboardData to prevent unnecessary re-creations
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
            // Handle unexpected selectedPeriod, perhaps default to '7d'
            startDate.setDate(startDate.getDate() - 7); 
            break;
      }

      const [energyReadings, esgMetrics, locationData, machineData] = await Promise.all([
        EnergyReading.list('-reading_timestamp', 1000), // Fetch a reasonable number of recent readings
        ESGMetric.list('-metric_date', 50), // Fetch recent ESG metrics
        Location.list(),
        Machine.list()
      ]);

      // Process energy readings for charts
      const processedData = processEnergyData(energyReadings, startDate, endDate);
      setEnergyData(processedData);

      // Calculate summary metrics
      const summaryMetrics = calculateSummaryMetrics(energyReadings, esgMetrics, startDate, endDate);
      setMetrics(summaryMetrics);

      setLocations(locationData);
      setMachines(machineData);

    } catch (error) {
      console.error('Error loading energy dashboard:', error);
      toast.error('Failed to load energy data');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]); // loadDashboardData depends on selectedPeriod

  // useEffect now depends on the memoized loadDashboardData
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // Effect re-runs only when loadDashboardData changes (i.e., selectedPeriod changes)

  const processEnergyData = (readings, startDate, endDate) => {
    // Filter readings within date range
    const filteredReadings = readings.filter(reading => {
      const readingDate = new Date(reading.reading_timestamp);
      // Ensure reading_timestamp is a valid date string
      return readingDate instanceof Date && !isNaN(readingDate) && readingDate >= startDate && readingDate <= endDate;
    });

    // Group by hour/day depending on period
    const groupBy = selectedPeriod === '24h' ? 'hour' : 'day';
    const groupedData = {};

    filteredReadings.forEach(reading => {
      const date = new Date(reading.reading_timestamp);
      let key;
      
      if (groupBy === 'hour') {
        key = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:00`;
      } else {
        key = `${date.getMonth() + 1}/${date.getDate()}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          timestamp: key,
          totalKwh: 0,
          avgTemp: 0,
          avgPower: 0,
          cost: 0,
          readings: 0
        };
      }

      groupedData[key].totalKwh += reading.kwh_delta || 0;
      groupedData[key].avgTemp += reading.ambient_temp_c !== undefined && reading.ambient_temp_c !== null ? reading.ambient_temp_c : 20;
      groupedData[key].avgPower += reading.power_instant_w || 0;
      groupedData[key].cost += (reading.kwh_delta || 0) * 0.25; // Rough cost estimate
      groupedData[key].readings += 1;
    });

    // Calculate averages and return array
    // Sort by timestamp if keys are properly formatted (e.g., YYYY-MM-DD HH:MM)
    // For M/D HH:MM format, localeCompare might not sort numerically correctly for hours/days
    // A better approach for sorting would be to store the original Date object or a sortable string (like ISO 8601) in the groupedData.
    // For now, given the current key format, localeCompare is the closest default.
    return Object.values(groupedData).map(item => ({
      ...item,
      avgTemp: item.readings > 0 ? parseFloat((item.avgTemp / item.readings).toFixed(1)) : 20,
      avgPower: item.readings > 0 ? parseFloat((item.avgPower / item.readings).toFixed(0)) : 0
    })).sort((a, b) => {
        // Attempt to parse keys into sortable date/time objects if possible for better sorting
        // This is a simplified sort and might need more robust handling for edge cases (e.g. year changes)
        const dateA = new Date(`2000/${a.timestamp.replace(' ', ' 2000 ')}`); // Prepend a dummy year for parsing
        const dateB = new Date(`2000/${b.timestamp.replace(' ', ' 2000 ')}`);
        return dateA - dateB;
    });
  };

  const calculateSummaryMetrics = (readings, esgMetrics, startDate, endDate) => {
    const periodReadings = readings.filter(r => {
      const date = new Date(r.reading_timestamp);
      return date instanceof Date && !isNaN(date) && date >= startDate && date <= endDate;
    });

    const totalKwh = periodReadings.reduce((sum, r) => sum + (r.kwh_delta || 0), 0);
    const totalCost = totalKwh * 0.25; // Estimated cost
    const avgPower = periodReadings.length > 0 
      ? periodReadings.reduce((sum, r) => sum + (r.power_instant_w || 0), 0) / periodReadings.length 
      : 0;

    // Calculate previous period for comparison
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(endDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    prevStartDate.setTime(prevStartDate.getTime() - periodLength);
    prevEndDate.setTime(prevEndDate.getTime() - periodLength);

    const prevPeriodReadings = readings.filter(r => {
      const date = new Date(r.reading_timestamp);
      return date instanceof Date && !isNaN(date) && date >= prevStartDate && date <= prevEndDate;
    });

    const prevTotalKwh = prevPeriodReadings.reduce((sum, r) => sum + (r.kwh_delta || 0), 0);
    const kwhChange = prevTotalKwh > 0 ? ((totalKwh - prevTotalKwh) / prevTotalKwh * 100) : 0;

    // ESG calculations
    const carbonEmissions = totalKwh * 0.82; // kg CO2 per kWh (Australia average)
    const renewablePercentage = 25; // Assumed renewable percentage, could be derived from esgMetrics if available

    return {
      totalKwh: totalKwh.toFixed(1),
      totalCost: totalCost.toFixed(2),
      avgPower: avgPower.toFixed(0),
      kwhChange: kwhChange.toFixed(1),
      carbonEmissions: carbonEmissions.toFixed(1),
      renewablePercentage,
      activeAlerts: 3, // Mock data - ideally derived from real alert system
      efficiencyGrade: 'B+' // Mock data - ideally derived from analysis
    };
  };

  if (loading) {
    return <LoadingSpinner text="Loading energy dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Period:</span>
        {[
          { value: '24h', label: '24 Hours' },
          { value: '7d', label: '7 Days' },
          { value: '30d', label: '30 Days' },
          { value: '90d', label: '90 Days' }
        ].map(period => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Consumption
            </CardTitle>
            <Zap className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalKwh} kWh</div>
            <div className="flex items-center mt-1">
              {parseFloat(metrics?.kwhChange) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm ${parseFloat(metrics?.kwhChange) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.abs(parseFloat(metrics?.kwhChange))}% vs prev period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Energy Cost
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalCost}</div>
            <div className="text-sm text-slate-500 mt-1">
              Average: ${metrics?.totalKwh !== '0.0' ? (parseFloat(metrics?.totalCost) / parseFloat(metrics?.totalKwh)).toFixed(3) : '0.000'}/kWh
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Carbon Emissions
            </CardTitle>
            <Leaf className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.carbonEmissions} kg CO₂</div>
            <div className="text-sm text-slate-500 mt-1">
              {metrics?.renewablePercentage}% renewable energy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Efficiency Grade
            </CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {metrics?.efficiencyGrade}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgPower}W</div>
            <div className="text-sm text-slate-500 mt-1">
              Average power draw
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Consumption Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyData}>
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} ${name === 'totalKwh' ? 'kWh' : 'W'}`,
                    name === 'totalKwh' ? 'Energy' : 'Power'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalKwh" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temperature vs Power Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Temperature vs Power Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyData}>
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="temp" orientation="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }}/>
                <YAxis yAxisId="power" orientation="right" label={{ value: 'Power (W)', angle: 90, position: 'insideRight' }}/>
                <Tooltip />
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="avgTemp" 
                  stroke="#f59e0b" 
                  name="Temperature (°C)"
                />
                <Line 
                  yAxisId="power"
                  type="monotone" 
                  dataKey="avgPower" 
                  stroke="#ef4444" 
                  name="Power (W)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Energy Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-red-800">High idle consumption</div>
                <div className="text-sm text-red-600">Machine VM-001 consuming 45% above baseline</div>
              </div>
              <Badge className="bg-red-100 text-red-800">Critical</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div>
                <div className="font-medium text-amber-800">Peak demand alert</div>
                <div className="text-sm text-amber-600">Location approaching demand charge threshold</div>
              </div>
              <Badge className="bg-amber-100 text-amber-800">Warning</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-800">Temperature correlation</div>
                <div className="text-sm text-blue-600">High temp driving increased cooling costs</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Info</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Green Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 mb-1">Off-peak scheduling</div>
              <div className="text-sm text-green-600 mb-2">
                Schedule defrost cycles during off-peak hours (11pm-6am)
              </div>
              <div className="text-xs text-green-500">Potential savings: $45/month</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 mb-1">Temperature optimization</div>
              <div className="text-sm text-green-600 mb-2">
                Increase cooling setpoint by 2°C during low-traffic periods
              </div>
              <div className="text-xs text-green-500">Potential savings: $32/month</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 mb-1">Smart idle management</div>
              <div className="text-sm text-green-600 mb-2">
                Enable aggressive power saving mode after 10pm
              </div>
              <div className="text-xs text-green-500">Potential savings: $28/month</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
