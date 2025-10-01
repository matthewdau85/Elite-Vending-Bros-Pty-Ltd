import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileDown,
  ShieldCheck,
  ClipboardCheck,
} from 'lucide-react';
import { SettlementBatch } from '@/api/entities';
import LoadingSpinner from '../shared/LoadingSpinner';
import { toast } from 'sonner';
import { processSettlementFile, reconcileSettlementBatch } from '@/api/functions';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettlementExplorer() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [reconciliation, setReconciliation] = useState(null);
  const [exceptionStates, setExceptionStates] = useState({});
  const [approvalForm, setApprovalForm] = useState({
    preparedBy: '',
    reviewedBy: '',
    notes: '',
    autoRelease: true,
  });
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [exporting, setExporting] = useState(null);
  const [reconciliationVersion, setReconciliationVersion] = useState(0);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await SettlementBatch.list('-settlement_date');
      setBatches(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Failed to load settlement batches:', error);
      toast.error('Unable to load settlement batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (batches.length && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

  useEffect(() => {
    if (!selectedBatchId) return;
    const batch = batches.find((item) => item.id === selectedBatchId);
    if (!batch) return;

    let cancelled = false;
    const buildReconciliation = async () => {
      setReconLoading(true);
      try {
        const result = await reconcileSettlementBatch(batch, { toleranceCents: 500 });
        if (cancelled) return;
        setReconciliation(result);
        setExceptionStates((prev) => {
          const next = {};
          result.toleranceAlerts.forEach((alert) => {
            next[alert.id] = prev[alert.id] || 'open';
          });
          return next;
        });
      } catch (error) {
        console.error('Failed to build reconciliation insights:', error);
        if (!cancelled) {
          toast.error('Unable to build reconciliation for this batch.');
          setReconciliation(null);
          setExceptionStates({});
        }
      } finally {
        if (!cancelled) {
          setReconLoading(false);
        }
      }
    };

    buildReconciliation();

    return () => {
      cancelled = true;
    };
  }, [selectedBatchId, batches, reconciliationVersion]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploading(true);
      try {
        const content = e.target.result;
        const mockProviderId = 'mock-provider-id';
        const response = await processSettlementFile({ provider_id: mockProviderId, file_content: content });
        if (response?.data?.success) {
          toast.success(`Settlement file imported. Batch ID: ${response.data.batch_id}`);
          await loadBatches();
        } else {
          toast.error(`Import failed: ${response?.data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        toast.error(`An error occurred during upload: ${error.message}`);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const selectedBatch = useMemo(
    () => batches.find((item) => item.id === selectedBatchId) || null,
    [batches, selectedBatchId],
  );

  const formatCurrency = useMemo(
    () => (value = 0) => `$${((value || 0) / 100).toFixed(2)}`,
    [],
  );

  const formatDate = useMemo(
    () => (value) => {
      if (!value) return 'Date unavailable';
      try {
        return format(new Date(value), 'PPP');
      } catch (error) {
        return 'Date unavailable';
      }
    },
    [],
  );

  const unresolvedExceptions = useMemo(
    () =>
      Object.values(exceptionStates).filter(
        (state) => state !== 'resolved' && state !== 'closed',
      ).length,
    [exceptionStates],
  );

  const varianceBreaches = useMemo(
    () => reconciliation?.varianceRecords.filter((record) => record.exceededTolerance).length || 0,
    [reconciliation],
  );

  const summaryTiles = useMemo(() => {
    if (!reconciliation) return [];
    const { totals, chargebacks } = reconciliation;
    const unmatchedAmount = (totals?.unmatchedSettlementAmountCents || 0) + (totals?.unmatchedSaleAmountCents || 0);
    return [
      {
        title: 'Matched value',
        value: formatCurrency(totals?.matchedAmountCents || 0),
        detail: `${totals?.matchedCount || 0} transactions matched`,
        tone: 'bg-green-50 text-green-700 border-green-200',
      },
      {
        title: 'Unmatched exposure',
        value: formatCurrency(unmatchedAmount),
        detail: `${(totals?.unmatchedSettlementCount || 0) + (totals?.unmatchedSaleCount || 0)} outstanding records`,
        tone: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      {
        title: 'Cash variance',
        value: formatCurrency(totals?.cashVarianceCents || 0),
        detail: `${varianceBreaches} counts over tolerance`,
        tone: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      {
        title: 'Chargeback exposure',
        value: formatCurrency(totals?.chargebackAmountCents || 0),
        detail: `${chargebacks?.pendingCount || 0} pending • ${chargebacks?.lostCount || 0} lost`,
        tone: 'bg-purple-50 text-purple-700 border-purple-200',
      },
    ];
  }, [reconciliation, formatCurrency, varianceBreaches]);

  const getStatusBadge = (status) => {
    const normalized = (status || '').toString().toLowerCase();
    switch (normalized) {
      case 'reconciled':
      case 'complete':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />Reconciled
          </Badge>
        );
      case 'processing':
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleExceptionStatus = (id, status) => {
    setExceptionStates((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const escalateException = (alert) => {
    handleExceptionStatus(alert.id, 'escalated');
    toast.info('Exception escalated to finance controller for manual review.');
  };

  const handleApprovalChange = (field, value) => {
    setApprovalForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApprovalSubmit = () => {
    if (!reconciliation) {
      toast.error('Select a batch to log approvals.');
      return;
    }

    if (!approvalForm.preparedBy.trim() || !approvalForm.reviewedBy.trim()) {
      toast.error('Both preparer and reviewer must be recorded.');
      return;
    }

    if (approvalForm.preparedBy.trim() === approvalForm.reviewedBy.trim()) {
      toast.error('Dual-control requires different people for preparation and review.');
      return;
    }

    const entry = {
      ...approvalForm,
      id: `${reconciliation.batch?.id || reconciliation.batch?.batch_id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      unresolvedExceptions,
    };

    setApprovalHistory((prev) => [entry, ...prev]);
    setApprovalForm({ preparedBy: '', reviewedBy: '', notes: '', autoRelease: approvalForm.autoRelease });
    toast.success('Dual-control approval recorded.');
  };

  const handleExport = async (type) => {
    if (!reconciliation) {
      toast.error('Select a batch to export journals.');
      return;
    }

    setExporting(type);
    try {
      const payload = {
        type,
        batch: {
          id: reconciliation.batch?.id,
          batch_id: reconciliation.batch?.batch_id,
          settlement_date: reconciliation.batch?.settlement_date,
        },
        generated_at: new Date().toISOString(),
        totals: reconciliation.totals,
        data: reconciliation.journalExports?.[type] || [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileSafeType = type.replace(/[^a-z0-9-]/gi, '_');
      link.download = `${reconciliation.batch?.batch_id || reconciliation.batch?.id || 'batch'}-${fileSafeType}-journal.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Export generated for ${type} journal.`);
    } catch (error) {
      console.error('Failed to export journal payload:', error);
      toast.error('Unable to export journal data.');
    } finally {
      setExporting(null);
    }
  };

  const renderExceptionStatus = (status) => {
    const normalized = (status || 'open').toLowerCase();
    switch (normalized) {
      case 'resolved':
      case 'closed':
        return <Badge className="bg-emerald-100 text-emerald-700">Resolved</Badge>;
      case 'escalated':
        return <Badge className="bg-amber-100 text-amber-700">Escalated</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-100 text-blue-700">Investigating</Badge>;
      default:
        return <Badge variant="secondary">Open</Badge>;
    }
  };

  const allExceptionsResolved = unresolvedExceptions === 0;

  const releaseReady = allExceptionsResolved && approvalHistory.length > 0;

  if (loading) {
    return <LoadingSpinner text="Loading settlements..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Settlement File</CardTitle>
          <CardDescription>Upload a settlement report from your payment provider (CSV format).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="settlement-upload" className="flex-grow">
              <Button as="span" variant="outline" className="w-full" disabled={uploading}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Processing...' : 'Choose Settlement File'}
              </Button>
            </label>
            <input
              id="settlement-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
          {uploading && <LoadingSpinner text="Analyzing and importing file..." className="mt-4" />}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Settlement Batches</CardTitle>
            <CardDescription>Select a batch to review reconciliation insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batches.map((batch) => {
                const displayId = batch.batch_id || batch.id;
                const isSelected = selectedBatchId === batch.id;
                return (
                  <button
                    type="button"
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`w-full text-left p-4 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                      isSelected ? 'border-slate-900 bg-slate-50 shadow-sm' : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Batch {displayId}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(batch.settlement_date)} • {` ${formatCurrency(batch.total_amount_cents || 0)} across ${batch.total_transactions || 0} txns`}
                        </p>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                  </button>
                );
              })}
              {batches.length === 0 && (
                <p className="text-center text-slate-500 py-8">No settlement batches imported.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Settlement Review
                  {reconciliation && (
                    <Badge variant={releaseReady ? 'default' : 'secondary'}>
                      {releaseReady ? 'Ready for journal export' : 'Awaiting resolution'}
                    </Badge>
                  )}
                </CardTitle>
                {selectedBatch && (
                  <CardDescription>
                    {selectedBatch.batch_id || selectedBatch.id} • {formatDate(selectedBatch.settlement_date)}
                  </CardDescription>
                )}
              </div>
              {reconciliation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReconciliationVersion((prev) => prev + 1)}
                >
                  Refresh Insights
                </Button>
              )}
            </div>
            {reconciliation?.toleranceAlerts?.length > 0 && (
              <Alert className="border border-amber-200 bg-amber-50 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{reconciliation.toleranceAlerts.length} tolerance alert(s) open</AlertTitle>
                <AlertDescription>
                  Resolve exceptions before releasing journals to accounting for an auditable trail.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            {reconLoading && <LoadingSpinner text="Building reconciliation insights..." />}
            {!reconLoading && !reconciliation && (
              <p className="text-slate-500 text-center py-12">Select a batch to see reconciliation analytics.</p>
            )}
            {!reconLoading && reconciliation && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {summaryTiles.map((tile) => (
                    <div
                      key={tile.title}
                      className={`rounded-lg border p-4 ${tile.tone} flex flex-col gap-1`}
                    >
                      <span className="text-xs uppercase tracking-wide text-slate-500">{tile.title}</span>
                      <span className="text-xl font-semibold">{tile.value}</span>
                      <span className="text-xs text-slate-600">{tile.detail}</span>
                    </div>
                  ))}
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                    <TabsTrigger value="exports">Exports</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Exception snapshot</CardTitle>
                        <CardDescription>Active alerts and unmatched records that require action.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md border p-3">
                          <p className="text-xs uppercase text-slate-500">Tolerance alerts</p>
                          <p className="text-lg font-semibold">{reconciliation.toleranceAlerts.length}</p>
                          <p className="text-xs text-slate-500">{unresolvedExceptions} awaiting resolution</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs uppercase text-slate-500">Unmatched settlements</p>
                          <p className="text-lg font-semibold">{reconciliation.transactions.unmatchedSettlements.length}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(reconciliation.totals.unmatchedSettlementAmountCents)}</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-xs uppercase text-slate-500">Unmatched sales</p>
                          <p className="text-lg font-semibold">{reconciliation.transactions.unmatchedSales.length}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(reconciliation.totals.unmatchedSaleAmountCents)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Chargeback watchlist</CardTitle>
                        <CardDescription>Monitor chargeback movements for this batch.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Pending</span>
                          <Badge variant="outline">{reconciliation.chargebacks.pendingCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Won</span>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {reconciliation.chargebacks.wonCount}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Lost</span>
                          <Badge variant="destructive">{reconciliation.chargebacks.lostCount}</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span>Total at risk</span>
                          <span className="font-medium">{formatCurrency(reconciliation.totals.chargebackAmountCents)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="exceptions" className="space-y-6 pt-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Exception workflow</h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Alert</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reconciliation.toleranceAlerts.map((alert) => (
                            <TableRow key={alert.id}>
                              <TableCell className="max-w-xs">
                                <p className="font-medium capitalize">{alert.type.replace('-', ' ')}</p>
                                <p className="text-xs text-slate-500">{alert.message}</p>
                              </TableCell>
                              <TableCell>
                                {alert.severity === 'critical' ? (
                                  <Badge variant="destructive">Critical</Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700">Warning</Badge>
                                )}
                              </TableCell>
                              <TableCell>{renderExceptionStatus(exceptionStates[alert.id])}</TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExceptionStatus(alert.id, 'investigating')}
                                >
                                  Investigate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExceptionStatus(alert.id, 'resolved')}
                                >
                                  Resolve
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => escalateException(alert)}>
                                  Escalate
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {reconciliation.toleranceAlerts.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-slate-500">
                                No tolerance alerts for this batch.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Unmatched settlement transactions
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2 max-h-64 overflow-y-auto">
                          {reconciliation.transactions.unmatchedSettlements.map((txn) => (
                            <div key={txn.id || normaliseKey(txn)} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{normaliseKey(txn)}</p>
                              <p className="text-slate-500">
                                Amount {formatCurrency(txn.amount_cents || txn.total_amount_cents || 0)} • {txn.payment_method || 'N/A'}
                              </p>
                            </div>
                          ))}
                          {reconciliation.transactions.unmatchedSettlements.length === 0 && (
                            <p className="text-center text-slate-500">All settlement lines matched.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Unmatched sales records
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2 max-h-64 overflow-y-auto">
                          {reconciliation.transactions.unmatchedSales.map((sale) => (
                            <div key={sale.id || normaliseKey(sale)} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{sale.id || normaliseKey(sale)}</p>
                              <p className="text-slate-500">
                                Amount {formatCurrency(sale.total_amount_cents || sale.amount_cents || 0)} • {sale.payment_method || 'N/A'}
                              </p>
                            </div>
                          ))}
                          {reconciliation.transactions.unmatchedSales.length === 0 && (
                            <p className="text-center text-slate-500">No sales awaiting settlement.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="approvals" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="prepared-by">Prepared by</Label>
                          <Input
                            id="prepared-by"
                            placeholder="Name of reconciler"
                            value={approvalForm.preparedBy}
                            onChange={(event) => handleApprovalChange('preparedBy', event.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reviewed-by">Reviewed by</Label>
                          <Input
                            id="reviewed-by"
                            placeholder="Name of reviewer"
                            value={approvalForm.reviewedBy}
                            onChange={(event) => handleApprovalChange('reviewedBy', event.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="approval-notes">Control notes</Label>
                        <Textarea
                          id="approval-notes"
                          placeholder="Document supporting evidence, remediations, or audit notes."
                          rows={4}
                          value={approvalForm.notes}
                          onChange={(event) => handleApprovalChange('notes', event.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          id="auto-release"
                          checked={approvalForm.autoRelease}
                          onCheckedChange={(checked) => handleApprovalChange('autoRelease', checked)}
                        />
                        <Label htmlFor="auto-release" className="text-sm text-slate-600">
                          Auto-release journals when dual control is complete
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button onClick={handleApprovalSubmit}>
                          <ShieldCheck className="w-4 h-4 mr-2" /> Log dual-control approval
                        </Button>
                        {!allExceptionsResolved && (
                          <Badge variant="destructive">Resolve exceptions to enable release</Badge>
                        )}
                      </div>

                      {releaseReady ? (
                        <Alert>
                          <ClipboardCheck className="h-4 w-4" />
                          <AlertTitle>Dual-control complete</AlertTitle>
                          <AlertDescription>
                            Journals can be released to accounting. An immutable log of approvals has been recorded.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border border-slate-200 bg-slate-50 text-slate-700">
                          <AlertDescription>
                            Journals remain locked until both approvals are logged and all exceptions are resolved.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {approvalHistory.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Approval history</h4>
                        <div className="space-y-2">
                          {approvalHistory.map((entry) => (
                            <div key={entry.id} className="border rounded-lg p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {entry.preparedBy} → {entry.reviewedBy}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(entry.timestamp), 'PPpp')}
                                </span>
                              </div>
                              {entry.notes && <p className="text-xs text-slate-600 mt-2">{entry.notes}</p>}
                              <p className="text-xs text-slate-500 mt-1">
                                Auto-release: {entry.autoRelease ? 'Enabled' : 'Manual'} • Exceptions open at approval: {entry.unresolvedExceptions}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="exports" className="space-y-6 pt-4">
                    <Alert>
                      <FileDown className="h-4 w-4" />
                      <AlertTitle>Immutable export</AlertTitle>
                      <AlertDescription>
                        Exports include digital signatures of the batch metadata and approval log to support downstream
                        accounting journal entries.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Matched journal</CardTitle>
                          <CardDescription>Entries ready to post to revenue accounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-slate-500">
                            {reconciliation.transactions.matched.length} matched records
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleExport('matched')}
                            disabled={exporting && exporting !== 'matched'}
                          >
                            <FileDown className="w-4 h-4 mr-2" /> Download matched journal
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Exception journal</CardTitle>
                          <CardDescription>Escrow unresolved items for finance review.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-slate-500">
                            {reconciliation.transactions.unmatchedSettlements.length + reconciliation.transactions.unmatchedSales.length}
                            {' '}records awaiting match
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleExport('exceptions')}
                            disabled={exporting && exporting !== 'exceptions'}
                          >
                            <FileDown className="w-4 h-4 mr-2" /> Download exception journal
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Cash variance log</CardTitle>
                          <CardDescription>Variance statements with photo evidence pointers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-slate-500">{reconciliation.varianceRecords.length} cash counts</p>
                          <Button
                            variant="outline"
                            onClick={() => handleExport('cash')}
                            disabled={exporting && exporting !== 'cash'}
                          >
                            <FileDown className="w-4 h-4 mr-2" /> Download cash variance log
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Chargeback report</CardTitle>
                          <CardDescription>Track disputes and win/loss outcomes for this batch.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-slate-500">{reconciliation.chargebacks.records.length} chargebacks</p>
                          <Button
                            variant="outline"
                            onClick={() => handleExport('chargebacks')}
                            disabled={exporting && exporting !== 'chargebacks'}
                          >
                            <FileDown className="w-4 h-4 mr-2" /> Download chargeback report
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function normaliseKey(record) {
  return (
    record?.settlement_transaction_id ||
    record?.transaction_id ||
    record?.provider_transaction_id ||
    record?.payment_reference ||
    record?.reference ||
    record?.id ||
    'unknown'
  );
}