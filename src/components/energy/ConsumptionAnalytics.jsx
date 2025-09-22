
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, TrendingDown, TrendingUp, Filter,
  BarChart3, PieChart, Activity, Target
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ScatterChart, Scatter, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { EnergyReading, Machine, Location } from '@/api/entities';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ConsumptionAnalytics() {
  const [data, setData] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [analysisType, setAnalysisType] = useState('consumption');
  const [outliers, setOutliers] = useState([]);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [energyReadings, machineData, locationData] = await Promise.all([
        EnergyReading.list('-reading_timestamp', 2000),
        Machine.list(),
        Location.list()
      ]);

      setMachines(machineData);
      setLocations(locationData);

      // Process and analyze the data based on current filters
      const processedData = processAnalyticsData(energyReadings, machineData, locationData);
      setData(processedData);

      // Detect outliers for the dedicated panel (uses all readings)
      const detectedOutliers = detectOutliers(energyReadings, machineData);
      setOutliers(detectedOutliers);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load consumption analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedMachine, analysisType]); // Added analysisType as dependency for loadAnalyticsData

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]); // Dependency changed to the memoized loadAnalyticsData

  const processAnalyticsData = (readings, machines, locations) => {
    // Filter readings based on selected filters
    let filteredReadings = readings;

    if (selectedLocation !== 'all') {
      const locationMachines = machines.filter(m => m.location_id === selectedLocation);
      const machineIds = locationMachines.map(m => m.id);
      filteredReadings = filteredReadings.filter(r => machineIds.includes(r.machine_id));
    }

    if (selectedMachine !== 'all') {
      filteredReadings = filteredReadings.filter(r => r.machine_id === selectedMachine);
    }

    // Group by different dimensions based on analysis type
    switch (analysisType) {
      case 'consumption':
        return groupByTimeAndCalculateConsumption(filteredReadings);
      case 'efficiency':
        return calculateEfficiencyMetrics(filteredReadings, machines);
      case 'temperature':
        return analyzeTemperatureCorrelation(filteredReadings);
      case 'outliers':
        return identifyConsumptionOutliers(filteredReadings, machines); // Call the specific outlier analysis function
      default:
        return groupByTimeAndCalculateConsumption(filteredReadings);
    }
  };

  const groupByTimeAndCalculateConsumption = (readings) => {
    const groupedData = {};
    
    readings.forEach(reading => {
      const date = new Date(reading.reading_timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const key = `${dayOfWeek}-${hour}`;
      
      if (!groupedData[key]) {
        groupedData[key] = {
          hour,
          dayOfWeek,
          dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
          timeLabel: `${hour}:00`,
          totalKwh: 0,
          avgPower: 0,
          readings: 0,
          avgTemp: 0
        };
      }
      
      groupedData[key].totalKwh += reading.kwh_delta || 0;
      groupedData[key].avgPower += reading.power_instant_w || 0;
      groupedData[key].avgTemp += reading.ambient_temp_c || 20;
      groupedData[key].readings += 1;
    });

    return Object.values(groupedData).map(item => ({
      ...item,
      avgPower: item.readings > 0 ? item.avgPower / item.readings : 0,
      avgTemp: item.readings > 0 ? item.avgTemp / item.readings : 20,
      avgKwhPerReading: item.readings > 0 ? item.totalKwh / item.readings : 0
    }));
  };

  const calculateEfficiencyMetrics = (readings, machines) => {
    const machineMetrics = {};
    
    readings.forEach(reading => {
      if (!machineMetrics[reading.machine_id]) {
        const machine = machines.find(m => m.id === reading.machine_id);
        machineMetrics[reading.machine_id] = {
          machineId: reading.machine_id,
          machineName: machine?.machine_id || reading.machine_id,
          totalKwh: 0,
          totalRuntime: 0,
          avgIdlePower: 0,
          activePower: 0, // Corrected from avgActivePower to activePower for sum
          idleReadings: 0,
          activeReadings: 0
        };
      }
      
      const metrics = machineMetrics[reading.machine_id];
      metrics.totalKwh += reading.kwh_delta || 0;
      
      // Classify as idle or active based on power consumption
      const power = reading.power_instant_w || 0;
      if (power < 100) { // Assumed idle threshold
        metrics.avgIdlePower += power;
        metrics.idleReadings += 1;
      } else {
        metrics.activePower += power; // Use activePower for sum
        metrics.activeReadings += 1;
      }
    });

    return Object.values(machineMetrics).map(metrics => ({
      ...metrics,
      avgIdlePower: metrics.idleReadings > 0 ? metrics.avgIdlePower / metrics.idleReadings : 0,
      avgActivePower: metrics.activeReadings > 0 ? metrics.activePower / metrics.activeReadings : 0, // Calculate average here
      idlePercentage: metrics.idleReadings / (metrics.idleReadings + metrics.activeReadings) * 100,
      efficiencyScore: calculateEfficiencyScore(metrics)
    }));
  };

  const analyzeTemperatureCorrelation = (readings) => {
    return readings.map(reading => ({
      timestamp: reading.reading_timestamp,
      ambientTemp: reading.ambient_temp_c || 20,
      internalTemp: reading.internal_temp_c || 5,
      power: reading.power_instant_w || 0,
      kwh: reading.kwh_delta || 0,
      tempDifference: (reading.ambient_temp_c || 20) - (reading.internal_temp_c || 5)
    })).filter(item => item.ambientTemp > 0 && item.power > 0);
  };

  // This function is used by loadAnalyticsData to populate the 'outliers' state for the dedicated panel
  const detectOutliers = (readings, machines) => {
    const machineBaselines = {};
    
    // Calculate baseline consumption for each machine
    readings.forEach(reading => {
      if (!machineBaselines[reading.machine_id]) {
        machineBaselines[reading.machine_id] = {
          machineId: reading.machine_id,
          powers: [],
          kwhDeltas: []
        };
      }
      
      if (reading.power_instant_w) {
        machineBaselines[reading.machine_id].powers.push(reading.power_instant_w);
      }
      if (reading.kwh_delta) {
        machineBaselines[reading.machine_id].kwhDeltas.push(reading.kwh_delta);
      }
    });

    // Identify outliers (readings > 2 standard deviations from mean)
    const outliers = [];
    
    Object.entries(machineBaselines).forEach(([machineId, baseline]) => {
      if (baseline.powers.length > 10) {
        const powerMean = baseline.powers.reduce((a, b) => a + b) / baseline.powers.length;
        const powerStd = Math.sqrt(baseline.powers.reduce((sq, n) => sq + Math.pow(n - powerMean, 2), 0) / baseline.powers.length);
        
        const machine = machines.find(m => m.id === machineId);
        const recentOutliers = readings.filter(r => 
          r.machine_id === machineId && 
          r.power_instant_w && 
          Math.abs(r.power_instant_w - powerMean) > 2 * powerStd
        );
        
        if (recentOutliers.length > 0) {
          outliers.push({
            machineId,
            machineName: machine?.machine_id || machineId,
            baseline: powerMean.toFixed(0),
            outlierCount: recentOutliers.length,
            maxDeviation: Math.max(...recentOutliers.map(r => Math.abs(r.power_instant_w - powerMean))).toFixed(0),
            severity: recentOutliers.length > 5 ? 'high' : 'medium'
          });
        }
      }
    });
    
    return outliers;
  };

  // This function is called by processAnalyticsData when analysisType is 'outliers'
  // It has the same logic as detectOutliers, but works on potentially filtered data
  const identifyConsumptionOutliers = (readings, machines) => {
    const machineBaselines = {};
    
    // Calculate baseline consumption for each machine
    readings.forEach(reading => {
      if (!machineBaselines[reading.machine_id]) {
        machineBaselines[reading.machine_id] = {
          machineId: reading.machine_id,
          powers: [],
          kwhDeltas: []
        };
      }
      
      if (reading.power_instant_w) {
        machineBaselines[reading.machine_id].powers.push(reading.power_instant_w);
      }
      if (reading.kwh_delta) {
        machineBaselines[reading.machine_id].kwhDeltas.push(reading.kwh_delta);
      }
    });

    // Identify outliers (readings > 2 standard deviations from mean)
    const outliers = [];
    
    Object.entries(machineBaselines).forEach(([machineId, baseline]) => {
      if (baseline.powers.length > 10) {
        const powerMean = baseline.powers.reduce((a, b) => a + b) / baseline.powers.length;
        const powerStd = Math.sqrt(baseline.powers.reduce((sq, n) => sq + Math.pow(n - powerMean, 2), 0) / baseline.powers.length);
        
        const machine = machines.find(m => m.id === machineId);
        const recentOutliers = readings.filter(r => 
          r.machine_id === machineId && 
          r.power_instant_w && 
          Math.abs(r.power_instant_w - powerMean) > 2 * powerStd
        );
        
        if (recentOutliers.length > 0) {
          outliers.push({
            machineId,
            machineName: machine?.machine_id || machineId,
            baseline: powerMean.toFixed(0),
            outlierCount: recentOutliers.length,
            maxDeviation: Math.max(...recentOutliers.map(r => Math.abs(r.power_instant_w - powerMean))).toFixed(0),
            severity: recentOutliers.length > 5 ? 'high' : 'medium'
          });
        }
      }
    });
    
    return outliers;
  };

  const calculateEfficiencyScore = (metrics) => {
    // Simple efficiency scoring based on idle vs active power ratio
    if (metrics.avgActivePower === 0) return 0;
    const ratio = metrics.avgIdlePower / metrics.avgActivePower;
    return Math.max(0, 100 - (ratio * 100));
  };

  const renderAnalysisChart = () => {
    switch (analysisType) {
      case 'consumption':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="timeLabel" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value.toFixed(2)} ${name === 'totalKwh' ? 'kWh' : 'W'}`,
                  name === 'totalKwh' ? 'Total Consumption' : 'Average Power'
                ]}
              />
              <Bar dataKey="totalKwh" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'efficiency':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="machineName" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiencyScore" fill="#10b981" />
              <Bar dataKey="idlePercentage" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'temperature':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data.slice(0, 100)}>
              <XAxis dataKey="ambientTemp" name="Ambient Temp" unit="°C" />
              <YAxis dataKey="power" name="Power" unit="W" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Temperature vs Power" data={data} fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'outliers': // Add a simple chart for outliers if selected as analysis type
        // The 'data' will contain the summary of outliers per machine
        // We can display a bar chart of outlier counts or max deviation
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="machineName" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Outlier Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [`${value}`, name === 'outlierCount' ? 'Number of Outliers' : name]} />
              <Bar dataKey="outlierCount" fill="#ef4444" name="Outlier Count" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div className="flex items-center justify-center h-96 text-slate-500">Select an analysis type</div>;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading consumption analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumption">Consumption Patterns</SelectItem>
                  <SelectItem value="efficiency">Machine Efficiency</SelectItem>
                  <SelectItem value="temperature">Temperature Correlation</SelectItem>
                  <SelectItem value="outliers">Outlier Detection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
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
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600">Machine</label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Machines</SelectItem>
                  {machines
                    .filter(machine => selectedLocation === 'all' || machine.location_id === selectedLocation)
                    .map(machine => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.machine_id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={loadAnalyticsData} className="w-full">
                <Activity className="w-4 h-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {analysisType === 'consumption' && 'Consumption Patterns by Hour'}
            {analysisType === 'efficiency' && 'Machine Efficiency Analysis'}
            {analysisType === 'temperature' && 'Temperature vs Power Correlation'}
            {analysisType === 'outliers' && 'Outlier Detection Results'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderAnalysisChart()}
        </CardContent>
      </Card>

      {/* Outliers Panel */}
      {outliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Consumption Outliers Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outliers.map(outlier => (
                <div key={outlier.machineId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{outlier.machineName}</span>
                    <Badge className={
                      outlier.severity === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-800'
                    }>
                      {outlier.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>Baseline: {outlier.baseline}W</div>
                    <div>Max deviation: +{outlier.maxDeviation}W</div>
                    <div>Outlier readings: {outlier.outlierCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
