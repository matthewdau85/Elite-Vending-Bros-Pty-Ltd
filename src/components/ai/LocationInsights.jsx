
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const InsightCard = ({ title, icon: Icon, data, locationKey, reasonKey, itemClassName }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {(data || []).map((item, index) => (
        <div key={index} className={`p-3 rounded-lg ${itemClassName}`}>
          <p className="font-semibold">{item[locationKey]}</p>
          <p className="text-sm text-slate-600">{item[reasonKey]}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default function LocationInsights({ insights, locations = [], isLoading, onGenerate }) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Location Performance & Opportunity</h3>
        <p className="text-slate-500 mb-6">
          Analyze top/bottom locations and identify new expansion opportunities.
        </p>
        <Button onClick={onGenerate}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Location Insights
        </Button>
      </div>
    );
  }
  
  return (
    <div>
       <CardHeader className="px-0 mb-4">
        <CardTitle>Location Performance & Opportunity Analysis</CardTitle>
        <CardDescription>Identify your strongest and weakest markets and discover new growth areas.</CardDescription>
      </CardHeader>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <InsightCard 
          title="Top Performers" 
          icon={TrendingUp} 
          data={insights.top_locations}
          locationKey="location_name"
          reasonKey="reason"
          itemClassName="bg-green-50 border border-green-200"
        />
        <InsightCard 
          title="Underperformers" 
          icon={TrendingDown} 
          data={insights.bottom_locations}
          locationKey="location_name"
          reasonKey="reason"
          itemClassName="bg-red-50 border border-red-200"
        />
        <InsightCard 
          title="New Opportunities" 
          icon={MapPin} 
          data={insights.new_location_suggestions}
          locationKey="address"
          reasonKey="reason"
          itemClassName="bg-blue-50 border border-blue-200"
        />
      </motion.div>
    </div>
  );
}
