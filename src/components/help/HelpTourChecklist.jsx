import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { useHelpTour } from './useHelpTour';
import { tours } from './content/tours';

export default function HelpTourChecklist({ onStartTour }) {
  const { completedTours, resetTour } = useHelpTour();
  
  const allTourIds = Object.keys(tours);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guided Tours</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-4">
          Get familiar with key features by taking these short, interactive tours.
        </p>
        <div className="space-y-3">
          {allTourIds.map(tourId => {
            const tour = tours[tourId];
            const isCompleted = completedTours.includes(tourId);
            
            return (
              <div key={tour.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <h4 className="font-medium text-slate-900">{tour.title}</h4>
                    <p className="text-sm text-slate-500">{tour.description}</p>
                  </div>
                </div>
                <Button 
                  variant={isCompleted ? "outline" : "default"} 
                  size="sm"
                  onClick={() => onStartTour(tour.id)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {isCompleted ? "Restart Tour" : "Start Tour"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}