import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Activity, Upload, Download, AlertTriangle, CheckCircle2,
  Clock, Zap, Database, Settings, RefreshCw, ShieldAlert,
  History, Link2, Repeat, ShieldCheck, Timer, FileText
} from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

// Import entities
import { TelemetryIngestJob } from '@/api/entities';
import { DeadLetterQueue } from '@/api/entities';
import { MachineRegistry } from '@/api/entities';
import { TelemetryReading } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import {
  normalizeTelemetryEvents,
  submitTelemetryBatch,
  fetchTelemetryMonitorSummary,
  replayDeadLetters,
  exportTelemetryPayload
} from '@/api/functions';

const createIdempotencyKey = (prefix = 'telemetry') => {
  const base = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return base.replace(/[^a-zA-Z0-9_\-]/g, '_');
};

const buildDefaultSummary = () => ({
  deviceMappings: {
    mapped: 0,
    unmapped: 0,
    total: 0,
    unmappedDevices: []
  },
  duplicateSuppression: {
    suppressed: 0,
    windowSeconds: 300
  },
  schemaVersions: {
    expected: '',
    lastSeen: '',
    mismatches: 0,
    mismatchedMachines: []
  },
  gapAlerts: [],
  lastEventTimestamps: [],
  retryStats: {
    pending: 0,
    scheduled: 0,
    lastReplayAt: null
  },
  normalizationLagSeconds: null
});

export default function TelemetryPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [ingestJobs, setIngestJobs] = useState([]);
  const [deadLetterQueue, setDeadLetterQueue] = useState([]);
  const [machineRegistry, setMachineRegistry] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [ingestSummary, setIngestSummary] = useState(buildDefaultSummary());
  const [fileNormalizationResult, setFileNormalizationResult] = useState(null);
  const [eventNormalizationResult, setEventNormalizationResult] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [submittingEvents, setSubmittingEvents] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [replayDialogOpen, setReplayDialogOpen] = useState(false);
  const [selectedDeadLetter, setSelectedDeadLetter] = useState(null);
  const [replaying, setReplaying] = useState(false);

  const [fileForm, setFileForm] = useState({
    tenantId: '',
    machineId: '',
    deviceId: '',
    vendor: '',
    ingestionChannel: 'portal_upload',
    schemaVersion: '2024-01',
    format: 'dex',
    dedupeWindow: 300,
    submittedBy: '',
    metadata: '',
    idempotencyKey: createIdempotencyKey('file')
  });

  const [eventForm, setEventForm] = useState({
    tenantId: '',
    machineId: '',
    deviceId: '',
    ingestionChannel: 'portal_api',
    schemaVersion: '2024-01',
    submittedBy: '',
    metadata: '',
    eventsJson: '',
    idempotencyKey: createIdempotencyKey('event')
  });

  const [exportForm, setExportForm] = useState({
    tenantId: '',
    startDate: '',
    endDate: '',
    machineId: '',
    dataTypes: ['vend', 'errors'],
    format: 'jsonl',
    includeSchema: true,
    idempotencyKey: createIdempotencyKey('export')
  });

  const [replayForm, setReplayForm] = useState({
    tenantId: '',
    idempotencyKey: createIdempotencyKey('replay'),
    maxRetries: 1,
    note: ''
  });

  useEffect(() => {
    loadTelemetryData();
  }, []);

  const loadTelemetryData = async () => {
    try {
      const [jobs, dlq, registry, readings, summaryResponse] = await Promise.all([
        TelemetryIngestJob.list('-started_at', 50),
        DeadLetterQueue.filter({ status: 'failed' }, '-failed_at', 25),
        MachineRegistry.list(),
        TelemetryReading.list('-ingested_at', 100),
        fetchTelemetryMonitorSummary()
      ]);

      setIngestJobs(jobs);
      setDeadLetterQueue(dlq);
      setMachineRegistry(registry);
      setRecentReadings(readings);

      const defaultSummary = buildDefaultSummary();
      const summaryData = summaryResponse?.data || summaryResponse || {};
      setIngestSummary({
        deviceMappings: {
          ...defaultSummary.deviceMappings,
          ...(summaryData.deviceMappings || {})
        },
        duplicateSuppression: {
          ...defaultSummary.duplicateSuppression,
          ...(summaryData.duplicateSuppression || {})
        },
        schemaVersions: {
          ...defaultSummary.schemaVersions,
          ...(summaryData.schemaVersions || {})
        },
        gapAlerts: summaryData.gapAlerts || defaultSummary.gapAlerts,
        lastEventTimestamps: summaryData.lastEventTimestamps || defaultSummary.lastEventTimestamps,
        retryStats: {
          ...defaultSummary.retryStats,
          ...(summaryData.retryStats || {})
        },
        normalizationLagSeconds: summaryData.normalizationLagSeconds ?? defaultSummary.normalizationLagSeconds
      });
    } catch (error) {
      console.error('Error loading telemetry data:', error);
      toast.error('Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadChange = (event) => {
    const file = event.target.files?.[0];
    setFileUpload(file || null);
  };

  const parseMetadataField = (value) => {
    if (!value || !value.trim()) return undefined;
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error('Metadata must be valid JSON');
    }
  };

  const handleFileIngestSubmit = async (event) => {
    event.preventDefault();
    if (!fileUpload) {
      toast.error('Select a file to upload');
      return;
    }

    if (!fileForm.tenantId || !fileForm.machineId || !fileForm.idempotencyKey) {
      toast.error('Tenant, machine and idempotency key are required');
      return;
    }

    setProcessing(true);
    setFileNormalizationResult(null);

    try {
      const uploadResult = await UploadFile({ file: fileUpload });
      const fileUrl = uploadResult?.file_url || uploadResult?.data?.file_url;

      if (!fileUrl) {
        throw new Error('Upload response missing file URL');
      }

      const metadata = parseMetadataField(fileForm.metadata);

      const normalizationPayload = {
        transport: 'file',
        tenant_id: fileForm.tenantId,
        idempotency_key: fileForm.idempotencyKey,
        schema_version: fileForm.schemaVersion,
        format: fileForm.format,
        file_url: fileUrl,
        dedupe_window_seconds: Number(fileForm.dedupeWindow) || 0,
        source: {
          machine_id: fileForm.machineId,
          device_id: fileForm.deviceId || undefined,
          vendor: fileForm.vendor || undefined,
          ingestion_channel: fileForm.ingestionChannel,
          submitted_by: fileForm.submittedBy || undefined
        },
        metadata
      };

      const normalizationResponse = await normalizeTelemetryEvents(normalizationPayload);
      const normalizationData = normalizationResponse?.data || normalizationResponse || {};
      setFileNormalizationResult(normalizationData.summary || normalizationData);

      const normalizedEvents = normalizationData.normalized_events || normalizationData.events;
      if (normalizedEvents && normalizedEvents.length > 0) {
        await submitTelemetryBatch({
          tenant_id: fileForm.tenantId,
          idempotency_key: fileForm.idempotencyKey,
          normalized_events: normalizedEvents,
          source: normalizationPayload.source,
          schema_version: fileForm.schemaVersion,
          dedupe_window_seconds: Number(fileForm.dedupeWindow) || undefined,
          metadata
        });
      }

      toast.success('Telemetry file normalized and queued for ingestion');
      setFileForm((current) => ({
        ...current,
        metadata: '',
        idempotencyKey: createIdempotencyKey('file')
      }));
      setFileUpload(null);
      event.target.reset();
      loadTelemetryData();
    } catch (error) {
      console.error('File ingest error:', error);
      toast.error(error?.message || 'File ingest failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleEventSubmit = async (event) => {
    event.preventDefault();
    if (!eventForm.eventsJson.trim()) {
      toast.error('Add at least one event payload');
      return;
    }

    if (!eventForm.tenantId || !eventForm.machineId || !eventForm.idempotencyKey) {
      toast.error('Tenant, machine and idempotency key are required');
      return;
    }

    let parsedEvents;
    try {
      parsedEvents = JSON.parse(eventForm.eventsJson);
    } catch (error) {
      toast.error('Events JSON must be valid');
      return;
    }

    const normalizationPayload = {
      transport: 'inline',
      tenant_id: eventForm.tenantId,
      idempotency_key: eventForm.idempotencyKey,
      schema_version: eventForm.schemaVersion,
      events: Array.isArray(parsedEvents) ? parsedEvents : [parsedEvents],
      source: {
        machine_id: eventForm.machineId,
        device_id: eventForm.deviceId || undefined,
        ingestion_channel: eventForm.ingestionChannel,
        submitted_by: eventForm.submittedBy || undefined
      },
      metadata: parseMetadataField(eventForm.metadata)
    };

    setSubmittingEvents(true);
    setEventNormalizationResult(null);

    try {
      const normalizationResponse = await normalizeTelemetryEvents(normalizationPayload);
      const normalizationData = normalizationResponse?.data || normalizationResponse || {};
      setEventNormalizationResult(normalizationData.summary || normalizationData);

      const normalizedEvents = normalizationData.normalized_events || normalizationData.events;
      if (normalizedEvents && normalizedEvents.length > 0) {
        await submitTelemetryBatch({
          tenant_id: eventForm.tenantId,
          idempotency_key: eventForm.idempotencyKey,
          normalized_events: normalizedEvents,
          source: normalizationPayload.source,
          schema_version: eventForm.schemaVersion,
          metadata: normalizationPayload.metadata
        });
      }

      toast.success('Telemetry events normalized and submitted');
      setEventForm((current) => ({
        ...current,
        metadata: '',
        eventsJson: '',
        idempotencyKey: createIdempotencyKey('event')
      }));
      loadTelemetryData();
    } catch (error) {
      console.error('Event ingest error:', error);
      toast.error(error?.message || 'Event submission failed');
    } finally {
      setSubmittingEvents(false);
    }
  };

  const handleExportSubmit = async (event) => {
    event.preventDefault();

    if (!exportForm.tenantId || !exportForm.startDate || !exportForm.endDate) {
      toast.error('Tenant and date range are required');
      return;
    }

    setExporting(true);
    setExportResult(null);

    try {
      const payload = {
        tenant_id: exportForm.tenantId,
        idempotency_key: exportForm.idempotencyKey,
        range: {
          start: `${exportForm.startDate}T00:00:00Z`,
          end: `${exportForm.endDate}T23:59:59Z`
        },
        machine_id: exportForm.machineId || undefined,
        data_types: exportForm.dataTypes,
        format: exportForm.format,
        include_schema: exportForm.includeSchema,
        validation: {
          schema: 'TelemetryEvent',
          strict: true
        }
      };

      const response = await exportTelemetryPayload(payload);
      const exportData = response?.data || response || {};

      if (exportData.download_url) {
        window.open(exportData.download_url, '_blank');
      } else if (exportData.file_name && exportData.content) {
        const mimeType = exportForm.format === 'parquet' ? 'application/octet-stream' : 'application/json';
        const blob = new Blob([
          exportForm.format === 'jsonl'
            ? (Array.isArray(exportData.content) ? exportData.content.join('\n') : exportData.content)
            : exportData.content
        ], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = exportData.file_name;
        anchor.click();
        URL.revokeObjectURL(url);
      }

      setExportResult(exportData.summary || exportData);
      toast.success(`Export job created (${exportForm.format.toUpperCase()})`);
      setExportForm((current) => ({
        ...current,
        idempotencyKey: createIdempotencyKey('export')
      }));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const openReplayDialog = (message) => {
    setSelectedDeadLetter(message);
    setReplayForm((current) => ({
      ...current,
      tenantId: message?.tenant_id || '',
      idempotencyKey: createIdempotencyKey('replay'),
      note: ''
    }));
    setReplayDialogOpen(true);
  };

  const handleReplaySubmit = async (event) => {
    event.preventDefault();
    if (!selectedDeadLetter) return;

    if (!replayForm.tenantId) {
      toast.error('Tenant scope is required to replay');
      return;
    }

    setReplaying(true);
    try {
      const payload = {
        tenant_id: replayForm.tenantId,
        idempotency_key: replayForm.idempotencyKey,
        message_ids: [selectedDeadLetter.id],
        max_retries: Number(replayForm.maxRetries) || 1,
        note: replayForm.note || undefined
      };

      await replayDeadLetters(payload);
      toast.success('Replay scheduled');
      setReplayDialogOpen(false);
      setSelectedDeadLetter(null);
      setReplayForm((current) => ({
        ...current,
        idempotencyKey: createIdempotencyKey('replay')
      }));
      loadTelemetryData();
    } catch (error) {
      console.error('Replay error:', error);
      toast.error(error?.message || 'Failed to schedule replay');
    } finally {
      setReplaying(false);
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

  const mappingCoverage = ingestSummary.deviceMappings.total
    ? Math.round((ingestSummary.deviceMappings.mapped / ingestSummary.deviceMappings.total) * 100)
    : 0;

  const normalizationLagDisplay = ingestSummary.normalizationLagSeconds != null
    ? formatDistanceToNow(new Date(Date.now() - ingestSummary.normalizationLagSeconds * 1000), { addSuffix: true })
    : '—';

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
              <Card className="xl:col-span-1">
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

              <Card className="xl:col-span-1">
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

              <Card className="xl:col-span-1">
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

              <Card className="xl:col-span-1">
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

              <Card className="xl:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Duplicates Suppressed</p>
                      <p className="text-2xl font-bold">
                        {ingestSummary.duplicateSuppression.suppressed}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {ingestSummary.duplicateSuppression.windowSeconds}s window
                      </p>
                    </div>
                    <RefreshCw className="w-8 h-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="xl:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Schema Mismatches</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {ingestSummary.schemaVersions.mismatches}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Expected {ingestSummary.schemaVersions.expected || '—'}
                      </p>
                    </div>
                    <ShieldAlert className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Mapping Coverage</p>
                      <p className="text-2xl font-bold">{mappingCoverage}%</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {ingestSummary.deviceMappings.mapped} mapped / {ingestSummary.deviceMappings.total} devices
                      </p>
                    </div>
                    <Link2 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Retry Queue</p>
                      <p className="text-2xl font-bold">
                        {ingestSummary.retryStats.pending + ingestSummary.retryStats.scheduled}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {ingestSummary.retryStats.pending} pending • {ingestSummary.retryStats.scheduled} scheduled
                      </p>
                    </div>
                    <Repeat className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Normalization Lag</p>
                      <p className="text-2xl font-bold">
                        {ingestSummary.normalizationLagSeconds != null
                          ? `${Math.round(ingestSummary.normalizationLagSeconds / 60)}m`
                          : '—'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Last catch-up {normalizationLagDisplay}</p>
                    </div>
                    <Timer className="w-8 h-8 text-slate-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-600" />
                    Latest Event Activity
                  </CardTitle>
                  <CardDescription>Last normalized events per machine</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ingestSummary.lastEventTimestamps.length === 0 && (
                      <p className="text-sm text-slate-500">No events processed in the recent window.</p>
                    )}

                    {ingestSummary.lastEventTimestamps.slice(0, 6).map((item) => (
                      <div key={item.machineId} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-slate-800">Machine {item.machineId}</p>
                          <p className="text-xs text-slate-500">
                            {item.deviceId ? `Device ${item.deviceId} • ` : ''}
                            {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : 'Unknown'}
                          </p>
                        </div>
                        <Badge className={item.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                          {item.status || 'unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Gap Detection Alerts
                  </CardTitle>
                  <CardDescription>Machines with missing or stale telemetry</CardDescription>
                </CardHeader>
                <CardContent>
                  {ingestSummary.gapAlerts.length === 0 ? (
                    <p className="text-sm text-slate-500">No gaps detected across monitored machines.</p>
                  ) : (
                    <div className="space-y-3">
                      {ingestSummary.gapAlerts.map((alert) => (
                        <div key={`${alert.machineId}-${alert.lastEventAt}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-amber-900">Machine {alert.machineId}</p>
                              <p className="text-xs text-amber-800">
                                Last event {alert.lastEventAt ? formatDistanceToNow(new Date(alert.lastEventAt), { addSuffix: true }) : 'unknown'}
                              </p>
                            </div>
                            <Badge className="bg-amber-200 text-amber-900">
                              {alert.severity?.toUpperCase() || 'GAP'}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-amber-900">
                            {alert.gapDurationMinutes ? `${alert.gapDurationMinutes} minutes without events` : 'Telemetry gap detected'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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
                          <Button variant="outline" size="sm" onClick={() => openReplayDialog(dlq)}>
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
                <form className="space-y-6" onSubmit={handleFileIngestSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-tenant">Tenant ID</Label>
                      <Input
                        id="file-tenant"
                        value={fileForm.tenantId}
                        onChange={(event) => setFileForm((current) => ({ ...current, tenantId: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-machine">Machine ID</Label>
                      <Input
                        id="file-machine"
                        value={fileForm.machineId}
                        onChange={(event) => setFileForm((current) => ({ ...current, machineId: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-device">Device ID</Label>
                      <Input
                        id="file-device"
                        value={fileForm.deviceId}
                        onChange={(event) => setFileForm((current) => ({ ...current, deviceId: event.target.value }))}
                        placeholder="Optional external device identifier"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-vendor">Source Vendor</Label>
                      <Input
                        id="file-vendor"
                        value={fileForm.vendor}
                        onChange={(event) => setFileForm((current) => ({ ...current, vendor: event.target.value }))}
                        placeholder="Nayax, Televend, custom, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-schema">Schema Version</Label>
                      <Input
                        id="file-schema"
                        value={fileForm.schemaVersion}
                        onChange={(event) => setFileForm((current) => ({ ...current, schemaVersion: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>File Format</Label>
                      <Select
                        value={fileForm.format}
                        onValueChange={(value) => setFileForm((current) => ({ ...current, format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dex">DEX</SelectItem>
                          <SelectItem value="eva-dts">EVA-DTS</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ingestion Channel</Label>
                      <Select
                        value={fileForm.ingestionChannel}
                        onValueChange={(value) => setFileForm((current) => ({ ...current, ingestionChannel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portal_upload">Portal upload</SelectItem>
                          <SelectItem value="sftp_drop">SFTP drop</SelectItem>
                          <SelectItem value="iot_gateway">IoT gateway</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-submitted">Submitted By</Label>
                      <Input
                        id="file-submitted"
                        value={fileForm.submittedBy}
                        onChange={(event) => setFileForm((current) => ({ ...current, submittedBy: event.target.value }))}
                        placeholder="Operator, automation, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-dedupe">Duplicate Window (seconds)</Label>
                      <Input
                        id="file-dedupe"
                        type="number"
                        min={0}
                        value={fileForm.dedupeWindow}
                        onChange={(event) => setFileForm((current) => ({ ...current, dedupeWindow: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-input">Select File</Label>
                      <Input
                        id="file-input"
                        type="file"
                        accept=".dex,.eva,.json,.txt,.csv"
                        onChange={handleFileUploadChange}
                        disabled={processing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-idempotency">Idempotency Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="file-idempotency"
                          value={fileForm.idempotencyKey}
                          onChange={(event) => setFileForm((current) => ({ ...current, idempotencyKey: event.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFileForm((current) => ({ ...current, idempotencyKey: createIdempotencyKey('file') }))}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-metadata">Source Metadata (JSON)</Label>
                    <Textarea
                      id="file-metadata"
                      value={fileForm.metadata}
                      onChange={(event) => setFileForm((current) => ({ ...current, metadata: event.target.value }))}
                      placeholder='{"siteId":"MEL-01","collection":"daily"}'
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      Files are normalized to the TelemetryEvent schema before ingestion.
                    </div>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Normalizing…' : 'Normalize & Queue'}
                    </Button>
                  </div>
                </form>

                {processing && (
                  <div className="text-center mt-6">
                    <LoadingSpinner text="Processing file..." />
                  </div>
                )}

                {fileNormalizationResult && (
                  <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="font-medium text-green-900">Normalization summary</h4>
                    <p className="text-sm text-green-800 mt-1">
                      {fileNormalizationResult.normalized_count ?? fileNormalizationResult.count ?? fileNormalizationResult?.normalized_events?.length ?? 0} events validated •
                      {' '}
                      {fileNormalizationResult.duplicates_suppressed ?? fileNormalizationResult.duplicatesSuppressed ?? ingestSummary.duplicateSuppression.suppressed} duplicates suppressed
                    </p>
                    {fileNormalizationResult.errors && fileNormalizationResult.errors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                        {fileNormalizationResult.errors.map((error, index) => (
                          <li key={`file-error-${index}`}>{error.message || error}</li>
                        ))}
                      </ul>
                    )}
                    <pre className="mt-3 max-h-64 overflow-auto rounded bg-white/80 p-3 text-xs text-slate-700">
{JSON.stringify(fileNormalizationResult, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Submit Telemetry Events</CardTitle>
                <CardDescription>
                  Paste device payloads to normalize against the TelemetryEvent schema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleEventSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-tenant">Tenant ID</Label>
                      <Input
                        id="event-tenant"
                        value={eventForm.tenantId}
                        onChange={(event) => setEventForm((current) => ({ ...current, tenantId: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-machine">Machine ID</Label>
                      <Input
                        id="event-machine"
                        value={eventForm.machineId}
                        onChange={(event) => setEventForm((current) => ({ ...current, machineId: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-device">Device ID</Label>
                      <Input
                        id="event-device"
                        value={eventForm.deviceId}
                        onChange={(event) => setEventForm((current) => ({ ...current, deviceId: event.target.value }))}
                        placeholder="Optional device serial"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-schema">Schema Version</Label>
                      <Input
                        id="event-schema"
                        value={eventForm.schemaVersion}
                        onChange={(event) => setEventForm((current) => ({ ...current, schemaVersion: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ingestion Channel</Label>
                      <Select
                        value={eventForm.ingestionChannel}
                        onValueChange={(value) => setEventForm((current) => ({ ...current, ingestionChannel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portal_api">Portal API</SelectItem>
                          <SelectItem value="device_callback">Device callback</SelectItem>
                          <SelectItem value="iot_gateway">IoT gateway</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-submitted">Submitted By</Label>
                      <Input
                        id="event-submitted"
                        value={eventForm.submittedBy}
                        onChange={(event) => setEventForm((current) => ({ ...current, submittedBy: event.target.value }))}
                        placeholder="Operator or automation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-metadata">Source Metadata (JSON)</Label>
                    <Textarea
                      id="event-metadata"
                      value={eventForm.metadata}
                      onChange={(event) => setEventForm((current) => ({ ...current, metadata: event.target.value }))}
                      placeholder='{"batchId":"manual-001"}'
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-payload">Events JSON</Label>
                    <Textarea
                      id="event-payload"
                      value={eventForm.eventsJson}
                      onChange={(event) => setEventForm((current) => ({ ...current, eventsJson: event.target.value }))}
                      placeholder='{"type":"vend","timestamp":"2024-01-01T00:00:00Z","amount":4.50}'
                      className="min-h-[200px] font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-idempotency">Idempotency Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="event-idempotency"
                          value={eventForm.idempotencyKey}
                          onChange={(event) => setEventForm((current) => ({ ...current, idempotencyKey: event.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEventForm((current) => ({ ...current, idempotencyKey: createIdempotencyKey('event') }))}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={submittingEvents} className="w-full md:w-auto">
                    {submittingEvents ? 'Normalizing…' : 'Normalize & send'}
                  </Button>
                </form>

                {submittingEvents && (
                  <div className="text-center mt-6">
                    <LoadingSpinner text="Normalizing events..." />
                  </div>
                )}

                {eventNormalizationResult && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="font-medium text-blue-900">Event normalization summary</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {eventNormalizationResult.normalized_count ?? eventNormalizationResult.count ?? eventNormalizationResult?.normalized_events?.length ?? 0} events accepted
                    </p>
                    {eventNormalizationResult.warnings && eventNormalizationResult.warnings.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-amber-700">
                        {eventNormalizationResult.warnings.map((warning, index) => (
                          <li key={`event-warning-${index}`}>{warning.message || warning}</li>
                        ))}
                      </ul>
                    )}
                    <pre className="mt-3 max-h-48 overflow-auto rounded bg-white/80 p-3 text-xs text-slate-700">
{JSON.stringify(eventNormalizationResult, null, 2)}
                    </pre>
                  </div>
                )}
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
                <form className="space-y-6" onSubmit={handleExportSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="export-tenant">Tenant ID</Label>
                      <Input
                        id="export-tenant"
                        value={exportForm.tenantId}
                        onChange={(event) => setExportForm((current) => ({ ...current, tenantId: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-machine">Machine ID</Label>
                      <Input
                        id="export-machine"
                        value={exportForm.machineId}
                        onChange={(event) => setExportForm((current) => ({ ...current, machineId: event.target.value }))}
                        placeholder="Optional machine filter"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="export-start">Start Date</Label>
                      <Input
                        id="export-start"
                        type="date"
                        value={exportForm.startDate}
                        onChange={(event) => setExportForm((current) => ({ ...current, startDate: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-end">End Date</Label>
                      <Input
                        id="export-end"
                        type="date"
                        value={exportForm.endDate}
                        onChange={(event) => setExportForm((current) => ({ ...current, endDate: event.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Data Types</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[{ label: 'Vend events', value: 'vend' }, { label: 'Error codes', value: 'errors' }, { label: 'Temperature', value: 'temperatures' }, { label: 'Energy', value: 'energy' }].map((option) => {
                        const checked = exportForm.dataTypes.includes(option.value);
                        return (
                          <label key={option.value} className="flex items-center gap-3 rounded border p-3">
                            <Checkbox
                              id={`export-type-${option.value}`}
                              checked={checked}
                              onCheckedChange={(value) => {
                                setExportForm((current) => {
                                  const isChecked = Boolean(value);
                                  const next = isChecked
                                    ? Array.from(new Set([...current.dataTypes, option.value]))
                                    : current.dataTypes.filter((type) => type !== option.value);
                                  return { ...current, dataTypes: next };
                                });
                              }}
                            />
                            <span className="text-sm text-slate-700">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <Select
                        value={exportForm.format}
                        onValueChange={(value) => setExportForm((current) => ({ ...current, format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jsonl">JSONL</SelectItem>
                          <SelectItem value="parquet">Parquet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export-idempotency">Idempotency Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="export-idempotency"
                          value={exportForm.idempotencyKey}
                          onChange={(event) => setExportForm((current) => ({ ...current, idempotencyKey: event.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExportForm((current) => ({ ...current, idempotencyKey: createIdempotencyKey('export') }))}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="export-include-schema"
                      checked={exportForm.includeSchema}
                      onCheckedChange={(value) => setExportForm((current) => ({ ...current, includeSchema: Boolean(value) }))}
                    />
                    <div>
                      <Label htmlFor="export-include-schema">Include schema metadata</Label>
                      <p className="text-xs text-slate-500">Validated payloads will include TelemetryEvent schema descriptors.</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={exporting} className="w-full md:w-auto">
                    {exporting ? 'Generating…' : 'Generate export'}
                  </Button>
                </form>

                {exportResult && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="font-medium text-blue-900">Export scheduled</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {exportResult.rows_exported ?? exportResult.count ?? 0} rows queued • Format {exportForm.format.toUpperCase()}
                    </p>
                    {exportResult.download_url && (
                      <Button
                        type="button"
                        className="mt-3"
                        variant="outline"
                        onClick={() => window.open(exportResult.download_url, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />Download export
                      </Button>
                    )}
                    <pre className="mt-3 max-h-48 overflow-auto rounded bg-white/80 p-3 text-xs text-slate-700">
{JSON.stringify(exportResult, null, 2)}
                    </pre>
                  </div>
                )}
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

                  {ingestSummary.deviceMappings.unmappedDevices?.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Unmapped Devices
                      </h4>
                      <p className="text-sm text-slate-500 mb-3">
                        These devices are emitting events but are not yet linked to a machine record.
                      </p>
                      <div className="space-y-2">
                        {ingestSummary.deviceMappings.unmappedDevices.map((device) => (
                          <div key={device.deviceId} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-amber-900">Device {device.deviceId}</p>
                                <p className="text-xs text-amber-700">Last event {device.lastSeen ? formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true }) : 'unknown'}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Map to machine
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={replayDialogOpen} onOpenChange={setReplayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replay failed message</DialogTitle>
            <DialogDescription>
              Requeue the selected payload using a new idempotency key and retry policy.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleReplaySubmit}>
            <div className="space-y-2">
              <Label htmlFor="replay-tenant">Tenant ID</Label>
              <Input
                id="replay-tenant"
                value={replayForm.tenantId}
                onChange={(event) => setReplayForm((current) => ({ ...current, tenantId: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replay-idempotency">Idempotency Key</Label>
              <Input
                id="replay-idempotency"
                value={replayForm.idempotencyKey}
                onChange={(event) => setReplayForm((current) => ({ ...current, idempotencyKey: event.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="replay-max-retries">Max Retries</Label>
                <Input
                  id="replay-max-retries"
                  type="number"
                  min={1}
                  value={replayForm.maxRetries}
                  onChange={(event) => setReplayForm((current) => ({ ...current, maxRetries: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Message ID</Label>
                <Input value={selectedDeadLetter?.id || ''} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="replay-note">Replay Note</Label>
              <Textarea
                id="replay-note"
                placeholder="Document the reason for replaying this payload"
                value={replayForm.note}
                onChange={(event) => setReplayForm((current) => ({ ...current, note: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReplayDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={replaying}>
                {replaying ? 'Scheduling…' : 'Schedule Replay'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}