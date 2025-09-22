
import React, { useState, useEffect, useCallback } from 'react';
import { ServiceTicket, Machine } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, Navigation, Camera, AlertTriangle, 
  CheckCircle, Clock, Package, FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import TicketWorkflow from './TicketWorkflow';
import PartTracker from './PartTracker';
import OfflineStorage from '../shared/OfflineStorage';

export default function TechDashboard({ user, isOnline, setSyncStatus, setPendingChanges }) {
  const [activeTickets, setActiveTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTechData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load from cache first
      const cachedTickets = await OfflineStorage.get('activeTickets');
      if (cachedTickets) {
        setActiveTickets(cachedTickets);
      }

      // Update from server if online
      if (isOnline) {
        const tickets = await ServiceTicket.filter({
          assigned_to: user.email,
          status: ['open', 'assigned', 'in_progress']
        });
        setActiveTickets(tickets);
        await OfflineStorage.set('activeTickets', tickets);
      }
    } catch (error) {
      console.error('Error loading tech data:', error);
      toast.error('Failed to load service tickets');
    } finally {
      setLoading(false);
    }
  }, [isOnline, user?.email]);

  useEffect(() => {
    loadTechData();
  }, [loadTechData]);

  const updateTicket = async (ticketId, data) => {
    try {
      if (isOnline) {
        await ServiceTicket.update(ticketId, data);
      } else {
        await OfflineStorage.queueUpdate('ticket', ticketId, data);
        setPendingChanges(prev => prev + 1);
      }

      // Update local state
      setActiveTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, ...data } : t
      ));

      toast.success('Ticket updated');
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading service tickets...</div>;
  }

  if (activeTickets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No active service tickets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeTickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onUpdate={updateTicket}
          isOnline={isOnline}
          getPriorityColor={getPriorityColor}
        />
      ))}
    </div>
  );
}

function TicketCard({ ticket, onUpdate, isOnline, getPriorityColor }) {
  const [machine, setMachine] = useState(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showPartTracker, setShowPartTracker] = useState(false);

  const loadMachineData = useCallback(async () => {
    try {
      if (ticket.machine_id) {
        const machineData = await Machine.get(ticket.machine_id);
        setMachine(machineData);
      }
    } catch (error) {
      console.error('Failed to load machine data:', error);
    }
  }, [ticket.machine_id]);

  useEffect(() => {
    loadMachineData();
  }, [loadMachineData]);

  const startWork = () => {
    onUpdate(ticket.id, {
      status: 'in_progress',
      start_time: new Date().toISOString()
    });
  };

  const completeTicket = (data) => {
    onUpdate(ticket.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      ...data
    });
  };

  const openNavigation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${machine?.latitude || 0},${machine?.longitude || 0}`;
          window.open(url, '_blank');
        },
        () => toast.error('Unable to get your location')
      );
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">#{ticket.id}</CardTitle>
            <p className="text-sm font-medium">{ticket.title}</p>
            <p className="text-sm text-slate-600">
              Machine {machine?.machine_id || ticket.machine_id}
            </p>
            <p className="text-xs text-slate-500">
              {format(new Date(ticket.created_date), 'MMM d, h:mm a')}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <Badge variant={ticket.status === 'in_progress' ? 'default' : 'secondary'}>
              {ticket.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700 mb-4">
          {ticket.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openNavigation}
            disabled={!machine}
          >
            <Navigation className="w-4 h-4 mr-1" />
            Navigate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowWorkflow(true)}
          >
            <FileText className="w-4 h-4 mr-1" />
            Workflow
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPartTracker(true)}
          >
            <Package className="w-4 h-4 mr-1" />
            Parts
          </Button>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Camera className="w-4 h-4 mr-1" />
            Photo
          </Button>
        </div>

        {ticket.status === 'assigned' && (
          <Button onClick={startWork} className="w-full mb-2">
            <Clock className="w-4 h-4 mr-2" />
            Start Work
          </Button>
        )}

        {ticket.status === 'in_progress' && (
          <Button 
            onClick={() => completeTicket({})}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        )}

        {/* Modal Components */}
        {showWorkflow && (
          <TicketWorkflow
            ticket={ticket}
            machine={machine}
            onClose={() => setShowWorkflow(false)}
            onUpdate={onUpdate}
          />
        )}

        {showPartTracker && (
          <PartTracker
            ticket={ticket}
            onClose={() => setShowPartTracker(false)}
            onUpdate={onUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
