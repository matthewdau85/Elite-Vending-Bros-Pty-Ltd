import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PaymentTerminal } from '@/api/entities';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ReaderFleet() {
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTerminals = async () => {
    setLoading(true);
    try {
      const data = await PaymentTerminal.list();
      setTerminals(data);
    } catch (error) {
      console.error("Failed to load terminals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerminals();
  }, []);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'unassigned': return <Badge variant="outline">Unassigned</Badge>;
      case 'error': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading terminals..." />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Reader Fleet</CardTitle>
            <CardDescription>Inventory and status of all payment terminals.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadTerminals}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Terminal
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {terminals.map(terminal => (
            <div key={terminal.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{terminal.model} <span className="text-slate-500 font-normal">(S/N: {terminal.serial_number})</span></p>
                <p className="text-sm text-slate-600">
                  Assigned to: {terminal.assigned_machine_id || 'None'} • Firmware: {terminal.firmware_version}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(terminal.status)}
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {terminals.length === 0 && <p className="text-center text-slate-500 py-8">No payment terminals found.</p>}
        </div>
      </CardContent>
    </Card>
  );
}