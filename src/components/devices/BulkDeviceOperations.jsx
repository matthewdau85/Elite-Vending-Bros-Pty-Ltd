import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Download, FileText, AlertTriangle, 
  CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Device, DeviceAuditLog } from '@/api/entities';

export default function BulkDeviceOperations({ devices, onDevicesUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [lastOperation, setLastOperation] = useState(null);
  const fileInputRef = useRef(null);

  const handleCSVImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress({ total: 0, processed: 0, errors: [] });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const results = {
        total: lines.length - 1,
        processed: 0,
        created: 0,
        updated: 0,
        errors: []
      };

      // Process devices in batches
      const batchSize = 10;
      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, Math.min(i + batchSize, lines.length));
        
        await Promise.all(batch.map(async (line, index) => {
          try {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const deviceData = {};
            
            headers.forEach((header, idx) => {
              if (values[idx]) {
                deviceData[header] = values[idx];
              }
            });

            // Check if device exists
            const existing = await Device.filter({ device_id: deviceData.device_id });
            
            if (existing.length > 0) {
              await Device.update(existing[0].id, deviceData);
              results.updated++;
            } else {
              await Device.create(deviceData);
              results.created++;
            }
            
            results.processed++;
            
          } catch (error) {
            results.errors.push(`Line ${i + index}: ${error.message}`);
          }
        }));

        setUploadProgress({
          total: results.total,
          processed: results.processed,
          errors: results.errors
        });
      }

      setLastOperation({
        type: 'import',
        timestamp: new Date(),
        ...results
      });

      if (results.errors.length === 0) {
        toast.success(`Import completed: ${results.created} created, ${results.updated} updated`);
      } else {
        toast.warning(`Import completed with ${results.errors.length} errors`);
      }

      onDevicesUpdate();
      
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import CSV: ' + error.message);
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCSVExport = async () => {
    try {
      const csvHeaders = [
        'device_id', 'device_type', 'manufacturer', 'model', 'serial_number',
        'firmware_version', 'status', 'assigned_machine_id', 'assigned_location_id',
        'last_heartbeat', 'battery_level', 'created_date'
      ];

      const csvData = [
        csvHeaders.join(','),
        ...devices.map(device => 
          csvHeaders.map(header => {
            const value = device[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];

      const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `device-inventory-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${devices.length} devices to CSV`);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export CSV: ' + error.message);
    }
  };

  const handleBulkStatusChange = async (newStatus, selectedDevices, reason) => {
    setIsProcessing(true);
    
    try {
      const results = {
        total: selectedDevices.length,
        processed: 0,
        errors: []
      };

      for (const device of selectedDevices) {
        try {
          const oldStatus = device.status;
          
          await Device.update(device.id, { status: newStatus });
          
          // Create audit log
          await DeviceAuditLog.create({
            device_id: device.id,
            action: 'status_changed',
            performed_by: 'system', // TODO: Get current user
            timestamp: new Date().toISOString(),
            old_values: { status: oldStatus },
            new_values: { status: newStatus },
            reason: reason
          });

          results.processed++;
          
        } catch (error) {
          results.errors.push(`${device.device_id}: ${error.message}`);
        }
      }

      setLastOperation({
        type: 'bulk_status_change',
        timestamp: new Date(),
        ...results
      });

      if (results.errors.length === 0) {
        toast.success(`Updated ${results.processed} devices to ${newStatus}`);
      } else {
        toast.warning(`Updated ${results.processed} devices, ${results.errors.length} failed`);
      }

      onDevicesUpdate();
      
    } catch (error) {
      console.error('Bulk operation failed:', error);
      toast.error('Bulk operation failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTemplateCSV = () => {
    const templateHeaders = [
      'device_id', 'device_type', 'manufacturer', 'model', 
      'serial_number', 'firmware_version', 'status'
    ];

    const templateRows = [
      ['DEV001', 'payment_terminal', 'Nayax', 'VPOS Touch', 'SN12345', '2.1.0', 'inventory'],
      ['DEV002', 'telemetry_unit', 'Cantaloupe', 'ePort G9', 'SN12346', '1.5.2', 'inventory']
    ];

    const csvData = [
      templateHeaders.join(','),
      ...templateRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'device-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Import/Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="h-20 flex-col gap-2"
            >
              <Upload className="w-6 h-6" />
              Import CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCSVExport}
              className="h-20 flex-col gap-2"
            >
              <Download className="w-6 h-6" />
              Export CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={generateTemplateCSV}
              className="h-20 flex-col gap-2"
            >
              <FileText className="w-6 h-6" />
              Download Template
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVImport}
            className="hidden"
          />

          {/* Upload Progress */}
          {uploadProgress && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="font-medium">Processing import...</span>
                </div>
                <div className="text-sm text-blue-700">
                  Processed {uploadProgress.processed} of {uploadProgress.total} devices
                </div>
                {uploadProgress.errors.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="destructive">{uploadProgress.errors.length} errors</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Last Operation Results */}
      {lastOperation && (
        <Card>
          <CardHeader>
            <CardTitle>Last Operation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {lastOperation.errors.length === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium capitalize">
                  {lastOperation.type.replace('_', ' ')}
                </span>
                <Badge variant="outline">
                  {lastOperation.timestamp.toLocaleString()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Total</div>
                  <div className="font-medium">{lastOperation.total}</div>
                </div>
                <div>
                  <div className="text-slate-600">Processed</div>
                  <div className="font-medium text-green-600">{lastOperation.processed}</div>
                </div>
                {lastOperation.created !== undefined && (
                  <div>
                    <div className="text-slate-600">Created</div>
                    <div className="font-medium text-blue-600">{lastOperation.created}</div>
                  </div>
                )}
                {lastOperation.updated !== undefined && (
                  <div>
                    <div className="text-slate-600">Updated</div>
                    <div className="font-medium text-blue-600">{lastOperation.updated}</div>
                  </div>
                )}
                <div>
                  <div className="text-slate-600">Errors</div>
                  <div className="font-medium text-red-600">{lastOperation.errors.length}</div>
                </div>
              </div>

              {lastOperation.errors.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-600">
                    View Errors ({lastOperation.errors.length})
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 rounded-md max-h-40 overflow-y-auto">
                    {lastOperation.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 font-mono">
                        {error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>Select devices from the inventory tab to perform bulk operations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}