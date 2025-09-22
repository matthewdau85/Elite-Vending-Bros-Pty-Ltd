import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Device, DeviceAssignment, DeviceAuditLog, DeviceRMA, DeviceErrorLog 
} from '@/api/entities';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { 
  Smartphone, Wifi, WifiOff, Battery, BatteryLow,
  Search, Filter, Download, Upload, MoreHorizontal,
  AlertTriangle, CheckCircle, Clock, Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import FeatureGate from '../components/features/FeatureGate';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Device Fleet Components
import DeviceInventoryTable from '../components/devices/DeviceInventoryTable';
import DeviceHealthMatrix from '../components/devices/DeviceHealthMatrix';
import BulkDeviceOperations from '../components/devices/BulkDeviceOperations';
import DeviceAssignmentDialog from '../components/devices/DeviceAssignmentDialog';
import DeviceRMADialog from '../components/devices/DeviceRMADialog';

export default function DeviceFleet() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showRMADialog, setShowRMADialog] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const allDevices = await Device.list('-created_date');
      setDevices(allDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load device fleet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = !searchTerm || 
      device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesType = typeFilter === 'all' || device.device_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    const colors = {
      inventory: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800', 
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      rma: 'bg-red-100 text-red-800',
      retired: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getHealthStatus = (device) => {
    if (!device.last_heartbeat) return 'unknown';
    
    const lastSeen = new Date(device.last_heartbeat);
    const now = new Date();
    const hoursSince = (now - lastSeen) / (1000 * 60 * 60);
    
    if (hoursSince > 24) return 'offline';
    if (hoursSince > 4) return 'warning';
    if (device.error_flags?.length > 0) return 'error';
    return 'healthy';
  };

  const handleBulkAssign = () => {
    if (selectedDevices.length === 0) {
      toast.error('Please select devices to assign');
      return;
    }
    setShowAssignDialog(true);
  };

  const handleBulkRMA = () => {
    if (selectedDevices.length === 0) {
      toast.error('Please select devices for RMA');
      return;
    }
    setShowRMADialog(true);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <LoadingSpinner text="Loading device fleet..." />
      </div>
    );
  }

  return (
    <FeatureGate feature="devices.fleet">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <Toaster />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Device Fleet</h1>
            <p className="text-slate-600 mt-1">
              Manage {devices.length} devices across your network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FeatureGate feature="devices.bulkops">
              <Button 
                variant="outline"
                onClick={handleBulkAssign}
                disabled={selectedDevices.length === 0}
              >
                Bulk Assign ({selectedDevices.length})
              </Button>
              <Button 
                variant="outline"
                onClick={handleBulkRMA}
                disabled={selectedDevices.length === 0}
              >
                Bulk RMA ({selectedDevices.length})
              </Button>
            </FeatureGate>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Devices</p>
                  <p className="text-2xl font-bold">{devices.length}</p>
                </div>
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {devices.filter(d => d.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Offline</p>
                  <p className="text-2xl font-bold text-red-600">
                    {devices.filter(d => getHealthStatus(d) === 'offline').length}
                  </p>
                </div>
                <WifiOff className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">In RMA</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {devices.filter(d => d.status === 'rma').length}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search devices by ID, model, or serial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="inventory">Inventory</option>
                <option value="assigned">Assigned</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="rma">RMA</option>
                <option value="retired">Retired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="payment_terminal">Payment Terminal</option>
                <option value="telemetry_unit">Telemetry Unit</option>
                <option value="camera">Camera</option>
                <option value="sensor">Sensor</option>
                <option value="router">Router</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">Device Inventory</TabsTrigger>
            <TabsTrigger value="health">Health Matrix</TabsTrigger>
            <TabsTrigger value="operations">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <DeviceInventoryTable
              devices={filteredDevices}
              selectedDevices={selectedDevices}
              setSelectedDevices={setSelectedDevices}
              onDeviceUpdate={loadDevices}
              getStatusColor={getStatusColor}
              getHealthStatus={getHealthStatus}
            />
          </TabsContent>

          <TabsContent value="health">
            <DeviceHealthMatrix 
              devices={filteredDevices}
              getHealthStatus={getHealthStatus}
            />
          </TabsContent>

          <TabsContent value="operations">
            <FeatureGate feature="devices.bulkops">
              <BulkDeviceOperations
                devices={devices}
                onDevicesUpdate={loadDevices}
              />
            </FeatureGate>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {showAssignDialog && (
          <DeviceAssignmentDialog
            devices={selectedDevices.map(id => devices.find(d => d.id === id))}
            onClose={() => setShowAssignDialog(false)}
            onSuccess={() => {
              loadDevices();
              setSelectedDevices([]);
              setShowAssignDialog(false);
            }}
          />
        )}

        {showRMADialog && (
          <DeviceRMADialog
            devices={selectedDevices.map(id => devices.find(d => d.id === id))}
            onClose={() => setShowRMADialog(false)}
            onSuccess={() => {
              loadDevices();
              setSelectedDevices([]);
              setShowRMADialog(false);
            }}
          />
        )}
      </div>
    </FeatureGate>
  );
}