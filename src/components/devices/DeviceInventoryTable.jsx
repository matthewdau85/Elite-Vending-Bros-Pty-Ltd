import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, Wifi, WifiOff, Battery, BatteryLow,
  MapPin, Calendar, AlertTriangle, CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

export default function DeviceInventoryTable({ 
  devices, 
  selectedDevices, 
  setSelectedDevices,
  onDeviceUpdate,
  getStatusColor,
  getHealthStatus 
}) {
  const [sortField, setSortField] = useState('device_id');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDevices(devices.map(d => d.id));
    } else {
      setSelectedDevices([]);
    }
  };

  const handleSelectDevice = (deviceId, checked) => {
    if (checked) {
      setSelectedDevices(prev => [...prev, deviceId]);
    } else {
      setSelectedDevices(prev => prev.filter(id => id !== deviceId));
    }
  };

  const sortedDevices = [...devices].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    return sortDirection === 'asc' 
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });

  const getHealthIcon = (device) => {
    const health = getHealthStatus(device);
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-gray-400" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getBatteryIcon = (level) => {
    if (!level) return null;
    return level > 20 
      ? <Battery className="w-4 h-4 text-green-600" />
      : <BatteryLow className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-left">
                  <Checkbox
                    checked={selectedDevices.length === devices.length && devices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-left font-medium text-slate-600">Health</th>
                <th className="p-4 text-left font-medium text-slate-600">Device</th>
                <th className="p-4 text-left font-medium text-slate-600">Type</th>
                <th className="p-4 text-left font-medium text-slate-600">Status</th>
                <th className="p-4 text-left font-medium text-slate-600">Assignment</th>
                <th className="p-4 text-left font-medium text-slate-600">Last Seen</th>
                <th className="p-4 text-left font-medium text-slate-600">Firmware</th>
                <th className="p-4 text-left font-medium text-slate-600">Battery</th>
                <th className="p-4 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDevices.map((device) => (
                <tr key={device.id} className="border-b hover:bg-slate-50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedDevices.includes(device.id)}
                      onCheckedChange={(checked) => handleSelectDevice(device.id, checked)}
                    />
                  </td>
                  <td className="p-4">
                    {getHealthIcon(device)}
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-slate-900">{device.device_id}</div>
                      <div className="text-sm text-slate-500">
                        {device.manufacturer} {device.model}
                      </div>
                      {device.serial_number && (
                        <div className="text-xs text-slate-400">S/N: {device.serial_number}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize">
                      {device.device_type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {device.assigned_machine_id ? (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="w-3 h-3" />
                        Machine {device.assigned_machine_id.slice(-6)}
                      </div>
                    ) : device.assigned_location_id ? (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="w-3 h-3" />
                        Location
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    {device.last_heartbeat ? (
                      <div className="text-sm text-slate-600">
                        {format(new Date(device.last_heartbeat), 'MMM d, HH:mm')}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Never</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-mono text-slate-600">
                      {device.firmware_version || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4">
                    {device.battery_level ? (
                      <div className="flex items-center gap-1">
                        {getBatteryIcon(device.battery_level)}
                        <span className="text-sm text-slate-600">{device.battery_level}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAssignDevice(device)}>
                          Assign/Reassign
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(device)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInitiateRMA(device)}>
                          Initiate RMA
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateFirmware(device)}>
                          Update Firmware
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No devices found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function handleAssignDevice(device) {
    // TODO: Implement assignment dialog
    console.log('Assign device:', device);
  }

  function handleViewDetails(device) {
    // TODO: Implement device details view
    console.log('View device details:', device);
  }

  function handleInitiateRMA(device) {
    // TODO: Implement RMA initiation
    console.log('Initiate RMA:', device);
  }

  function handleUpdateFirmware(device) {
    // TODO: Implement firmware update
    console.log('Update firmware:', device);
  }
}