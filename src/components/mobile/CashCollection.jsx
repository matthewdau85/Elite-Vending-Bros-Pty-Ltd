import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, Calculator, Camera, AlertTriangle, 
  Check, X 
} from 'lucide-react';
import { toast } from 'sonner';

export default function CashCollection({ visit, machine, onClose, onSave }) {
  const [cashData, setCashData] = useState({
    cash_collected_cents: 0,
    coin_amount_cents: 0,
    note_amount_cents: 0,
    meter_reading: '',
    variance_reason: '',
    photos: []
  });

  const handleInputChange = (field, value) => {
    setCashData(prev => ({
      ...prev,
      [field]: field.includes('cents') ? Math.round(parseFloat(value) * 100) || 0 : value
    }));
  };

  const calculateTotal = () => {
    return cashData.coin_amount_cents + cashData.note_amount_cents;
  };

  const getVariance = () => {
    const total = calculateTotal();
    const expected = parseFloat(cashData.meter_reading) * 100 || 0;
    return total - expected;
  };

  const hasVariance = () => {
    const variance = Math.abs(getVariance());
    return variance > 500; // More than $5 variance
  };

  const takePhoto = () => {
    // In a real implementation, this would open the camera
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Handle camera stream
          toast.success('Photo feature would activate camera');
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(error => {
          toast.error('Camera access denied');
        });
    } else {
      toast.error('Camera not available');
    }
  };

  const handleSave = () => {
    if (hasVariance() && !cashData.variance_reason.trim()) {
      toast.error('Please explain the cash variance');
      return;
    }

    const saveData = {
      cash_collected_cents: calculateTotal(),
      cash_breakdown: {
        coins: cashData.coin_amount_cents,
        notes: cashData.note_amount_cents
      },
      meter_reading: cashData.meter_reading,
      variance_cents: getVariance(),
      variance_reason: cashData.variance_reason || null,
      cash_collection_photos: cashData.photos,
      cash_collected_at: new Date().toISOString()
    };

    onSave(saveData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cash Collection
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto">
          {/* Meter Reading */}
          <div>
            <Label htmlFor="meter">Cash Meter Reading ($)</Label>
            <Input
              id="meter"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cashData.meter_reading}
              onChange={(e) => handleInputChange('meter_reading', e.target.value)}
            />
          </div>

          {/* Cash Collection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coins">Coins ($)</Label>
              <Input
                id="coins"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashData.coin_amount_cents / 100}
                onChange={(e) => handleInputChange('coin_amount_cents', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes ($)</Label>
              <Input
                id="notes"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashData.note_amount_cents / 100}
                onChange={(e) => handleInputChange('note_amount_cents', e.target.value)}
              />
            </div>
          </div>

          {/* Total and Variance */}
          <Card className="bg-slate-50">
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between">
                <span>Total Collected:</span>
                <span className="font-medium">
                  ${(calculateTotal() / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expected:</span>
                <span>
                  ${(parseFloat(cashData.meter_reading) || 0).toFixed(2)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className={hasVariance() ? 'text-orange-600 font-medium' : ''}>
                  Variance:
                </span>
                <span className={`font-medium ${
                  getVariance() > 0 ? 'text-green-600' : 
                  getVariance() < 0 ? 'text-red-600' : ''
                }`}>
                  ${(getVariance() / 100).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Variance Reason */}
          {hasVariance() && (
            <div>
              <Label htmlFor="variance-reason">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Explain Variance
                </div>
              </Label>
              <Textarea
                id="variance-reason"
                placeholder="Why does the cash collected differ from the meter reading?"
                value={cashData.variance_reason}
                onChange={(e) => handleInputChange('variance_reason', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          )}

          {/* Photo Button */}
          <Button
            onClick={takePhoto}
            variant="outline"
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo of Cash
          </Button>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Save Collection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}