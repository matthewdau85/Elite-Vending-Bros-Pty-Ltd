import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, Search, Calendar, User, AlertTriangle, 
  CheckCircle, XCircle, Eye, Filter, Download
} from 'lucide-react';
import { AuditLog } from '@/api/entities';
import { toast } from 'sonner';
import { format } from 'date-fns';
import LoadingSpinner from '../shared/LoadingSpinner';
import { usePagination } from '../shared/usePagination';

export default function AuditViewer() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const {
    currentPage,
    itemsPerPage,
    totalItems,
    paginatedItems,
    goToPage,
    setItems
  } = usePagination();

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const logs = await AuditLog.list('-timestamp', 1000);
      setAuditLogs(logs);
      setItems(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [setItems]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.correlation_id.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesStatus && matchesAction;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const getRiskColor = (riskScore) => {
    if (!riskScore) return 'bg-gray-100 text-gray-800';
    if (riskScore >= 80) return 'bg-red-100 text-red-800';
    if (riskScore >= 60) return 'bg-amber-100 text-amber-800';
    if (riskScore >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  const exportAuditLogs = () => {
    const csvData = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      user_email: log.user_email,
      action: log.action,
      status: log.status,
      ip_address: log.ip_address,
      correlation_id: log.correlation_id,
      details: log.details
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-600" />
            Audit Trail
          </h2>
          <p className="text-slate-600">Complete record of privileged actions and security events</p>
        </div>
        <Button onClick={exportAuditLogs} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search user, action, or correlation ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-slate-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {filteredLogs.length} events found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {paginatedItems(filteredLogs).map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedLog(log);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(log.status)}
                        <span className="font-medium text-slate-900">{log.action}</span>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        {log.step_up_token_used && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Step-up Auth
                          </Badge>
                        )}
                        {log.risk_score && (
                          <Badge className={getRiskColor(log.risk_score)}>
                            Risk: {log.risk_score}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {log.user_email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {log.ip_address}
                        </div>
                      </div>
                      
                      {log.details && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Audit Log Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Event Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Action:</strong> {selectedLog.action}</div>
                    <div><strong>Status:</strong> 
                      <Badge className={`ml-2 ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                    <div><strong>Timestamp:</strong> {format(new Date(selectedLog.timestamp), 'PPpp')}</div>
                    <div><strong>Correlation ID:</strong> <code className="bg-slate-100 px-1 rounded">{selectedLog.correlation_id}</code></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {selectedLog.user_email}</div>
                    <div><strong>Role:</strong> {selectedLog.user_role}</div>
                    <div><strong>IP Address:</strong> {selectedLog.ip_address}</div>
                    {selectedLog.session_id && <div><strong>Session ID:</strong> <code className="bg-slate-100 px-1 rounded">{selectedLog.session_id}</code></div>}
                  </div>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Details</h4>
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    {selectedLog.details}
                  </div>
                </div>
              )}

              {selectedLog.geo_location && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Location</h4>
                  <div className="text-sm">
                    {selectedLog.geo_location.city}, {selectedLog.geo_location.region}, {selectedLog.geo_location.country}
                  </div>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">User Agent</h4>
                  <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono">
                    {selectedLog.user_agent}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}