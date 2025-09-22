import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, AlertTriangle } from "lucide-react";

export default function MachineHealth({ prediction }) {
  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            Machine Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">No AI prediction data available for this machine.</p>
        </CardContent>
      </Card>
    );
  }

  const healthScore = Math.round((1 - prediction.failure_probability) * 100);
  const healthColor = healthScore > 80 ? 'text-green-600' : healthScore > 50 ? 'text-orange-600' : 'text-red-600';
  const healthBgColor = healthScore > 80 ? 'bg-green-50' : healthScore > 50 ? 'bg-orange-50' : 'bg-red-50';
  const HealthIcon = healthScore > 50 ? ShieldCheck : AlertTriangle;

  return (
    <Card className={`border-0 shadow-md ${healthBgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HealthIcon className={`w-5 h-5 ${healthColor}`} />
            <span>Machine Health</span>
          </div>
          <span className={`text-2xl font-bold ${healthColor}`}>{healthScore}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-2">
            AI model predicts a **{Math.round(prediction.failure_probability * 100)}% failure probability** within the next **{prediction.days_until_failure} days**.
          </p>
        </div>
        
        {prediction.recommended_actions && prediction.recommended_actions.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Recommended Actions:</h4>
            <div className="flex flex-wrap gap-2">
              {prediction.recommended_actions.map((action, index) => (
                <Badge key={index} variant="outline" className="bg-white">{action}</Badge>
              ))}
            </div>
          </div>
        )}

        {prediction.component_risk && Object.keys(prediction.component_risk).length > 0 && (
            <div>
                <h4 className="font-medium text-slate-800 mb-2">Component Risk Analysis:</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(prediction.component_risk).map(([component, risk]) => (
                    <div key={component} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-600">{component.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${risk > 0.7 ? 'bg-red-500' : risk > 0.4 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${risk * 100}%`}}></div>
                            </div>
                            <span className="font-mono text-xs w-8 text-right">{Math.round(risk * 100)}%</span>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}