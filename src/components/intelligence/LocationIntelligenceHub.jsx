import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, MapPin, TrendingUp, Thermometer, 
  Users, ShoppingCart, AlertTriangle, Target,
  RefreshCw, Play, BarChart3, Lightbulb
} from 'lucide-react';
import { LocationIntelligence, Location, WeatherImpact, FootfallData, CompetitorMapping } from '@/api/entities';
import { generateLocationIntelligence } from '@/api/functions';
import { simulateHeatwaveScenario } from '@/api/functions';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';
import FeatureGate from '../features/FeatureGate';

export default function LocationIntelligenceHub() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scenario, setScenario] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const locationsData = await Location.list();
      setLocations(locationsData);
      
      if (locationsData.length > 0 && !selectedLocation) {
        setSelectedLocation(locationsData[0]);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load location data');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadIntelligence = useCallback(async (locationId) => {
    if (!locationId) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingIntelligence = await LocationIntelligence.filter({
        location_id: locationId,
        analysis_date: today
      });
      
      if (existingIntelligence.length > 0) {
        setIntelligence(existingIntelligence[0]);
      } else {
        setIntelligence(null);
      }
    } catch (error) {
      console.error('Error loading intelligence:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadIntelligence(selectedLocation.id);
    }
  }, [selectedLocation, loadIntelligence]);

  const generateIntelligence = async (useMlRanker = false) => {
    if (!selectedLocation) return;
    
    try {
      setGenerating(true);
      const response = await generateLocationIntelligence({
        location_id: selectedLocation.id,
        use_ml_ranker: useMlRanker
      });
      
      if (response.success) {
        setIntelligence(response.intelligence);
        toast.success('Location intelligence generated successfully');
      } else {
        toast.error('Failed to generate intelligence: ' + response.error);
      }
    } catch (error) {
      console.error('Error generating intelligence:', error);
      toast.error('Failed to generate intelligence');
    } finally {
      setGenerating(false);
    }
  };

  const runHeatwaveScenario = async () => {
    if (!selectedLocation) return;
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const response = await simulateHeatwaveScenario({
        location_id: selectedLocation.id,
        scenario_start_date: tomorrow.toISOString().split('T')[0],
        duration_days: 7
      });
      
      if (response.success) {
        setScenario(response.scenario);
        toast.success('Heatwave scenario simulation completed');
      } else {
        toast.error('Failed to run scenario: ' + response.error);
      }
    } catch (error) {
      console.error('Error running scenario:', error);
      toast.error('Failed to run heatwave scenario');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner text="Loading Location Intelligence..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            Location Intelligence
          </h1>
          <p className="text-slate-600 mt-2">
            AI-powered insights combining weather, footfall, and competition data
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select 
            value={selectedLocation?.id || ''} 
            onValueChange={(value) => {
              const location = locations.find(l => l.id === value);
              setSelectedLocation(location);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {location.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => generateIntelligence(false)} disabled={generating}>
            {generating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Generate Insights
          </Button>
        </div>
      </div>

      {selectedLocation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Signals Overview */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Signal Strength
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intelligence ? (
                  <>
                    <FeatureGate feature="li.weather" fallback={null}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <Thermometer className="w-4 h-4" />
                          Weather Impact
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${intelligence.signals.weather_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{intelligence.signals.weather_score}</span>
                        </div>
                      </div>
                    </FeatureGate>
                    
                    <FeatureGate feature="li.footfall" fallback={null}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Footfall Level
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${intelligence.signals.footfall_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{intelligence.signals.footfall_score}</span>
                        </div>
                      </div>
                    </FeatureGate>
                    
                    <FeatureGate feature="li.competitors" fallback={null}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Competition
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full">
                            <div 
                              className="h-full bg-red-500 rounded-full" 
                              style={{ width: `${intelligence.signals.competitor_pressure}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{intelligence.signals.competitor_pressure}</span>
                        </div>
                      </div>
                    </FeatureGate>

                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Venue Activity
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ width: `${intelligence.signals.venue_activity}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{intelligence.signals.venue_activity}</span>
                      </div>
                    </div>

                    {intelligence.ml_score && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">ML Confidence</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {(intelligence.ml_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No intelligence data available</p>
                    <p className="text-sm">Click "Generate Insights" to analyze this location</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scenario Testing */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Scenario Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={runHeatwaveScenario}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Thermometer className="w-4 h-4 mr-2" />
                    Simulate Heatwave Week
                  </Button>
                  
                  {scenario && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Scenario Complete</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Expected revenue uplift: <strong>{scenario.expected_outcomes?.revenue_impact?.uplift_percentage}%</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        View full analysis in the Insights tab
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="planogram">Planograms</TabsTrigger>
                <TabsTrigger value="scenario">Scenario</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {intelligence?.recommendations ? (
                      <div className="space-y-4">
                        {intelligence.recommendations
                          .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
                          .map((rec, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Badge 
                                  variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                                  className="mb-2"
                                >
                                  {rec.priority} Priority
                                </Badge>
                                <h4 className="font-medium">{rec.action}</h4>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-slate-500 mb-1">Confidence</div>
                                <div className="font-medium">
                                  {(rec.confidence * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-3">{rec.reasoning}</p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Expected Impact:</span>
                              <span className="font-medium text-green-600">
                                +{rec.estimated_uplift_percent}% uplift
                              </span>
                            </div>
                            
                            {rec.a_b_test_eligible && (
                              <Badge variant="outline" className="mt-2">
                                A/B Test Ready
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recommendations available</p>
                        <p className="text-sm">Generate intelligence to see AI recommendations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="planogram" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Planogram Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {intelligence?.planogram_suggestions?.length > 0 ? (
                      <div className="space-y-3">
                        {intelligence.planogram_suggestions.map((suggestion, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Slot {suggestion.slot_number}</span>
                              <Badge variant="outline">
                                +{suggestion.expected_uplift}% uplift
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600">
                              <span>Replace:</span> <strong>{suggestion.current_product}</strong>
                              <br />
                              <span>With:</span> <strong>{suggestion.suggested_product}</strong>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{suggestion.reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No planogram suggestions available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scenario" className="space-y-4">
                {scenario ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Heatwave Scenario Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              +{scenario.expected_outcomes?.revenue_impact?.uplift_percentage}%
                            </div>
                            <div className="text-sm text-green-700">Revenue Uplift</div>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              ${scenario.expected_outcomes?.revenue_impact?.uplift_amount}
                            </div>
                            <div className="text-sm text-blue-700">Additional Revenue</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {scenario.duration_days} days
                            </div>
                            <div className="text-sm text-orange-700">Scenario Duration</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">A/B Test Design</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 border rounded-lg">
                                <h5 className="font-medium text-sm mb-2">Control Group</h5>
                                <p className="text-xs text-slate-600">
                                  {scenario.a_b_test_design?.control_group?.description}
                                </p>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h5 className="font-medium text-sm mb-2">Treatment Group</h5>
                                <p className="text-xs text-slate-600">
                                  {scenario.a_b_test_design?.treatment_group?.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Success Criteria</h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {scenario.a_b_test_design?.success_criteria?.map((criteria, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Target className="w-3 h-3" />
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Play className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-500">Run a scenario simulation to see detailed analysis</p>
                      <Button onClick={runHeatwaveScenario} className="mt-4">
                        <Thermometer className="w-4 h-4 mr-2" />
                        Start Heatwave Simulation
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Price Test Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {intelligence?.price_test_opportunities?.length > 0 ? (
                      <div className="space-y-3">
                        {intelligence.price_test_opportunities.map((test, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{test.product_sku}</h4>
                              <Badge 
                                variant={test.test_type === 'increase' ? 'default' : 'destructive'}
                              >
                                {test.test_type === 'increase' ? 'Price Increase' : 'Price Decrease'}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600 mb-2">
                              <span>Current:</span> <strong>${(test.current_price / 100).toFixed(2)}</strong>
                              {' → '}
                              <span>Suggested:</span> <strong>${(test.suggested_price / 100).toFixed(2)}</strong>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Test Duration: {test.duration_days} days</span>
                              <span>Confidence: {(test.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No price testing opportunities available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}