import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  TrendingUp, 
  Target, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
  Database
} from 'lucide-react';

export default function AIForecastingHelp() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2>AI Forecasting & Analytics Guide</h2>
      <p>Learn how to leverage artificial intelligence to optimize your vending machine operations through demand prediction, maintenance scheduling, and smart pricing.</p>
      
      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-sm text-blue-800">Demand Forecasting</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-blue-700">
            Predict future sales and optimize restocking schedules
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-sm text-orange-800">Maintenance Prediction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-orange-700">
            Prevent breakdowns with predictive maintenance
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <CardTitle className="text-sm text-green-800">Smart Pricing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-green-700">
            Optimize prices for maximum profitability
          </CardContent>
        </Card>
      </div>

      <h3>Getting Started with AI Features</h3>
      <p>The AI system requires historical data to generate accurate predictions. Here's how to get started:</p>

      <h4>Prerequisites</h4>
      <ul>
        <li><strong>Historical Sales Data:</strong> At least 30 days of transaction history</li>
        <li><strong>Machine Information:</strong> Properly configured machines with location data</li>
        <li><strong>Product Catalog:</strong> Complete product information with pricing</li>
        <li><strong>Regular Data Sync:</strong> Active Nayax integration for real-time data</li>
      </ul>

      <h4>First-Time Setup</h4>
      <ol>
        <li>Navigate to <strong>AI Insights</strong> page</li>
        <li>Click <strong>"Generate AI Insights"</strong> to create initial models</li>
        <li>Wait for processing (typically 5-15 minutes)</li>
        <li>Review generated forecasts and recommendations</li>
        <li>Use insights to plan restocking and maintenance activities</li>
      </ol>

      <h3>1. Demand Forecasting</h3>
      <p>AI demand forecasting analyzes historical sales patterns to predict future demand for each product at each location.</p>

      <h4>How It Works</h4>
      <ul>
        <li><strong>Pattern Recognition:</strong> Identifies daily, weekly, and seasonal trends</li>
        <li><strong>Location Analysis:</strong> Considers location type and demographics</li>
        <li><strong>Product Behavior:</strong> Learns individual product sales patterns</li>
        <li><strong>External Factors:</strong> Accounts for holidays, weather, and events</li>
      </ul>

      <h4>Using Demand Forecasts</h4>
      <p>The forecasting tool provides several key insights:</p>
      
      <div className="bg-slate-50 p-4 rounded-lg my-4">
        <h5 className="font-semibold mb-2">Forecast Metrics</h5>
        <ul className="text-sm space-y-1">
          <li><strong>Predicted Demand:</strong> Expected units to sell per day</li>
          <li><strong>Confidence Score:</strong> Model certainty (60-100%)</li>
          <li><strong>Trend Direction:</strong> Rising, falling, or stable demand</li>
          <li><strong>Seasonality Factor:</strong> Seasonal impact on sales</li>
          <li><strong>Restock Recommendation:</strong> When and how much to reorder</li>
        </ul>
      </div>

      <h4>Best Practices</h4>
      <ul>
        <li>Focus on forecasts with confidence scores above 70%</li>
        <li>Review weekly trends to identify pattern changes</li>
        <li>Use forecasts to optimize route scheduling</li>
        <li>Monitor accuracy and retrain models monthly</li>
      </ul>

      <h4>Common Use Cases</h4>
      <ul>
        <li><strong>Inventory Planning:</strong> Determine optimal stock levels</li>
        <li><strong>Route Optimization:</strong> Prioritize machines needing restocking</li>
        <li><strong>Product Mix:</strong> Identify bestsellers and underperformers</li>
        <li><strong>Capacity Planning:</strong> Plan slot allocation for new products</li>
      </ul>

      <h3>2. Maintenance Prediction</h3>
      <p>Predictive maintenance uses machine data and usage patterns to forecast when equipment will need service.</p>

      <h4>Machine Health Indicators</h4>
      <ul>
        <li><strong>Usage Intensity:</strong> High-traffic machines wear faster</li>
        <li><strong>Age & Installation Date:</strong> Older machines need more frequent service</li>
        <li><strong>Error Patterns:</strong> Recurring issues indicate component wear</li>
        <li><strong>Environmental Factors:</strong> Temperature, humidity, location conditions</li>
      </ul>

      <h4>Prediction Components</h4>
      <div className="bg-slate-50 p-4 rounded-lg my-4">
        <h5 className="font-semibold mb-2">Component Risk Assessment</h5>
        <ul className="text-sm space-y-1">
          <li><strong>Coin Mechanism:</strong> Jam risk and wear indicators</li>
          <li><strong>Bill Validator:</strong> Acceptance rate degradation</li>
          <li><strong>Cooling System:</strong> Temperature stability and energy efficiency</li>
          <li><strong>Vend Motors:</strong> Mechanical wear and failure prediction</li>
          <li><strong>Display/Interface:</strong> User interaction component health</li>
        </ul>
      </div>

      <h4>Maintenance Scheduling</h4>
      <ul>
        <li><strong>Preventive Maintenance:</strong> Schedule service before failures occur</li>
        <li><strong>Component Replacement:</strong> Plan parts inventory and replacement cycles</li>
        <li><strong>Route Integration:</strong> Combine maintenance with restocking visits</li>
        <li><strong>Priority Ranking:</strong> Focus on highest-risk machines first</li>
      </ul>

      <h3>3. Smart Pricing Engine</h3>
      <p>AI-powered pricing optimization analyzes market conditions, demand elasticity, and competition to recommend optimal prices.</p>

      <h4>Pricing Factors</h4>
      <ul>
        <li><strong>Demand Elasticity:</strong> How price changes affect sales volume</li>
        <li><strong>Location Demographics:</strong> Customer spending patterns by location type</li>
        <li><strong>Competition Analysis:</strong> Nearby vending and retail pricing</li>
        <li><strong>Product Margins:</strong> Cost analysis and profit optimization</li>
        <li><strong>Seasonal Demand:</strong> Adjust prices based on seasonal preferences</li>
      </ul>

      <h4>Price Optimization Strategies</h4>
      <div className="bg-slate-50 p-4 rounded-lg my-4">
        <h5 className="font-semibold mb-2">Dynamic Pricing Approaches</h5>
        <ul className="text-sm space-y-1">
          <li><strong>Premium Pricing:</strong> Higher prices for convenience locations</li>
          <li><strong>Volume Discounting:</strong> Lower margins for high-volume products</li>
          <li><strong>Time-Based Pricing:</strong> Peak vs. off-peak pricing strategies</li>
          <li><strong>Bundle Pricing:</strong> Promote complementary products together</li>
        </ul>
      </div>

      <h4>Implementation Process</h4>
      <ol>
        <li><strong>Generate Recommendations:</strong> AI suggests price changes</li>
        <li><strong>Review Impact Analysis:</strong> Assess profit and volume effects</li>
        <li><strong>A/B Testing:</strong> Test price changes on select machines</li>
        <li><strong>Monitor Results:</strong> Track sales impact and customer response</li>
        <li><strong>Scale Successful Changes:</strong> Apply proven optimizations fleet-wide</li>
      </ol>

      <h3>4. Advanced Analytics</h3>
      <p>Beyond basic forecasting, the AI system provides advanced analytical insights.</p>

      <h4>Product Affinity Analysis</h4>
      <ul>
        <li>Identifies frequently co-purchased items</li>
        <li>Suggests product placement optimization</li>
        <li>Enables bundle promotion strategies</li>
        <li>Improves inventory allocation efficiency</li>
      </ul>

      <h4>Location Performance Analysis</h4>
      <ul>
        <li>Ranks locations by profitability and volume</li>
        <li>Identifies expansion opportunities</li>
        <li>Suggests product mix optimization by location</li>
        <li>Analyzes customer behavior patterns</li>
      </ul>

      <h4>Anomaly Detection</h4>
      <ul>
        <li>Flags unusual sales patterns or drops</li>
        <li>Detects potential machine malfunctions</li>
        <li>Identifies inventory discrepancies</li>
        <li>Alerts to possible security issues</li>
      </ul>

      <h3>5. Data Quality & Model Accuracy</h3>
      <p>AI effectiveness depends on data quality and regular model updates.</p>

      <h4>Data Requirements</h4>
      <ul>
        <li><strong>Completeness:</strong> All transactions properly recorded</li>
        <li><strong>Consistency:</strong> Standardized product codes and machine IDs</li>
        <li><strong>Timeliness:</strong> Regular data synchronization</li>
        <li><strong>Accuracy:</strong> Correct pricing and inventory information</li>
      </ul>

      <h4>Model Maintenance</h4>
      <ul>
        <li><strong>Monthly Retraining:</strong> Update models with recent data</li>
        <li><strong>Accuracy Monitoring:</strong> Track prediction vs. actual performance</li>
        <li><strong>Seasonal Adjustments:</strong> Account for changing patterns</li>
        <li><strong>Feature Engineering:</strong> Incorporate new data sources</li>
      </ul>

      <h3>6. Interpreting AI Insights</h3>
      <p>Understanding AI recommendations is crucial for effective decision-making.</p>

      <h4>Confidence Levels</h4>
      <div className="bg-slate-50 p-4 rounded-lg my-4">
        <h5 className="font-semibold mb-2">Confidence Score Guide</h5>
        <ul className="text-sm space-y-1">
          <li><Badge className="bg-green-100 text-green-800 mr-2">90-100%</Badge>Very High - Act on recommendations</li>
          <li><Badge className="bg-blue-100 text-blue-800 mr-2">80-89%</Badge>High - Generally reliable</li>
          <li><Badge className="bg-yellow-100 text-yellow-800 mr-2">70-79%</Badge>Medium - Use with caution</li>
          <li><Badge className="bg-red-100 text-red-800 mr-2">Below 70%</Badge>Low - Gather more data</li>
        </ul>
      </div>

      <h4>Action Thresholds</h4>
      <ul>
        <li><strong>Immediate Action:</strong> High-confidence, high-impact recommendations</li>
        <li><strong>Monitor Closely:</strong> Medium-confidence predictions</li>
        <li><strong>Investigate Further:</strong> Low-confidence or anomalous results</li>
        <li><strong>Pilot Test:</strong> Significant changes before full implementation</li>
      </ul>

      <h3>7. Troubleshooting & Optimization</h3>

      <h4>Common Issues</h4>
      <ul>
        <li><strong>Low Accuracy:</strong> Insufficient or poor-quality data</li>
        <li><strong>Inconsistent Predictions:</strong> Irregular sales patterns or external disruptions</li>
        <li><strong>Slow Processing:</strong> Large datasets or system resource constraints</li>
        <li><strong>Missing Recommendations:</strong> Insufficient historical data for specific products/locations</li>
      </ul>

      <h4>Performance Optimization</h4>
      <ul>
        <li>Clean and standardize historical data</li>
        <li>Ensure regular data synchronization</li>
        <li>Remove outliers and anomalous transactions</li>
        <li>Segment analysis by location type or product category</li>
        <li>Regular model retraining with fresh data</li>
      </ul>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Pro Tips for AI Success
        </h4>
        <ul className="text-blue-700 mt-2 space-y-1">
          <li>Start with your highest-volume machines for most reliable predictions</li>
          <li>Combine AI insights with local knowledge and business intuition</li>
          <li>Test recommendations on a small scale before full deployment</li>
          <li>Regularly review and adjust based on actual performance</li>
          <li>Use AI insights to identify trends, not just point predictions</li>
        </ul>
      </div>
    </div>
  );
}