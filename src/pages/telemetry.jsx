import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Upload, Download, AlertTriangle, CheckCircle2, 
  Clock, Zap, Database, FileText, Settings
} from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Import entities
import { TelemetryIngestJob } from '@/api/entities';
import { DeadLetterQueue } from '@/api/entities';
import { MachineRegistry } from '@/api/entities';
import { TelemetryReading } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { processTelemetryFile } from '@/api/functions';
import { exportTelemetryData } from '@/api/functions';

export default function TelemetryPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [ingestJobs, setIngestJobs] = useState([]);
  const [deadLetterQueue, setDeadLetterQueue] = useState([]);
  const [machineRegistry, setMachineRegistry] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadTelemetryData();
  }, []);

  const loadTelemetryData = async () => {
    try {
      const [jobs, dlq, registry, readings] = await Promise.all([
        TelemetryIngestJob.list('-started_at', 50),
        DeadLetterQueue.filter({ status: 'failed' }, '-failed_at', 25),
        MachineRegistry.list(),
        TelemetryReading.list('-ingested_at', 100)
      ]);
      
      setIngestJobs(jobs);
      setDeadLetterQueue(dlq);
      setMachineRegistry(registry);
      setRecentReadings(readings);
    } catch (error) {
      console.error('Error loading telemetry data:', error);
      toast.error('Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      const machineId = prompt('Enter machine ID:');
      const format = prompt('Enter file format (dex, eva-dts):')?.toLowerCase();
      
      if (!machineId || !format) {
        toast.error('Machine ID and format are required');
        return;
      }
      
      const response = await processTelemetryFile({
        file_url,
        machine_id: machineId,
        format
      });
      
      if (response.data?.success) {
        toast.success(`File processed successfully: ${response.data.processed} records processed`);
        loadTelemetryData();
      } else {
        toast.error(`Processing failed: ${response.data?.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('File upload failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const startDate = prompt('Start date (YYYY-MM-DD):');
      const endDate = prompt('End date (YYYY-MM-DD):');
      
      if (!startDate || !endDate) {
        toast.error('Start and end dates are required');
        return;
      }
      
      const response = await exportTelemetryData({
        export_format: format,
        start_date: `${startDate}T00:00:00Z`,
        end_date: `${endDate}T23:59:59Z`
      });
      
      if (format === 'parquet') {
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemetry_export_${startDate}_${endDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `telemetry_export_${startDate}_${endDate}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      toast.success(`Export completed in ${format.toUpperCase()} format`);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Telemetry Ingestion Service
          </h1>
          <p className="text-slate-600 mt-2">
            Monitor data ingestion, process telemetry files, and export machine data.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitor">
              <Database className="w-4 h-4 mr-2" />
              Ingest Monitor
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Data Export
            </TabsTrigger>
            <TabsTrigger value="registry">
              <Settings className="w-4 h-4 mr-2" />
              Machine Registry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="mt-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Active Jobs</p>
                        <p className="text-2xl font-bold">
                          {ingestJobs.filter(j => j.status === 'processing').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Failed Messages</p>
                        <p className="text-2xl font-bold text-red-600">
                          {deadLetterQueue.length}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Recent Readings</p>
                        <p className="text-2xl font-bold">
                          {recentReadings.length}
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Registered Machines</p>
                        <p className="text-2xl font-bold">
                          {machineRegistry.filter(m => m.status === 'active').length}
                        </p>
                      </div>
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Ingestion Jobs</CardTitle>
                  <CardDescription>
                    Latest telemetry processing jobs and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ingestJobs.slice(0, 10).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                            <h4 className="font-medium">{job.job_type}</h4>
                            <span className="text-sm text-slate-500">
                              {job.source}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            Started: {format(new Date(job.started_at), 'MMM d, HH:mm')}
                            {job.completed_at && (
                              <span> • Completed: {format(new Date(job.completed_at), 'MMM d, HH:mm')}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="text-green-600">{job.records_processed || 0}</span> processed
                          </p>
                          {job.records_failed > 0 && (
                            <p className="text-sm">
                              <span className="text-red-600">{job.records_failed}</span> failed
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {deadLetterQueue.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Failed Messages (Dead Letter Queue)
                    </CardTitle>
                    <CardDescription>
                      Messages that failed processing and need attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {deadLetterQueue.slice(0, 5).map((dlq) => (
                        <div key={dlq.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900">
                              Machine: {dlq.machine_id}
                            </h4>
                            <p className="text-sm text-red-700">{dlq.failure_reason}</p>
                            <p className="text-xs text-red-600">
                              Failed: {format(new Date(dlq.failed_at), 'MMM d, HH:mm')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Replay
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Telemetry Files</CardTitle>
                <CardDescription>
                  Upload DEX, NAMA VDI, or EVA-DTS files for processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Telemetry File</h3>
                    <p className="text-slate-600 mb-4">
                      Supports .DEX, .EVA, .JSON, and .TXT files
                    </p>
                    <Input
                      type="file"
                      accept=".dex,.eva,.json,.txt"
                      onChange={handleFileUpload}
                      disabled={processing}
                      className="max-w-xs mx-auto"
                    />
                  </div>

                  {processing && (
                    <div className="text-center">
                      <LoadingSpinner text="Processing file..." />
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Supported Formats</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li><strong>DEX:</strong> Standard vending machine data exchange format</li>
                      <li><strong>NAMA VDI:</strong> National Automatic Merchandising Association format</li>
                      <li><strong>EVA-DTS:</strong> European Vending Association data transfer standard</li>
                      <li><strong>JSON:</strong> Custom telemetry data in JSON format</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Telemetry Data</CardTitle>
                <CardDescription>
                  Download processed telemetry data in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button
                    variant="outline"
                    onClick={() => handleExport('dex')}
                    className="h-24 flex-col"
                  >
                    <FileText className="w-8 h-8 mb-2" />
                    Export as DEX
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport('csv')}
                    className="h-24 flex-col"
                  >
                    <FileText className="w-8 h-8 mb-2" />
                    Export as CSV
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport('json')}
                    className="h-24 flex-col"
                  >
                    <FileText className="w-8 h-8 mb-2" />
                    Export as JSON
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport('parquet')}
                    className="h-24 flex-col"
                  >
                    <FileText className="w-8 h-8 mb-2" />
                    Export as Parquet
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">Export Features</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Date range filtering</li>
                    <li>• Machine-specific exports</li>
                    <li>• Data type selection (vends, errors, temperatures)</li>
                    <li>• Automatic file compression for large datasets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registry" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Machine Registry</CardTitle>
                <CardDescription>
                  Manage machine mappings and communication protocols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {machineRegistry.map((machine) => (
                    <div key={machine.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={machine.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {machine.status}
                          </Badge>
                          <h4 className="font-medium">{machine.vendor_id}</h4>
                          <span className="text-sm text-slate-500">
                            → {machine.internal_machine_id}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {machine.vendor_name} • {machine.communication_protocol}
                          {machine.last_heartbeat && (
                            <span> • Last seen: {format(new Date(machine.last_heartbeat), 'MMM d, HH:mm')}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Test</Button>
                      </div>
                    </div>
                  ))}
                  
                  {machineRegistry.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Database className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>No machines registered yet</p>
                      <Button className="mt-4">Add Machine</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}