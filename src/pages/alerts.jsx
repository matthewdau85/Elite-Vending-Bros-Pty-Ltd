import React, { useState, useEffect } from "react";
import { Alert, Machine, Location, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  Printer
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { safeArray, safeIncludes } from "../components/utils/safe";

import AlertsOverview from "../components/alerts/AlertsOverview";
import AlertsList from "../components/alerts/AlertsList";
import AlertDetailsDialog from "../components/alerts/AlertDetailsDialog";
import BulkActionsBar from "../components/alerts/BulkActionsBar";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
          const user = await User.me();
          setCurrentUser(user);
          await loadData();
        } catch (e) {
          console.error("User not authenticated, or failed to load data", e);
          setCurrentUser(null); // Set currentUser to null if authentication fails
        } finally {
          setIsLoading(false);
        }
    };
    loadInitialData();
  }, []);

  const loadData = async () => {
    // No need to set loading here as it's handled by the initial loader
    try {
      const [alertsData, machinesData, locationsData] = await Promise.all([
        Alert.list("-alert_datetime"),
        Machine.list(),
        Location.list()
      ]);

      setAlerts(safeArray(alertsData));
      setMachines(safeArray(machinesData));
      setLocations(safeArray(locationsData));
    } catch (error) {
      console.error("Error loading alerts data:", error);
      setAlerts([]);
      setMachines([]);
      setLocations([]);
    }
  };

  const filteredAlerts = safeArray(alerts).filter(alert => {
    if (!alert) return false;

    // Use safeIncludes for search functionality
    const matchesSearch =
      safeIncludes(alert.title, searchTerm) ||
      safeIncludes(alert.description, searchTerm) ||
      safeIncludes(alert.machine_id, searchTerm);

    const matchesStatus = statusFilter === "all" || (alert?.status || "") === statusFilter;
    const matchesPriority = priorityFilter === "all" || (alert?.priority || "") === priorityFilter;
    const matchesType = typeFilter === "all" || (alert?.alert_type || "") === typeFilter;
    const matchesMachine = machineFilter === "all" || alert?.machine_id === machineFilter;

    let matchesLocation = true;
    if (locationFilter !== "all") {
      const machine = safeArray(machines).find(m => m && m.id === alert?.machine_id);
      matchesLocation = machine && machine.location_id === locationFilter;
    }

    return matchesSearch && matchesStatus && matchesPriority &&
           matchesType && matchesMachine && matchesLocation;
  });

  const handleBulkAcknowledge = async () => {
    if (!currentUser) return; // Guard against no user
    try {
      const updatePromises = selectedAlerts.map(alertId =>
        Alert.update(alertId, {
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: currentUser.email
        })
      );
      await Promise.all(updatePromises);
      setSelectedAlerts([]);
      loadData();
    } catch (error) {
      console.error("Error acknowledging alerts:", error);
    }
  };

  const handleBulkResolve = async () => {
    if (!currentUser) return; // Guard against no user
    try {
      const updatePromises = selectedAlerts.map(alertId =>
        Alert.update(alertId, {
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: currentUser.email
        })
      );
      await Promise.all(updatePromises);
      setSelectedAlerts([]);
      loadData();
    } catch (error) {
      console.error("Error resolving alerts:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAlerts.length} selected alerts? This action cannot be undone.`)) {
      try {
        const deletePromises = selectedAlerts.map(alertId =>
          Alert.delete(alertId)
        );
        await Promise.all(deletePromises);
        setSelectedAlerts([]);
        loadData();
      } catch (error) {
          console.error("Error deleting alerts:", error);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert?.id).filter(Boolean));
    }
  };

  const getAlertCounts = () => {
    const alertList = safeArray(alerts);
    return {
      total: alertList.length,
      open: alertList.filter(a => a?.status === "open").length,
      acknowledged: alertList.filter(a => a?.status === "acknowledged").length,
      resolved: alertList.filter(a => a?.status === "resolved").length,
      critical: alertList.filter(a => a?.priority === "critical").length
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const alertCounts = getAlertCounts();

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alert Center</h1>
            <p className="text-slate-600 mt-1">
              View, manage, and resolve all system alerts
            </p>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Overview Stats */}
        <AlertsOverview counts={alertCounts} isLoading={isLoading} />

        {/* Filters and Search */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="machine_offline">Machine Offline</SelectItem>
                    <SelectItem value="temperature_alarm">Temperature</SelectItem>
                    <SelectItem value="maintenance_due">Maintenance</SelectItem>
                    <SelectItem value="vend_failure">Vend Failure</SelectItem>
                    <SelectItem value="door_open">Door Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Machine</label>
                <Select value={machineFilter} onValueChange={setMachineFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Machines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Machines</SelectItem>
                    {machines.map(machine => (
                      <SelectItem key={machine.id} value={machine.id}>
                        Machine {machine.machine_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedAlerts.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedAlerts.length}
            onAcknowledge={handleBulkAcknowledge}
            onResolve={handleBulkResolve}
            onDelete={handleBulkDelete}
            onClear={() => setSelectedAlerts([])}
          />
        )}

        {/* Alerts List */}
        <AlertsList
          alerts={filteredAlerts}
          machines={machines}
          locations={locations}
          selectedAlerts={selectedAlerts}
          onSelectAlert={(alertId) => {
            setSelectedAlerts(prev =>
              prev.includes(alertId)
                ? prev.filter(id => id !== alertId)
                : [...prev, alertId]
            );
          }}
          onSelectAll={handleSelectAll}
          onViewAlert={setSelectedAlert}
          onUpdateAlert={loadData}
          isLoading={isLoading}
        />

        {/* Alert Details Dialog */}
        <AlertDetailsDialog
          alert={selectedAlert}
          machine={selectedAlert ? machines.find(m => m.id === selectedAlert.machine_id) : null}
          location={selectedAlert ? locations.find(l => {
            const machine = machines.find(m => m.id === selectedAlert.machine_id);
            return machine && l.id === machine.location_id;
          }) : null}
          open={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={loadData}
        />
      </div>
    </div>
  );
}