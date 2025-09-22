
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Camera, CheckSquare, X, 
  AlertTriangle, Wrench, Clock 
} from 'lucide-react';
import { toast } from 'sonner';

export default function TicketWorkflow({ ticket, machine, onClose, onUpdate }) {
  const [workData, setWorkData] = useState({
    work_started: ticket.status === 'in_progress',
    diagnosis: '',
    actions_taken: '',
    parts_needed: [],
    follow_up_required: false,
    estimated_completion: '',
    photos: []
  });

  const diagnoseIssue = () => {
    // Simulate diagnosis based on error codes or symptoms
    const commonDiagnoses = [
      'Coin mechanism jam - requires cleaning',
      'Bill validator error - firmware update needed',
      'Cooling system fault - compressor replacement',
      'Vend motor failure - motor replacement required',
      'Display malfunction - screen replacement'
    ];
    
    const randomDiagnosis = commonDiagnoses[Math.floor(Math.random() * commonDiagnoses.length)];
    setWorkData(prev => ({ ...prev, diagnosis: randomDiagnosis }));
    toast.success('Diagnosis added');
  };

  const takePhoto = () => {
    // Simulate taking a photo
    const newPhoto = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'diagnostic'
    };
    
    setWorkData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
    
    toast.success('Photo captured');
  };

  const handleSave = () => {
    const updateData = {
      diagnosis: workData.diagnosis,
      actions_taken: workData.actions_taken,
      diagnostic_photos: workData.photos.map(p => p.id),
      work_progress_updated: new Date().toISOString()
    };

    onUpdate(ticket.id, updateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Work Progress
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto">
          {/* Ticket Info */}
          <Card className="bg-slate-50">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-sm text-slate-600">{ticket.category}</p>
                </div>
                <Badge>{ticket.priority}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Diagnosis */}
          <div>
            <Label>Diagnosis</Label>
            <div className="flex gap-2 mt-1">
              <Button 
                onClick={diagnoseIssue}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Auto Diagnose
              </Button>
              <Button 
                onClick={takePhoto}
                variant="outline" 
                size="sm"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Describe the issue diagnosis..."
              value={workData.diagnosis}
              onChange={(e) => setWorkData(prev => ({ 
                ...prev, diagnosis: e.target.value 
              }))}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Actions Taken */}
          <div>
            <Label>Actions Taken</Label>
            <Textarea
              placeholder="What have you done to fix this issue?"
              value={workData.actions_taken}
              onChange={(e) => setWorkData(prev => ({ 
                ...prev, actions_taken: e.target.value 
              }))}
              className="mt-1"
              rows={4}
            />
          </div>

          {/* Photos */}
          {workData.photos.length > 0 && (
            <div>
              <Label>Diagnostic Photos</Label>
              <div className="flex gap-2 mt-1">
                {workData.photos.map(photo => (
                  <Badge key={photo.id} variant="outline">
                    Photo {photo.id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Common Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setWorkData(prev => ({ 
                ...prev, 
                actions_taken: prev.actions_taken + '\n- Cleaned coin mechanism' 
              }))}
            >
              <Wrench className="w-4 h-4 mr-1" />
              Clean Mech
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setWorkData(prev => ({ 
                ...prev, 
                actions_taken: prev.actions_taken + '\n- Restarted system' 
              }))}
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Restart
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <CheckSquare className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
