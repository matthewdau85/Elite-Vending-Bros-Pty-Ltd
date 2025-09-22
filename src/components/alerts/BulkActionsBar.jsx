import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, X, Trash2 } from "lucide-react";

export default function BulkActionsBar({ selectedCount, onAcknowledge, onResolve, onDelete, onClear }) {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} alert{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAcknowledge}
              className="bg-white"
            >
              <Clock className="w-4 h-4 mr-1" />
              Acknowledge All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onResolve}
              className="bg-white text-green-600 hover:text-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Resolve All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="bg-white text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}