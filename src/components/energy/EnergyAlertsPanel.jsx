import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, TrendingUp, Zap, Thermometer, 
  Clock, CheckCircle, XCircle, Bell, Search,
  Filter, Calendar
} from 'lucide-react';
import { Alert, Machine } from '@/api/entities';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function EnergyAlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [alertData, machineData] = await Promise.all([
        Alert.filter({ 
          alert_type: { $in: ['temperature_alarm', 'high_energy_consumption', 'energy_spike', 'cooling_failure'] }
        }, '-alert_datetime'),
        Machine.list()
      ]);
      setAlerts(alertData);
      setMachines(machineData);
    } catch (error) {
      console.error('Error loading energy alerts:', error);
      toast.error('Failed to load energy alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alert) => {
    try {
      await Alert.update(alert.id, {
        status: 'acknowledged',
        acknowledged_by: 'current_user', // In real app, get from user context
        acknowledged_at: new Date().toISOString()
      });
      toast.success('Alert acknowledged');
      loadAlerts();
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alert) => {
    try {
      const resolution = prompt('Enter resolution notes:');
      if (!resolution) return;

      await Alert.update(alert.id, {
        status: 'resolved',
        resolved_by: 'current_user',
        resolved_at: new Date().toISOString(),
        resolution_notes: resolution
      });
      toast.success('Alert resolved');
      loadAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      'temperature_alarm': Thermometer,
      'high_energy_consumption': TrendingUp,
      'energy_spike': Zap,
      'cooling_failure': AlertTriangle
    };
    return icons[type] || AlertTriangle;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'triggered': 'bg-red-100 text-red-800',
      'acknowledged': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'ignored': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatAlertTime = (dateTime) => {
    const date = new Date(dateTime);
    if (isToday(date)) {
      return `Today ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const machine = machines.find(m => m.id === alert.machine_id);
    const machineName = machine?.machine_id || '';
    
    const searchMatch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machineName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || alert.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || alert.priority === priorityFilter;
    
    return searchMatch && statusMatch && priorityMatch;
  });

  if (loading) {
    return <LoadingSpinner text="Loading energy alerts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Energy Alerts</h2>
          <p className="text-slate-600">Monitor and manage energy-related alerts and notifications</p>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.priority === 'critical').length}
                </div>
                <p className="text-sm text-slate-600">Critical</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.priority === 'high').length}
                </div>
                <p className="text-sm text-slate-600">High Priority</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.status === 'acknowledged').length}
                </div>
                <p className="text-sm text-slate-600">Acknowledged</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.status === 'resolved').length}
                </div>
                <p className="text-sm text-slate-600">Resolved</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search alerts or machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="triggered">Triggered</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const machine = machines.find(m => m.id === alert.machine_id);
          const Icon = getAlertIcon(alert.alert_type);
          
          return (
            <Card key={alert.id} className={`border-l-4 ${
              alert.priority === 'critical' ? 'border-l-red-500' :
              alert.priority === 'high' ? 'border-l-orange-500' :
              alert.priority === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      alert.priority === 'critical' ? 'bg-red-100' :
                      alert.priority === 'high' ? 'bg-orange-100' :
                      alert.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        alert.priority === 'critical' ? 'text-red-600' :
                        alert.priority === 'high' ? 'text-orange-600' :
                        alert.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Machine: {machine?.machine_id || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatAlertTime(alert.alert_datetime)}</span>
                        {alert.acknowledged_at && (
                          <>
                            <span>•</span>
                            <span>Acknowledged by {alert.acknowledged_by}</span>
                          </>
                        )}
                      </div>
                      
                      {alert.resolution_notes && (
                        <div className="p-3 bg-green-50 rounded-lg mt-3">
                          <p className="text-sm text-green-800">
                            <strong>Resolution:</strong> {alert.resolution_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {alert.status === 'triggered' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledgeAlert(alert)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                    {['triggered', 'acknowledged'].includes(alert.status) && (
                      <Button 
                        size="sm"
                        onClick={() => handleResolveAlert(alert)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Energy Alerts</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'No alerts match your current filters'
                  : 'All energy systems are operating normally'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}