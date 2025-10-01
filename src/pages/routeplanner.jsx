import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Route,
  Visit,
  Product,
  Machine,
  MachineStock,
  Location,
  Alert,
} from '@/api/entities';
import { optimizeRoutePlan } from '@/api/functions';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  Truck,
  Calendar,
  ListTodo,
  RefreshCcw,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { format, startOfDay, differenceInMinutes } from 'date-fns';
import { Link } from 'react-router-dom';
import FeatureGate from '../components/features/FeatureGate';
import { Badge } from '@/components/ui/badge';
import { safeArray } from '@/components/utils/safe';

const DEFAULT_VEHICLE_CAPACITY = 400;
const DEFAULT_OPERATOR_EMAIL = 'driver@elitevending.com';
const DEFAULT_SHIFT = { start: '06:00', end: '18:00' };
const ALERT_TRIGGER_TYPES = ['telemetry_fault', 'sla_breach', 'temperature_fault', 'offline'];

const parseTimeToken = (value, fallback = '08:00') => {
  if (!value) return fallback;
  if (typeof value === 'number') {
    const hours = Math.max(0, Math.min(23, Math.floor(value)));
    return `${hours.toString().padStart(2, '0')}:00`;
  }
  if (typeof value === 'string') {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
  }
  if (typeof value === 'object') {
    if (value.start) return parseTimeToken(value.start, fallback);
    if (value.open) return parseTimeToken(value.open, fallback);
  }
  return fallback;
};

const combineDateAndTime = (date, timeString) => {
  const [hours, minutes] = timeString.split(':').map((token) => Number.parseInt(token, 10) || 0);
  const base = startOfDay(date);
  const combined = new Date(base);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

const resolveCoordinate = (machine, location, axis) => {
  const candidates =
    axis === 'lat'
      ? [
          machine?.latitude,
          machine?.lat,
          machine?.geo_latitude,
          location?.latitude,
          location?.lat,
          location?.geo_latitude,
          machine?.metadata?.latitude,
          location?.metadata?.latitude,
        ]
      : [
          machine?.longitude,
          machine?.lng,
          machine?.lon,
          machine?.geo_longitude,
          location?.longitude,
          location?.lng,
          location?.lon,
          machine?.metadata?.longitude,
          location?.metadata?.longitude,
        ];

  for (const candidate of candidates) {
    const value = Number(candidate);
    if (!Number.isFinite(value)) continue;
    if (axis === 'lat' && value >= -90 && value <= 90) return value;
    if (axis === 'lng' && value >= -180 && value <= 180) return value;
  }
  return null;
};

const deriveTimeWindow = (machine, location, selectedDate) => {
  const start =
    machine?.service_window_start ||
    machine?.serviceWindow?.start ||
    machine?.metadata?.serviceWindow?.start ||
    location?.service_window_start ||
    location?.operating_hours?.start ||
    location?.hours_of_operation?.weekday?.start ||
    location?.metadata?.serviceWindow?.start ||
    DEFAULT_SHIFT.start;

  const end =
    machine?.service_window_end ||
    machine?.serviceWindow?.end ||
    machine?.metadata?.serviceWindow?.end ||
    location?.service_window_end ||
    location?.operating_hours?.end ||
    location?.hours_of_operation?.weekday?.end ||
    location?.metadata?.serviceWindow?.end ||
    DEFAULT_SHIFT.end;

  const windowStart = combineDateAndTime(selectedDate, parseTimeToken(start, DEFAULT_SHIFT.start));
  const windowEnd = combineDateAndTime(selectedDate, parseTimeToken(end, DEFAULT_SHIFT.end));

  if (windowEnd <= windowStart) {
    windowEnd.setHours(windowEnd.getHours() + 12);
  }

  return { start: windowStart.toISOString(), end: windowEnd.toISOString() };
};

const chooseDepot = (locations) => {
  const locationList = safeArray(locations);
  const depot =
    locationList.find((loc) => loc?.is_depot || loc?.type === 'warehouse' || loc?.tags?.includes?.('depot')) ||
    locationList.find((loc) => loc?.category === 'depot');

  if (depot && Number.isFinite(Number(depot.latitude)) && Number.isFinite(Number(depot.longitude))) {
    return {
      id: depot.id,
      name: depot.name,
      latitude: Number(depot.latitude),
      longitude: Number(depot.longitude),
      address: depot.address,
    };
  }

  return {
    id: 'default-depot',
    name: 'Main Depot',
    latitude: -33.8688,
    longitude: 151.2093,
    address: 'Default depot location',
  };
};

const aggregatePickList = (stops) => {
  const summary = new Map();
  stops.forEach((stop) => {
    (stop.items || []).forEach((item) => {
      const existing = summary.get(item.productSku) || {
        product_sku: item.productSku,
        product_name: item.productName,
        total_needed: 0,
        machines: [],
      };
      existing.total_needed += Number(item.needed) || 0;
      existing.machines.push({
        machine_id: item.machineId,
        machine_code: item.machineCode,
        location_name: item.locationName,
        needed: Number(item.needed) || 0,
        slot_number: item.slotNumber,
        current_stock: item.currentStock,
        par_level: item.parLevel,
      });
      summary.set(item.productSku, existing);
    });
  });

  return Array.from(summary.values())
    .map((entry) => ({
      ...entry,
      machines: entry.machines.sort((a, b) => (a.machine_code || '').localeCompare(b.machine_code || '')),
    }))
    .sort((a, b) => b.total_needed - a.total_needed);
};

const formatMinutes = (minutes) => {
  if (!Number.isFinite(minutes)) return '—';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const formatDistance = (km) => {
  if (!Number.isFinite(km)) return '—';
  return `${km.toFixed(1)} km`;
};

const buildDemandProfiles = ({
  machines,
  stocks,
  products,
  locations,
  selectedDate,
}) => {
  const productMap = new Map(safeArray(products).map((product) => [product?.sku, product]));
  const locationMap = new Map(safeArray(locations).map((location) => [location?.id, location]));

  const unscheduled = [];
  const demandProfiles = [];

  safeArray(machines).forEach((machine) => {
    if (!machine) return;
    const location = locationMap.get(machine.location_id);
    const machineStocks = safeArray(stocks).filter((stock) => stock?.machine_id === machine.id);

    const items = machineStocks
      .map((stock) => {
        const par = Number(stock?.par_level ?? 0);
        const current = Number(stock?.current_stock ?? 0);
        if (par <= current) return null;
        const needed = par - current;
        const product = productMap.get(stock?.product_sku);
        return {
          productSku: stock?.product_sku,
          productName: product?.name || stock?.product_sku,
          needed,
          currentStock: current,
          parLevel: par,
          slotNumber: stock?.slot_number,
          machineId: machine.id,
          machineCode: machine.machine_id,
          locationName: location?.name,
          locationId: location?.id,
        };
      })
      .filter(Boolean);

    if (!items.length) return;

    const latitude = resolveCoordinate(machine, location, 'lat');
    const longitude = resolveCoordinate(machine, location, 'lng');

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      unscheduled.push({
        id: machine.id,
        machineCode: machine.machine_id,
        reason: 'Missing location coordinates',
      });
      return;
    }

    const demandUnits = items.reduce((total, item) => total + item.needed, 0);
    const serviceDuration =
      machine?.service_duration_minutes ||
      machine?.metadata?.service_duration_minutes ||
      Math.max(10, items.length * 3);

    demandProfiles.push({
      id: machine.id,
      machineCode: machine.machine_id,
      locationId: location?.id,
      location,
      locationName: location?.name,
      latitude,
      longitude,
      items,
      demandUnits,
      serviceDurationMinutes: serviceDuration,
      timeWindow: deriveTimeWindow(machine, location, selectedDate),
    });
  });

  const averageServiceDuration =
    demandProfiles.length
      ? Math.round(
          demandProfiles.reduce((total, profile) => total + profile.serviceDurationMinutes, 0) /
            demandProfiles.length
        )
      : 12;

  return {
    demandProfiles,
    unscheduled,
    averageServiceDuration,
  };
};

const getPlannedMetrics = (route) => {
  const planMetrics = route?.metadata?.optimization?.planMetrics || route?.metadata?.planMetrics;
  return {
    distance: planMetrics?.totalDistanceKm ?? route?.estimated_distance_km ?? null,
    duration: planMetrics?.totalDurationMinutes ?? route?.estimated_duration_minutes ?? null,
    stops: planMetrics?.stops ?? route?.optimized_machine_order?.length ?? route?.machine_ids?.length ?? 0,
  };
};

const getActualMetrics = (route) => {
  const actual = route?.metadata?.actualMetrics || route?.metadata?.actuals || {};
  return {
    distance: actual.totalDistanceKm ?? route?.actual_distance_km ?? null,
    duration: actual.totalDurationMinutes ?? route?.actual_duration_minutes ?? null,
    stops: actual.stops ?? route?.completed_stop_count ?? null,
  };
};

export default function RoutePlannerPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [planningSummary, setPlanningSummary] = useState(null);
  const [pickingSummaries, setPickingSummaries] = useState({});
  const [relevantAlerts, setRelevantAlerts] = useState([]);
  const [autoReoptimizing, setAutoReoptimizing] = useState(false);

  const alertIdsRef = useRef(new Set());
  const lastReoptRef = useRef(null);

  const loadRoutesForDate = useCallback(async (date) => {
    try {
      const scheduled = format(date, 'yyyy-MM-dd');
      const fetched = await Route.list('-created_date');
      const plannedForDay = safeArray(fetched).filter((route) => route?.next_scheduled === scheduled);
      setRoutes(plannedForDay);
      plannedForDay.forEach((route) => {
        if (route?.metadata?.pickingListSummary) {
          setPickingSummaries((prev) => ({
            ...prev,
            [route.id]: route.metadata.pickingListSummary,
          }));
        }
      });
    } catch (error) {
      console.error('Failed to load routes', error);
      setRoutes([]);
    }
  }, []);

  useEffect(() => {
    loadRoutesForDate(selectedDate);
  }, [selectedDate, loadRoutesForDate]);

  const persistOptimizationResult = useCallback(
    async (optimizationResult, aggregatedSummary, trigger, triggeredAlerts, planningContext) => {
      const scheduledDate = format(selectedDate, 'yyyy-MM-dd');
      const stopMachineIds = optimizationResult.stops.map((stop) => stop.machineId);
      const nowIso = new Date().toISOString();
      const planMetrics = {
        totalDistanceKm: optimizationResult.totalDistanceKm,
        totalDurationMinutes: optimizationResult.totalDurationMinutes,
        stops: stopMachineIds.length,
        startTime: optimizationResult.startTime,
        endTime: optimizationResult.endTime,
      };

      const buildMetadata = (existing = {}) => {
        const previousHistory = Array.isArray(existing?.optimization?.history)
          ? existing.optimization.history.slice(-4)
          : [];
        return {
          ...existing,
          optimization: {
            ...existing?.optimization,
            lastRunAt: nowIso,
            triggeredBy: trigger,
            vehicleCapacity: optimizationResult.vehicleCapacity,
            serviceDurationMinutes: planningContext.averageServiceDuration,
            planMetrics,
            alerts: triggeredAlerts.map((alert) => ({
              id: alert?.id,
              type: alert?.alert_type,
              priority: alert?.priority,
              machine_id: alert?.machine_id,
              title: alert?.title,
            })),
            history: [
              ...previousHistory,
              {
                runAt: nowIso,
                triggeredBy: trigger,
                alertIds: triggeredAlerts.map((alert) => alert?.id).filter(Boolean),
                totalStops: stopMachineIds.length,
                totalDistanceKm: optimizationResult.totalDistanceKm,
                totalDurationMinutes: optimizationResult.totalDurationMinutes,
              },
            ],
          },
          pickingListSummary: aggregatedSummary,
        };
      };

      const existingRoute = routes.find((route) => route?.next_scheduled === scheduledDate && route?.status !== 'completed');

      let persistedRoute;
      if (!existingRoute) {
        persistedRoute = await Route.create({
          name: `Optimized Route - ${format(selectedDate, 'PPP')}`,
          assigned_operator: planningContext.operator,
          status: 'planned',
          next_scheduled: scheduledDate,
          machine_ids: stopMachineIds,
          optimized_machine_order: stopMachineIds,
          estimated_duration_minutes: Math.round(planMetrics.totalDurationMinutes),
          estimated_distance_km: Number(planMetrics.totalDistanceKm?.toFixed?.(1) ?? planMetrics.totalDistanceKm),
          metadata: buildMetadata(),
        });
      } else {
        persistedRoute = await Route.update(existingRoute.id, {
          machine_ids: stopMachineIds,
          optimized_machine_order: stopMachineIds,
          status: 'planned',
          estimated_duration_minutes: Math.round(planMetrics.totalDurationMinutes),
          estimated_distance_km: Number(planMetrics.totalDistanceKm?.toFixed?.(1) ?? planMetrics.totalDistanceKm),
          metadata: buildMetadata(existingRoute.metadata),
        });
      }

      const existingVisits = await Visit.filter({ route_id: persistedRoute.id });
      const visitMap = new Map(safeArray(existingVisits).map((visit) => [visit?.machine_id, visit]));

      for (let index = 0; index < optimizationResult.stops.length; index += 1) {
        const stop = optimizationResult.stops[index];
        const visitPayload = {
          route_id: persistedRoute.id,
          machine_id: stop.machineId,
          operator: persistedRoute.assigned_operator,
          status: 'planned',
          visit_datetime: stop.eta,
          scheduled_arrival: stop.eta,
          scheduled_departure: stop.departure,
          sequence: index + 1,
          service_duration_minutes: stop.serviceDurationMinutes,
          travel_minutes: stop.travelMinutes,
          travel_distance_km: stop.travelDistanceKm,
          wait_minutes: stop.waitMinutes,
          remaining_capacity: stop.remainingCapacity,
          demand_units: stop.demandUnits,
          items_to_fill: (stop.items || []).map((item) => ({
            product_sku: item.productSku,
            product_name: item.productName,
            quantity_needed: item.needed,
            current_stock: item.currentStock,
            par_level: item.parLevel,
            slot_number: item.slotNumber,
            machine_id: item.machineId,
            machine_code: item.machineCode,
            location_name: item.locationName,
          })),
        };

        const existingVisit = visitMap.get(stop.machineId);
        if (existingVisit) {
          await Visit.update(existingVisit.id, visitPayload);
          visitMap.delete(stop.machineId);
        } else {
          await Visit.create(visitPayload);
        }
      }

      for (const remaining of visitMap.values()) {
        if (remaining?.status !== 'completed') {
          await Visit.update(remaining.id, {
            status: 'cancelled',
            cancellation_reason: 'Removed during re-optimization',
          });
        }
      }

      return Route.get(persistedRoute.id);
    },
    [routes, selectedDate]
  );

  const runOptimization = useCallback(
    async ({ trigger, alerts: triggeredAlerts = [] } = {}) => {
      const [machines, stocks, products, locations] = await Promise.all([
        Machine.list(),
        MachineStock.list(),
        Product.list(),
        Location.list(),
      ]);

      const { demandProfiles, unscheduled, averageServiceDuration } = buildDemandProfiles({
        machines,
        stocks,
        products,
        locations,
        selectedDate,
      });

      const unscheduledMachines = [...unscheduled];

      if (!demandProfiles.length) {
        setPlanningSummary({
          totalStops: 0,
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          vehicleCapacity: DEFAULT_VEHICLE_CAPACITY,
          trigger,
          triggeredAlerts: triggeredAlerts.map((alert) => ({
            id: alert?.id,
            machine_id: alert?.machine_id,
            title: alert?.title,
            alert_type: alert?.alert_type,
            priority: alert?.priority,
          })),
          unscheduled: unscheduledMachines,
        });
        return null;
      }

      const depot = chooseDepot(locations);
      const shiftStart = combineDateAndTime(selectedDate, DEFAULT_SHIFT.start);
      const shiftEnd = combineDateAndTime(selectedDate, DEFAULT_SHIFT.end);

      const optimizationResult = await optimizeRoutePlan({
        depot,
        machines: demandProfiles,
        vehicleCapacity: DEFAULT_VEHICLE_CAPACITY,
        startTime: shiftStart.toISOString(),
        endTime: shiftEnd.toISOString(),
        averageSpeedKmh: 45,
      });

      const aggregatedSummary = aggregatePickList(optimizationResult.stops);

      const persistedRoute = await persistOptimizationResult(
        optimizationResult,
        aggregatedSummary,
        trigger,
        triggeredAlerts,
        {
          operator: DEFAULT_OPERATOR_EMAIL,
          averageServiceDuration,
        }
      );

      const updatedRoutes = (prevRoutes) => {
        const filtered = prevRoutes.filter((route) => route.id !== persistedRoute.id);
        return [persistedRoute, ...filtered].sort((a, b) =>
          (a?.next_scheduled || '').localeCompare(b?.next_scheduled || '')
        );
      };

      setRoutes((prev) => updatedRoutes(prev));
      setPickingSummaries((prev) => ({ ...prev, [persistedRoute.id]: aggregatedSummary }));

      const allUnscheduled = [
        ...unscheduledMachines,
        ...safeArray(optimizationResult.unscheduled).map((machine) => ({
          id: machine?.id,
          machineCode: machine?.machineCode,
          reason: machine?.unscheduledReason || 'Unable to meet time window',
        })),
      ];

      setPlanningSummary({
        totalStops: optimizationResult.stops.length,
        totalDistanceKm: optimizationResult.totalDistanceKm,
        totalDurationMinutes: optimizationResult.totalDurationMinutes,
        vehicleCapacity: optimizationResult.vehicleCapacity,
        trigger,
        triggeredAlerts: triggeredAlerts.map((alert) => ({
          id: alert?.id,
          machine_id: alert?.machine_id,
          title: alert?.title,
          alert_type: alert?.alert_type,
          priority: alert?.priority,
        })),
        unscheduled: allUnscheduled,
      });

      return persistedRoute;
    },
    [persistOptimizationResult, selectedDate]
  );

  const maybeAutoReoptimize = useCallback(
    async (alerts) => {
      if (!alerts.length || !routes.length) return;
      const now = new Date();
      if (lastReoptRef.current && differenceInMinutes(now, lastReoptRef.current) < 5) {
        return;
      }
      lastReoptRef.current = now;
      setAutoReoptimizing(true);
      toast.warning('Critical alerts detected. Re-optimizing routes...');
      try {
        const route = await runOptimization({ trigger: 'alert', alerts });
        if (route) {
          toast.success('Routes updated based on live alerts.');
        }
      } catch (error) {
        console.error('Auto re-optimization failed', error);
        toast.error('Automatic re-optimization failed. Check console for details.');
      } finally {
        setAutoReoptimizing(false);
      }
    },
    [runOptimization, routes.length]
  );

  const fetchAlerts = useCallback(async () => {
    try {
      const alertData = await Alert.list('-alert_datetime');
      const criticalAlerts = safeArray(alertData).filter(
        (alert) =>
          alert &&
          ALERT_TRIGGER_TYPES.includes(alert.alert_type) &&
          ['open', 'triggered'].includes(alert.status || 'open')
      );
      setRelevantAlerts(criticalAlerts);
      const newAlertPresent = criticalAlerts.some((alert) => !alertIdsRef.current.has(alert.id));
      alertIdsRef.current = new Set(criticalAlerts.map((alert) => alert.id));
      if (newAlertPresent) {
        maybeAutoReoptimize(criticalAlerts);
      }
    } catch (error) {
      console.error('Failed to load alerts', error);
    }
  }, [maybeAutoReoptimize]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleGenerateRoutes = async () => {
    setLoading(true);
    try {
      const route = await runOptimization({ trigger: 'manual' });
      if (route) {
        toast.success('Optimized route created and picking lists updated.');
      } else {
        toast.info('No machines require servicing for the selected date.');
      }
    } catch (error) {
      console.error('Failed to generate routes:', error);
      toast.error('Failed to generate routes. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanningSummary = () => {
    if (!planningSummary) return null;
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Latest Optimization Summary</CardTitle>
          <CardDescription>
            Triggered by {planningSummary.trigger === 'alert' ? 'telemetry alerts' : 'manual run'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Planned Stops</p>
              <p className="text-lg font-semibold">{planningSummary.totalStops}</p>
            </div>
            <div>
              <p className="text-slate-500">Route Distance</p>
              <p className="text-lg font-semibold">{formatDistance(planningSummary.totalDistanceKm)}</p>
            </div>
            <div>
              <p className="text-slate-500">Service Time</p>
              <p className="text-lg font-semibold">{formatMinutes(planningSummary.totalDurationMinutes)}</p>
            </div>
            <div>
              <p className="text-slate-500">Vehicle Capacity</p>
              <p className="text-lg font-semibold">{planningSummary.vehicleCapacity} units</p>
            </div>
          </div>

          {planningSummary.triggeredAlerts?.length ? (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Alerts influencing plan
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {planningSummary.triggeredAlerts.map((alert) => (
                  <li key={alert.id}>
                    {alert.title || alert.alert_type} {alert.machine_id ? `• Machine ${alert.machine_id}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {planningSummary.unscheduled?.length ? (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700">Unscheduled machines</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {planningSummary.unscheduled.map((machine) => (
                  <li key={`${machine.id}-${machine.reason}`}>
                    {machine.machineCode || machine.id}: {machine.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  return (
    <FeatureGate featureKey="routes.optimization">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <Toaster />
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              Route Planner & Pre-kitting
            </h1>
            <p className="text-slate-600 mt-2">
              Generate optimized daily routes, build machine-level pick lists, and respond to live alerts.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Daily Routes</CardTitle>
              <CardDescription>
                Select a date and generate optimized routes and picking lists for your drivers.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center gap-4">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(event) => setSelectedDate(new Date(event.target.value))}
                className="border p-2 rounded-md"
              />
              <Button onClick={handleGenerateRoutes} disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : <Calendar className="w-4 h-4 mr-2" />}
                Generate Routes
              </Button>
              {autoReoptimizing && (
                <span className="flex items-center gap-2 text-sm text-amber-600">
                  <RefreshCcw className="w-4 h-4 animate-spin" /> Re-optimizing based on live alerts…
                </span>
              )}
            </CardContent>
          </Card>

          {renderPlanningSummary()}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Telemetry faults and SLA breaches will trigger re-optimization.</CardDescription>
            </CardHeader>
            <CardContent>
              {relevantAlerts.length === 0 ? (
                <p className="text-sm text-slate-500">No active telemetry or SLA alerts.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {relevantAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 p-3 rounded-md">
                      <div>
                        <p className="font-medium text-amber-800">{alert.title || alert.alert_type}</p>
                        <p className="text-amber-700">
                          Machine {alert.machine_id || 'N/A'} • Priority {alert.priority || 'standard'}
                        </p>
                      </div>
                      <Badge variant="destructive">{alert.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Routes</CardTitle>
              <CardDescription>Below are the routes planned for the selected date.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && routes.length === 0 ? (
                <LoadingSpinner text="Loading routes..." />
              ) : routes.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No routes generated. Use the panel above to create them.
                </p>
              ) : (
                <div className="space-y-4">
                  {routes.map((route) => {
                    const planned = getPlannedMetrics(route);
                    const actual = getActualMetrics(route);
                    const pickingSummary = pickingSummaries[route.id] || [];
                    const durationDelta =
                      Number.isFinite(actual.duration) && Number.isFinite(planned.duration)
                        ? actual.duration - planned.duration
                        : null;
                    const distanceDelta =
                      Number.isFinite(actual.distance) && Number.isFinite(planned.distance)
                        ? actual.distance - planned.distance
                        : null;

                    return (
                      <div key={route.id} className="border p-4 rounded-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{route.name}</h3>
                            <p className="text-slate-500">
                              {planned.stops || 0} Stops • Assigned to {route.assigned_operator}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                              <span>Planned: {formatMinutes(planned.duration)} • {formatDistance(planned.distance)}</span>
                              <span>
                                Actual: {Number.isFinite(actual.duration) ? formatMinutes(actual.duration) : 'Pending telemetry'}
                              </span>
                              <span>
                                Distance: {Number.isFinite(actual.distance) ? formatDistance(actual.distance) : 'Pending telemetry'}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                              {durationDelta !== null && (
                                <span className={durationDelta > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                  Δ Duration {durationDelta > 0 ? '+' : ''}
                                  {Math.round(durationDelta)} min
                                </span>
                              )}
                              {distanceDelta !== null && (
                                <span className={distanceDelta > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                                  Δ Distance {distanceDelta > 0 ? '+' : ''}
                                  {distanceDelta.toFixed(1)} km
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {route?.metadata?.optimization?.triggeredBy === 'alert' ? (
                              <Badge variant="destructive">Re-optimized</Badge>
                            ) : null}
                            <Badge>{route.status}</Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/routedetail?id=${route.id}`}>
                                <ListTodo className="w-4 h-4 mr-2" />
                                View Details &amp; Fill
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {pickingSummary.length ? (
                          <div className="mt-4 border-t pt-4 text-sm text-slate-600">
                            <p className="font-semibold flex items-center gap-2">
                              <Package className="w-4 h-4 text-slate-400" /> Pick list highlights
                            </p>
                            <div className="mt-2 space-y-1">
                              {pickingSummary.slice(0, 3).map((item) => (
                                <div key={item.product_sku} className="flex justify-between">
                                  <span>
                                    {item.product_name} <span className="text-slate-400">({item.product_sku})</span>
                                  </span>
                                  <span>{item.total_needed} units</span>
                                </div>
                              ))}
                              {pickingSummary.length > 3 ? (
                                <p className="text-xs text-slate-500">
                                  + {pickingSummary.length - 3} additional SKUs in picking list
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureGate>
  );
}

