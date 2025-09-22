
import React, { useState, useEffect } from "react";
import { AuditLog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Shield,
  Search,
  Download,
  Copy,
  Calendar,
  User,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { safeArray, safeIncludes } from "../components/shared/SearchUtils";
import RequireRole from "../components/auth/RequireRole";
import { toast } from "sonner";
import { usePagination } from "../components/shared/usePagination";
import EmptyState from '../components/shared/EmptyState';
import ContextHelp from '../components/help/ContextHelp';

const statusColors = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800"
};

const actionColors = {
  WIPE_ALL_DATA: "bg-red-100 text-red-800",
  VIEW_BACKUP_STATUS: "bg-blue-100 text-blue-800",
  REQUEST_STEP_UP: "bg-orange-100 text-orange-800"
};

export default function AdminAudit() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await AuditLog.list("-timestamp", 500);
      setAuditLogs(safeArray(logs));
    } catch (error) {
      console.error("Error loading audit logs:", error);
      setAuditLogs([]);
    }
    setIsLoading(false);
  };

  const filteredLogs = safeArray(auditLogs).filter(log => {
    if (!log) return false;

    const matchesSearch =
      safeIncludes(log.user_email, searchTerm) ||
      safeIncludes(log.action, searchTerm) ||
      safeIncludes(log.correlation_id, searchTerm) ||
      safeIncludes(log.details, searchTerm);

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesStatus && matchesAction;
  });

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedLogs,
    startIndex,
    endIndex
  } = usePagination(filteredLogs, 50);

  const copyCorrelationId = (correlationId) => {
    navigator.clipboard.writeText(correlationId);
    toast.success("Correlation ID copied to clipboard");
  };

  const exportToCsv = () => {
    const csvHeaders = [
      "Timestamp",
      "User Email",
      "User Role",
      "Action",
      "Status",
      "IP Address",
      "Correlation ID",
      "Details"
    ];

    const csvData = filteredLogs.map(log => [
      log.timestamp,
      log.user_email,
      log.user_role || '',
      log.action,
      log.status,
      log.ip_address || '',
      log.correlation_id,
      `"${(log.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    toast.success("Audit log exported to CSV");
  };

  const uniqueActions = [...new Set(safeArray(auditLogs).map(log => log.action).filter(Boolean))];

  return (
    <RequireRole requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Audit Trail
              </h1>
              <p className="text-slate-600 mt-1 flex items-center gap-1">
                Immutable log of all privileged actions and security events
                <ContextHelp articleSlug="understanding-audit-trail" />
              </p>
            </div>
            <Button onClick={exportToCsv} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm font-medium text-slate-600">Total Events</p>
                <p className="text-2xl font-bold text-slate-900">{filteredLogs.length}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-green-50">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div> {/* Closing div for flex items-center justify-between */}
              </CardHeader> {/* Closing CardHeader */}
                <CardContent className="pt-0">
                  <p className="text-sm font-medium text-slate-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {auditLogs.length > 0
                      ? Math.round((auditLogs.filter(log => log.status === 'success').length / auditLogs.length) * 100)
                      : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-purple-50">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm font-medium text-slate-600">Unique Users</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Set(auditLogs.map(log => log.user_email)).size}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-8 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search logs..."
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
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failure">Failure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Action</label>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {uniqueActions.map(action => (
                          <SelectItem key={action} value={action}>
                            {action.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={loadAuditLogs} className="w-full">
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Audit Events ({filteredLogs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Correlation ID</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(10).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className="p-4">
                              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : paginatedLogs.length > 0 ? (
                        paginatedLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{log.user_email}</div>
                                {log.user_role && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {log.user_role}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={actionColors[log.action] || "bg-gray-100 text-gray-800"}>
                                {log.action.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[log.status] || "bg-gray-100 text-gray-800"}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.ip_address || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => copyCorrelationId(log.correlation_id)}
                                className="flex items-center gap-1 text-xs font-mono text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded px-2 py-1"
                              >
                                <Copy className="w-3 h-3" />
                                {log.correlation_id?.substring(0, 8)}...
                              </button>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate text-sm text-slate-600" title={log.details}>
                                {log.details}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <EmptyState
                              icon={Search}
                              title="No audit logs found"
                              description="Try adjusting your search or filters. Audit events will appear here as they are generated."
                              helpArticleSlug="understanding-audit-trail"
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {endIndex} of {filteredLogs.length} results
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireRole>
      );
}
