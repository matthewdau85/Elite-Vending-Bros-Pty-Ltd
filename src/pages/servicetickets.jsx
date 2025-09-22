
import React, { useState, useEffect } from 'react';
import { ServiceTicket, Machine, Location } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Wrench,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import ServiceTicketCard from '../components/service/ServiceTicketCard';
import TicketCreateDrawer from '../components/service/TicketCreateDrawer';
import PageHeader from '../components/shared/PageHeader';
import { TableSkeleton } from '../components/shared/Skeletons';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

const FILTER_OPTIONS = {
  status: [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' }
  ],
  priority: [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ],
  timeframe: [
    { value: 'all', label: 'Any Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ]
};

export default function ServiceTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    timeframe: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, machinesData, locationsData] = await Promise.all([
        ServiceTicket.list('-created_date', 200),
        Machine.list(),
        Location.list()
      ]);
      
      // Normalize response data in case it comes in different formats
      setTickets(Array.isArray(ticketsData) ? ticketsData : (ticketsData?.items ?? []));
      setMachines(Array.isArray(machinesData) ? machinesData : (machinesData?.items ?? []));
      setLocations(Array.isArray(locationsData) ? locationsData : (locationsData?.items ?? []));
    } catch (error) {
      console.error('Error loading service tickets:', error);
      toast.error('Failed to load service tickets');
      // Set empty arrays on error to prevent crashes
      setTickets([]);
      setMachines([]);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and search
  const filteredTickets = (tickets ?? []).filter(ticket => {
    if (!ticket) return false;
    
    // Search filter
    if (searchTerm && !ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ticket.reporter_email?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && ticket.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) {
      return false;
    }

    // Timeframe filter
    if (filters.timeframe !== 'all' && ticket.created_date) {
      const ticketDate = new Date(ticket.created_date);
      const now = new Date();
      
      switch (filters.timeframe) {
        case 'today':
          if (ticketDate < startOfDay(now) || ticketDate > endOfDay(now)) return false;
          break;
        case 'week':
          if (ticketDate < subDays(startOfDay(now), 7)) return false;
          break;
        case 'month':
          if (ticketDate < subDays(startOfDay(now), 30)) return false;
          break;
      }
    }

    return true;
  });

  // Separate tickets by completion status
  const activeTickets = filteredTickets.filter(ticket => 
    ['open', 'assigned', 'in_progress', 'blocked'].includes(ticket?.status)
  );
  
  const completedTickets = filteredTickets.filter(ticket => 
    ['completed', 'cancelled'].includes(ticket?.status)
  );

  const handleTicketAdded = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    setShowCreateDrawer(false);
  };

  const breadcrumbs = [
    { label: 'Service Tickets', href: '/servicetickets' }
  ];

  const actions = (
    <Button onClick={() => setShowCreateDrawer(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Create Ticket
    </Button>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader
          title="Service Tickets"
          description="Manage and track service requests"
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Service Tickets"
        description="Manage and track service requests"
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{activeTickets?.length ?? 0}</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">
                {activeTickets?.filter(t => ['high', 'urgent'].includes(t?.priority))?.length ?? 0}
              </span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {completedTickets?.filter(t => {
                  if (!t?.completed_at) return false;
                  const completedDate = new Date(t.completed_at);
                  const today = new Date();
                  return completedDate >= startOfDay(today) && completedDate <= endOfDay(today);
                })?.length ?? 0}
              </span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{tickets?.length ?? 0}</span>
              <Wrench className="w-5 h-5 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.status.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={filters.priority} 
                onValueChange={(value) => setFilters(prev => ({...prev, priority: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.priority.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select 
                value={filters.timeframe} 
                onValueChange={(value) => setFilters(prev => ({...prev, timeframe: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.timeframe.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Tabs */}
      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active <Badge variant="secondary">{activeTickets?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed <Badge variant="secondary">{completedTickets?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ErrorBoundary>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeTickets?.map(ticket => (
                  <ServiceTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    machines={machines}
                    locations={locations}
                    onUpdate={loadData}
                    onClick={(ticket) => {
                      // Navigate to ticket detail
                      toast.info(`Opening ticket ${ticket.id}`);
                    }}
                  />
                ))}
              </div>
            </ErrorBoundary>
            
            {(activeTickets?.length ?? 0) === 0 && (
              <Card className="p-12 text-center">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Active Tickets</h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || filters.status !== 'all' || filters.priority !== 'all' 
                    ? 'No tickets match your current filters.'
                    : 'All service tickets are resolved. Great work!'
                  }
                </p>
                {(!searchTerm && filters.status === 'all' && filters.priority === 'all') && (
                  <Button onClick={() => setShowCreateDrawer(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Ticket
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <ErrorBoundary>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {completedTickets?.map(ticket => (
                  <ServiceTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    machines={machines}
                    locations={locations}
                    onUpdate={loadData}
                    onClick={(ticket) => {
                      toast.info(`Opening ticket ${ticket.id}`);
                    }}
                  />
                ))}
              </div>
            </ErrorBoundary>
            
            {(completedTickets?.length ?? 0) === 0 && (
              <Card className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Completed Tickets</h3>
                <p className="text-slate-500">
                  {searchTerm || filters.status !== 'all' || filters.priority !== 'all' 
                    ? 'No completed tickets match your current filters.'
                    : 'No tickets have been completed yet.'
                  }
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      <TicketCreateDrawer
        open={showCreateDrawer}
        setOpen={setShowCreateDrawer}
        onTicketAdded={handleTicketAdded}
      />
    </div>
  );
}
