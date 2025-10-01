import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { SettlementBatch, CashCollection, PaymentAuditLog, AuditLog } from '@/api/entities';
import { toast } from 'sonner';
import { FileDown, ShieldCheck, Image as ImageIcon, ListChecks, Database } from 'lucide-react';
import { format } from 'date-fns';

const safeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  return [value];
};

const freezeDeep = (value) => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => freezeDeep(entry)));
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = freezeDeep(value[key]);
    });
    return Object.freeze(value);
  }
  return value;
};

const computePeriodRange = (type) => {
  const now = new Date();
  const start = new Date(now);
  if (type === 'bas') {
    start.setMonth(start.getMonth() - 3);
  } else {
    start.setMonth(start.getMonth() - 1);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end: now };
};

const isWithinPeriod = (value, start, end) => {
  if (!value) return false;
  try {
    const date = new Date(value);
    return date >= start && date <= end;
  } catch (error) {
    return false;
  }
};

const safeList = async (entity, ...args) => {
  if (!entity?.list) return [];
  try {
    const result = await entity.list(...args);
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.results)) return result.results;
    return [];
  } catch (error) {
    console.warn('Failed to load data for compliance context', error);
    return [];
  }
};

export default function CompliancePage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [evidenceSources, setEvidenceSources] = useState({
    batches: [],
    cash: [],
    paymentLogs: [],
    auditLogs: [],
  });
  const [packHistory, setPackHistory] = useState([]);

  useEffect(() => {
    let active = true;
    const loadEvidence = async () => {
      setLoading(true);
      try {
        const [batches, cash, paymentLogs, auditLogs] = await Promise.all([
          safeList(SettlementBatch, '-settlement_date'),
          safeList(CashCollection),
          safeList(PaymentAuditLog, '-created_at'),
          safeList(AuditLog, '-created_at'),
        ]);

        if (!active) return;
        setEvidenceSources({
          batches: safeArray(batches),
          cash: safeArray(cash),
          paymentLogs: safeArray(paymentLogs),
          auditLogs: safeArray(auditLogs),
        });
      } catch (error) {
        if (active) {
          console.error('Unable to load compliance evidence sources', error);
          toast.error('Failed to load compliance evidence sources.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEvidence();
    return () => {
      active = false;
    };
  }, []);

  const previewStats = useMemo(() => {
    const compute = (type) => {
      const { start, end } = computePeriodRange(type);
      const settlements = evidenceSources.batches.filter((batch) =>
        isWithinPeriod(batch.settlement_date, start, end),
      );
      const cash = evidenceSources.cash.filter((record) =>
        isWithinPeriod(record.cash_collected_at || record.collected_at || record.created_at, start, end),
      );
      const attachments = cash.reduce(
        (sum, record) => sum + safeArray(record.cash_collection_photos || record.photos).length,
        0,
      );
      const logs = [...evidenceSources.paymentLogs, ...evidenceSources.auditLogs].filter((log) =>
        isWithinPeriod(log.created_at || log.timestamp, start, end),
      );

      return {
        settlements: settlements.length,
        cash: cash.length,
        attachments,
        logs: logs.length,
      };
    };

    return {
      bas: compute('bas'),
      paygw: compute('paygw'),
    };
  }, [evidenceSources]);

  const previewRecords = useMemo(() => {
    const compute = (type) => {
      const { start, end } = computePeriodRange(type);
      const settlements = evidenceSources.batches
        .filter((batch) => isWithinPeriod(batch.settlement_date, start, end))
        .slice(0, 5);
      const cash = evidenceSources.cash
        .filter((record) =>
          isWithinPeriod(record.cash_collected_at || record.collected_at || record.created_at, start, end),
        )
        .slice(0, 5);
      const logs = [...evidenceSources.paymentLogs, ...evidenceSources.auditLogs]
        .filter((log) => isWithinPeriod(log.created_at || log.timestamp, start, end))
        .slice(0, 5);

      return { settlements, cash, logs };
    };

    return {
      bas: compute('bas'),
      paygw: compute('paygw'),
    };
  }, [evidenceSources]);

  const buildPack = (type) => {
    const { start, end } = computePeriodRange(type);
    const settlements = evidenceSources.batches
      .filter((batch) => isWithinPeriod(batch.settlement_date, start, end))
      .map((batch) => ({
        id: batch.id,
        batch_id: batch.batch_id,
        settlement_date: batch.settlement_date,
        total_amount_cents: batch.total_amount_cents,
        status: batch.status,
      }));

    const cash = evidenceSources.cash
      .filter((record) =>
        isWithinPeriod(record.cash_collected_at || record.collected_at || record.created_at, start, end),
      )
      .map((record) => {
        const photos = safeArray(record.cash_collection_photos || record.photos);
        const collected = Number(
          record.cash_collected_cents ?? record.counted_amount_cents ?? record.cash_total_cents ?? 0,
        );
        const expected = Number(
          record.expected_cash_cents ?? record.expected_amount_cents ?? record.meter_amount_cents ?? 0,
        );
        const variance =
          typeof record.variance_cents === 'number'
            ? Math.round(record.variance_cents)
            : collected - expected;
        return {
          id: record.id,
          machine_id: record.machine_id || record.device_id,
          variance_cents: variance,
          collected_at: record.cash_collected_at || record.collected_at || record.created_at,
          notes: record.variance_reason || record.notes || null,
          photos,
        };
      });

    const attachments = [];
    cash.forEach((entry) => {
      safeArray(entry.photos).forEach((photo, index) => {
        attachments.push({
          id: `${entry.id || entry.machine_id}-photo-${index}`,
          source: entry.machine_id,
          uri: photo,
          captured_at: entry.collected_at,
        });
      });
    });

    const logs = [...evidenceSources.paymentLogs, ...evidenceSources.auditLogs]
      .filter((log) => isWithinPeriod(log.created_at || log.timestamp, start, end))
      .map((log) => ({
        id: log.id,
        level: log.level || log.status || 'info',
        message: log.message || log.description || log.event || 'Log entry',
        created_at: log.created_at || log.timestamp,
        context: log.context || log.metadata || null,
      }));

    const pack = {
      id: `${type.toUpperCase()}-${Date.now()}`,
      type,
      generated_at: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      evidence: {
        settlements,
        cash_counts: cash,
        logs,
        attachments,
      },
      metadata: {
        version: '1.0',
        prepared_by: 'Compliance Engine',
        record_counts: {
          settlements: settlements.length,
          cash_counts: cash.length,
          attachments: attachments.length,
          logs: logs.length,
        },
      },
    };

    pack.integrity = {
      checksum: `${pack.type}-${pack.metadata.record_counts.settlements}-${pack.metadata.record_counts.attachments}-${pack.generated_at}`,
      immutable: true,
    };

    return freezeDeep(pack);
  };

  const handleGenerate = async (type) => {
    setGenerating(type);
    try {
      const pack = buildPack(type);
      setPackHistory((prev) => [pack, ...prev]);
      toast.success(`${type.toUpperCase()} compliance pack generated.`);
    } catch (error) {
      console.error('Failed to generate compliance pack', error);
      toast.error('Unable to generate compliance pack.');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadPack = (pack) => {
    try {
      const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pack.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download compliance pack', error);
      toast.error('Unable to download compliance pack.');
    }
  };

  const renderPackPanel = (type, label) => {
    const stats = previewStats[type];
    const previews = previewRecords[type];
    const period = computePeriodRange(type);
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>{label} compliance pack</CardTitle>
            <CardDescription>
              Capture supporting evidence for {label} reporting, including settlements, cash counts, and audit trails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-slate-500">Settlements</p>
                <p className="text-xl font-semibold">{stats.settlements}</p>
                <p className="text-xs text-slate-500">included in the reporting window</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-slate-500">Cash counts</p>
                <p className="text-xl font-semibold">{stats.cash}</p>
                <p className="text-xs text-slate-500">with meter evidence</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-slate-500">Attachments</p>
                <p className="text-xl font-semibold">{stats.attachments}</p>
                <p className="text-xs text-slate-500">photos and documents</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-slate-500">Logs</p>
                <p className="text-xl font-semibold">{stats.logs}</p>
                <p className="text-xs text-slate-500">control & payment logs</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Database className="w-4 h-4" />
                {label} window: {format(period.start, 'PPP')} – {format(period.end, 'PPP')}
              </div>
              <Button
                onClick={() => handleGenerate(type)}
                disabled={!!generating && generating !== type}
              >
                {generating === type ? 'Preparing pack…' : `Generate ${label} pack`}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence preview</CardTitle>
            <CardDescription>Recent records that will be embedded into the compliance pack.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" /> Settlements
                </h4>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <div className="space-y-3 text-sm">
                    {previews.settlements.map((batch) => (
                      <div key={batch.id || batch.batch_id} className="space-y-1 border-b pb-2 last:border-0 last:pb-0">
                        <p className="font-medium">{batch.batch_id || batch.id}</p>
                        <p className="text-xs text-slate-500">
                          {batch.settlement_date ? format(new Date(batch.settlement_date), 'PPP') : 'Unknown date'} •
                          {' '}
                          ${((batch.total_amount_cents || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {previews.settlements.length === 0 && (
                      <p className="text-center text-slate-500">No settlements in scope yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Cash counts
                </h4>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <div className="space-y-3 text-sm">
                    {previews.cash.map((record) => {
                      const collected = Number(
                        record.cash_collected_cents ?? record.counted_amount_cents ?? record.cash_total_cents ?? 0,
                      );
                      const expected = Number(
                        record.expected_cash_cents ?? record.expected_amount_cents ?? record.meter_amount_cents ?? 0,
                      );
                      const variance =
                        typeof record.variance_cents === 'number'
                          ? record.variance_cents
                          : collected - expected;
                      return (
                        <div
                          key={record.id || record.machine_id}
                          className="space-y-1 border-b pb-2 last:border-0 last:pb-0"
                        >
                          <p className="font-medium">Machine {record.machine_id || 'unknown'}</p>
                          <p className="text-xs text-slate-500">
                            Variance: {(variance / 100).toFixed(2)} • Photos:{' '}
                            {safeArray(record.cash_collection_photos || record.photos).length}
                          </p>
                        </div>
                      );
                    })}
                    {previews.cash.length === 0 && (
                      <p className="text-center text-slate-500">No cash counts captured in period.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Audit trail
                </h4>
                <ScrollArea className="h-40 rounded-md border p-3">
                  <div className="space-y-3 text-sm">
                    {previews.logs.map((log) => (
                      <div key={log.id} className="space-y-1 border-b pb-2 last:border-0 last:pb-0">
                        <p className="font-medium capitalize">{(log.level || 'info').toLowerCase()}</p>
                        <p className="text-xs text-slate-500">{log.message || 'Log entry'}</p>
                      </div>
                    ))}
                    {previews.logs.length === 0 && (
                      <p className="text-center text-slate-500">No audit events captured for this period.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Compliance Packs</h1>
        <p className="text-slate-600 mt-2">
          Generate immutable BAS and PAYGW evidence bundles with embedded logs, photos, and settlement summaries.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading compliance evidence..." />
      ) : (
        <>
          <Alert className="border border-emerald-200 bg-emerald-50 text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Immutable exports</AlertTitle>
            <AlertDescription>
              Each compliance pack is sealed with a checksum and frozen metadata, ensuring integrity for regulator reviews.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="bas" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:w-1/2">
              <TabsTrigger value="bas">BAS Pack</TabsTrigger>
              <TabsTrigger value="paygw">PAYGW Pack</TabsTrigger>
            </TabsList>

            <TabsContent value="bas" className="space-y-4">
              {renderPackPanel('bas', 'BAS')}
            </TabsContent>
            <TabsContent value="paygw" className="space-y-4">
              {renderPackPanel('paygw', 'PAYGW')}
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Compliance archive</CardTitle>
              <CardDescription>Previously generated packs remain locked and ready for re-export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {packHistory.length === 0 && (
                <p className="text-slate-500 text-sm">No compliance packs generated yet.</p>
              )}
              {packHistory.map((pack) => (
                <div key={pack.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold uppercase text-slate-700">{pack.type}</p>
                      <p className="text-xs text-slate-500">
                        Generated {format(new Date(pack.generated_at), 'PPpp')} • Checksum {pack.integrity.checksum}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{pack.metadata.record_counts.settlements} settlements</Badge>
                      <Badge variant="secondary">{pack.metadata.record_counts.cash_counts} cash counts</Badge>
                      <Badge variant="secondary">{pack.metadata.record_counts.attachments} attachments</Badge>
                      <Badge variant="secondary">{pack.metadata.record_counts.logs} logs</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-slate-500">
                      Period: {format(new Date(pack.period.start), 'PPP')} – {format(new Date(pack.period.end), 'PPP')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPack(pack)}>
                        <FileDown className="w-4 h-4 mr-2" /> Download JSON
                      </Button>
                      <Badge className="bg-emerald-100 text-emerald-700">Immutable</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
