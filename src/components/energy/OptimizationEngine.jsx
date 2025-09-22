import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, TrendingDown, Lightbulb, Clock, 
  Thermometer, Settings, CheckCircle, 
  AlertTriangle, Calendar, Play, BarChart3
} from 'lucide-react';
import { EnergyOptimization, Machine } from '@/api/entities';
import { format } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';
import { calculateEnergyOptimizations } from '@/api/functions';

export default function OptimizationEngine() {
  const [optimizations, setOptimizations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  
  useEffect(() => {
    loadOptimizations();
  }, []);
  
  const loadOptimizations = async () => {
    try {
      setLoading(true);
      const [optimizationData, machineData] = await Promise.all([
        EnergyOptimization.list('-created_date'),
        Machine.list()
      ]);
      setOptimizations(optimizationData);
      setMachines(machineData);
    } catch (error) {
      console.error('Error loading optimizations:', error);
      toast.error('Failed to load energy optimizations');
    } finally {
      setLoading(false);
    }
  };
  
  const runOptimizationAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await calculateEnergyOptimizations();
      toast.success(`Generated ${response.optimizations_generated} optimization recommendations`);
      loadOptimizations();
    } catch (error) {
      toast.error('Failed to run optimization analysis');
    } finally {
      setAnalyzing(false);
    }
  };
  
  const implementOptimization = async (optimization) => {
    try {
      await EnergyOptimization.update(optimization.id, {
        status: 'implemented',
        implemented_date: new Date().toISOString()
      });
      toast.success('Optimization marked as implemented');
      loadOptimizations();
    } catch (error) {
      toast.error('Failed to implement optimization');
    }
  };
  
  const getOptimizationIcon = (type) => {
    const icons = {
      'schedule_adjustment': Clock,
      'temperature_optimization': Thermometer,
      'idle_reduction': Zap,
      'peak_shaving': TrendingDown
    };
    return icons[type] || Settings;
  };
  
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800', 
      'implemented': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  if (loading) {
    return <LoadingSpinner text="Loading optimization engine..." />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Energy Optimization Engine</h2>
          <p className="text-slate-600">AI-powered recommendations to reduce energy consumption and costs</p>
        </div>
        <Button 
          onClick={runOptimizationAnalysis} 
          disabled={analyzing}
          className="bg-green-600 hover:bg-green-700"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {analyzing ? 'Analyzing...' : 'Generate Recommendations'}
        </Button>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="implemented">Implemented</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{optimizations.filter(o => o.status === 'pending').length}</div>
                <p className="text-sm text-slate-600">Pending Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {optimizations.reduce((sum, o) => sum + (o.projected_savings_kwh_monthly || 0), 0).toFixed(0)}
                </div>
                <p className="text-sm text-slate-600">kWh/month Potential</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  ${(optimizations.reduce((sum, o) => sum + (o.projected_savings_cost_cents_monthly || 0), 0) / 100).toFixed(0)}
                </div>
                <p className="text-sm text-slate-600">Cost Savings/month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {optimizations.reduce((sum, o) => sum + (o.environmental_impact?.co2_reduction_kg_monthly || 0), 0).toFixed(0)}
                </div>
                <p className="text-sm text-slate-600">kg CO₂ Reduction</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Optimization Recommendations */}
          <div className="grid gap-4">
            {optimizations
              .filter(o => ['pending', 'approved'].includes(o.status))
              .map(optimization => {
                const machine = machines.find(m => m.id === optimization.machine_id);
                const Icon = getOptimizationIcon(optimization.optimization_type);
                
                return (
                  <Card key={optimization.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg capitalize">
                                {optimization.optimization_type.replace('_', ' ')}
                              </h3>
                              <Badge className={getStatusColor(optimization.status)}>
                                {optimization.status}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800">
                                {machine?.machine_id || 'Unknown Machine'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">Monthly Savings:</span>
                                <div className="font-medium text-green-600">
                                  {optimization.projected_savings_kwh_monthly} kWh
                                </div>
                                <div className="font-medium text-green-600">
                                  ${(optimization.projected_savings_cost_cents_monthly / 100).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-600">Confidence:</span>
                                <div className="font-medium">
                                  {Math.round(optimization.confidence_score * 100)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-600">Difficulty:</span>
                                <div className="font-medium capitalize">
                                  {optimization.implementation_difficulty}
                                </div>
                              </div>
                            </div>
                            
                            {/* Current vs Recommended */}
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                              <h4 className="font-medium text-slate-800">Optimization Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-xs text-slate-600 font-medium">CURRENT</span>
                                  <div className="text-sm">
                                    {Object.entries(optimization.current_schedule || {}).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                                        <span className="font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs text-green-600 font-medium">RECOMMENDED</span>
                                  <div className="text-sm">
                                    {Object.entries(optimization.recommended_schedule || {}).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                                        <span className="font-medium text-green-600">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Environmental Impact */}
                            {optimization.environmental_impact && (
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-600">Environmental Impact:</span>
                                <span className="font-medium text-green-600">
                                  -{optimization.environmental_impact.co2_reduction_kg_monthly} kg CO₂/month
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {optimization.status === 'pending' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => implementOptimization(optimization)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Implement
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOptimization(optimization)}
                              >
                                View Details
                              </Button>
                            </>
                          )}
                          {optimization.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => implementOptimization(optimization)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Deploy
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
            {/* Empty State */}
            {optimizations.filter(o => ['pending', 'approved'].includes(o.status)).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Recommendations</h3>
                  <p className="text-slate-600 mb-4">
                    Run the optimization analysis to generate energy saving recommendations
                  </p>
                  <Button onClick={runOptimizationAnalysis} disabled={analyzing}>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {analyzing ? 'Analyzing...' : 'Generate Recommendations'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="implemented">
          <div className="grid gap-4">
            {optimizations
              .filter(o => o.status === 'implemented')
              .map(optimization => {
                const machine = machines.find(m => m.id === optimization.machine_id);
                const Icon = getOptimizationIcon(optimization.optimization_type);
                
                return (
                  <Card key={optimization.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold capitalize">
                              {optimization.optimization_type.replace('_', ' ')}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Implemented
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600">
                            Machine: {machine?.machine_id || 'Unknown'}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-slate-600">Projected Savings:</span>
                              <span className="ml-1 font-medium text-green-600">
                                {optimization.projected_savings_kwh_monthly} kWh/month
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Implemented:</span>
                              <span className="ml-1 font-medium">
                                {format(new Date(optimization.implemented_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                            {optimization.actual_savings_kwh && (
                              <div>
                                <span className="text-slate-600">Actual Savings:</span>
                                <span className="ml-1 font-medium text-green-600">
                                  {optimization.actual_savings_kwh} kWh/month
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
            {optimizations.filter(o => o.status === 'implemented').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Implemented Optimizations</h3>
                  <p className="text-slate-600">
                    Once you implement recommendations, they'll appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Optimization Analytics</h3>
              <p className="text-slate-600">
                Detailed analytics and performance tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}