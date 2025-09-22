import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Map, TrendingUp } from 'lucide-react';
import LocationIntelligenceHub from '../components/intelligence/LocationIntelligenceHub';

export default function Intelligence() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              Location Intelligence
            </h1>
            <p className="text-slate-600 mt-2">
              Data-driven insights to optimize location performance and strategy.
            </p>
          </div>
        </div>

        <Tabs defaultValue="hub" className="w-full">
          <TabsList>
            <TabsTrigger value="hub">
              <TrendingUp className="w-4 h-4 mr-2" />
              Intelligence Hub
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hub" className="mt-6">
            <LocationIntelligenceHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}