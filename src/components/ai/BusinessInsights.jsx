
import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertCircle,
  Target,
  Zap,
  BarChart3,
  DollarSign
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function BusinessInsights({ sales, machines, products, locations, isLoading }) {
  const [insights, setInsights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const analysis = await InvokeLLM({
        prompt: `Analyze this vending machine business data and provide actionable insights:
        
        Sales Data (last 200 transactions): ${JSON.stringify(sales.slice(0, 200))}
        Machines: ${JSON.stringify(machines)}
        Products: ${JSON.stringify(products)}
        Locations: ${JSON.stringify(locations)}
        
        Provide specific, actionable business insights including:
        1. Performance patterns by time/location
        2. Underperforming products or machines
        3. Revenue optimization opportunities
        4. Operational efficiency recommendations
        5. Market expansion suggestions
        
        Each insight should have a priority level and specific action steps.`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  priority: { type: "string" },
                  potential_impact: { type: "string" },
                  action_steps: { 
                    type: "array", 
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });
      
      setInsights(analysis.insights || []);
    } catch (error) {
      console.error("Error generating insights:", error);
    }
    setIsGenerating(false);
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'revenue': return DollarSign;
      case 'operations': return Target;
      case 'performance': return BarChart3;
      case 'optimization': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return "bg-red-100 text-red-800 border-red-200";
      case 'medium': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'low': return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">AI Business Intelligence</h3>
              <p className="text-sm text-slate-600">
                Get AI-powered insights and recommendations to grow your business
              </p>
            </div>
            <Button 
              onClick={generateInsights}
              disabled={isGenerating || sales.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      {isGenerating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Insights Generated Yet</h3>
            <p className="text-slate-500 mb-6">
              Click "Generate Insights" to get AI-powered business recommendations based on your data
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => {
            const CategoryIcon = getCategoryIcon(insight.category);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-purple-50">
                          <CategoryIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-900">
                            {insight.title}
                          </CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getPriorityColor(insight.priority)}>
                              {insight.priority} Priority
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {insight.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {insight.description}
                    </p>
                    
                    {insight.potential_impact && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-800 text-sm font-medium">
                          💡 Potential Impact: {insight.potential_impact}
                        </p>
                      </div>
                    )}
                    
                    {insight.action_steps && insight.action_steps.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-2">Action Steps:</h4>
                        <ul className="space-y-1">
                          {insight.action_steps.slice(0, 3).map((step, stepIndex) => (
                            <li key={stepIndex} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-purple-600 font-bold">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
