
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, AlertTriangle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const severityColors = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-orange-100 text-orange-800",
  Low: "bg-yellow-100 text-yellow-800",
};

export default function AnomalyDetector({ anomalies = [], machines = [], isLoading, onGenerate }) {

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Sales Anomaly Detection</h3>
        <p className="text-slate-500 mb-6">
          Automatically detect unusual sales patterns that need your attention.
        </p>
        <Button onClick={onGenerate}>
          <Sparkles className="w-4 h-4 mr-2" />
          Scan for Anomalies
        </Button>
      </div>
    );
  }

  return (
    <div>
      <CardHeader className="px-0 mb-4">
        <CardTitle>Sales Anomaly Detection</CardTitle>
        <CardDescription>Unusual events in your sales data that require attention.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        {anomalies.map((anomaly, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {anomaly.title}
                  </CardTitle>
                  <Badge className={severityColors[anomaly.severity] || "bg-slate-100 text-slate-800"}>
                    {anomaly.severity} Priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">{anomaly.description}</p>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Suggested Actions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    {anomaly.action_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
