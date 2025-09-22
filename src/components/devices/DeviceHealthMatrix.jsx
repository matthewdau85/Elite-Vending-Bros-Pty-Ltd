import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, AlertTriangle, WifiOff, Battery, BatteryLow,
  Smartphone, Router, Camera, Wrench, Download
} from 'lucide-react';

export default function DeviceHealthMatrix({ devices, getHealthStatus }) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedHealth, setSelectedHealth] = useState('all');

  const healthStats = useMemo(() => {
    const stats = {
      healthy: 0,
      warning: 0,
      error: 0,
      offline: 0,
      unknown: 0
    };

    devices.forEach(device => {
      const health = getHealthStatus(device);
      stats[health]++;
    });

    return stats;
  }, [devices, getHealthStatus]);

  const firmwareMatrix = useMemo(() => {
    const matrix = {};
    
    devices.forEach(device => {
      const key = `${device.manufacturer}-${device.model}`;
      if (!matrix[key]) {
        matrix[key] = {};
      }
      
      const fw = device.firmware_version || 'Unknown';
      if (!matrix[key][fw]) {
        matrix[key][fw] = 0;
      }
      matrix[key][fw]++;
    });

    return matrix;
  }, [devices]);

  const filteredDevices = devices.filter(device => {
    const typeMatch = selectedType === 'all' || device.device_type === selectedType;
    const healthMatch = selectedHealth === 'all' || getHealthStatus(device) === selectedHealth;
    return typeMatch && healthMatch;
  });

  const getHealthColor = (health) => {
    const colors = {
      healthy: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      error: 'text-red-600 bg-red-50',
      offline: 'text-gray-600 bg-gray-50',
      unknown: 'text-slate-600 bg-slate-50'
    };
    return colors[health] || colors.unknown;
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertTriangle className="w-5 h-5" />;
      case 'offline': return <WifiOff className="w-5 h-5" />;
      default: return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment_terminal': return <Smartphone className="w-4 h-4" />;
      case 'telemetry_unit': return <Router className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  const exportFirmwareMatrix = () => {
    const csvData = ['Device Model,Firmware Version,Count'];
    
    Object.entries(firmwareMatrix).forEach(([model, versions]) => {
      Object.entries(versions).forEach(([version, count]) => {
        csvData.push(`"${model}","${version}",${count}`);
      });
    });

    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'firmware-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(healthStats).map(([health, count]) => (
              <div
                key={health}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedHealth === health ? 'border-blue-500' : 'border-transparent'
                } ${getHealthColor(health)}`}
                onClick={() => setSelectedHealth(selectedHealth === health ? 'all' : health)}
              >
                <div className="flex items-center justify-between mb-2">
                  {getHealthIcon(health)}
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm font-medium capitalize">{health}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Device Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="payment_terminal">Payment Terminal</option>
                <option value="telemetry_unit">Telemetry Unit</option>
                <option value="camera">Camera</option>
                <option value="sensor">Sensor</option>
                <option value="router">Router</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedHealth('all');
                }}
                className="h-10"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Device Status Grid 
            <span className="text-sm font-normal text-slate-600 ml-2">
              ({filteredDevices.length} devices)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDevices.map((device) => {
              const health = getHealthStatus(device);
              return (
                <div
                  key={device.id}
                  className={`p-4 border rounded-lg ${getHealthColor(health)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(device.device_type)}
                      <span className="font-medium text-sm">{device.device_id}</span>
                    </div>
                    {getHealthIcon(health)}
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div>{device.manufacturer} {device.model}</div>
                    <div className="font-mono">{device.firmware_version || 'No FW'}</div>
                    {device.battery_level && (
                      <div className="flex items-center gap-1">
                        {device.battery_level > 20 ? (
                          <Battery className="w-3 h-3 text-green-600" />
                        ) : (
                          <BatteryLow className="w-3 h-3 text-red-600" />
                        )}
                        <span>{device.battery_level}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Firmware Version Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Firmware Version Matrix</CardTitle>
            <Button variant="outline" onClick={exportFirmwareMatrix}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Device Model</th>
                  <th className="text-left p-2 font-medium">Firmware Versions</th>
                  <th className="text-right p-2 font-medium">Total Devices</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(firmwareMatrix).map(([model, versions]) => {
                  const totalDevices = Object.values(versions).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={model} className="border-b">
                      <td className="p-2 font-medium">{model}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(versions).map(([version, count]) => (
                            <Badge key={version} variant="outline" className="text-xs">
                              {version} ({count})
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 text-right font-medium">{totalDevices}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}