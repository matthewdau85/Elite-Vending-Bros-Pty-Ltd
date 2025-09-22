
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Wrench, MoreHorizontal, Clock, User, MapPin, Pause, Play, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ServiceTicket } from '@/api/entities';
import SlaCountdown from './SlaCountdown';
import { snoozeServiceTicket } from '@/api/functions';

const STATUS_CONFIG = {
  open: { 
    label: 'Open', 
    color: 'bg-red-100 text-red-800',
    icon: Clock,
    allowedTransitions: ['assigned', 'in_progress']
  },
  assigned: { 
    label: 'Assigned', 
    color: 'bg-blue-100 text-blue-800',
    icon: User,
    allowedTransitions: ['open', 'in_progress', 'blocked']
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Wrench,
    allowedTransitions: ['assigned', 'blocked', 'completed']
  },
  blocked: { 
    label: 'Blocked', 
    color: 'bg-purple-100 text-purple-800',
    icon: Pause,
    allowedTransitions: ['assigned', 'in_progress']
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    allowedTransitions: []
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-slate-100 text-slate-600',
    icon: Clock,
    allowedTransitions: []
  }
};

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low', color: 'bg-blue-100 text-blue-800' }
};

export default function ServiceTicketCard({ 
  ticket, 
  onUpdate, 
  onClick,
  machines = [],
  locations = []
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const machine = machines.find(m => m.id === ticket.machine_id);
  const location = locations.find(l => l.id === ticket.location_id);
  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (newStatus) => {
    const currentConfig = STATUS_CONFIG[ticket.status];
    
    // Validate transition
    if (!currentConfig.allowedTransitions.includes(newStatus)) {
      toast.error(`Cannot transition from ${currentConfig.label} to ${STATUS_CONFIG[newStatus].label}`);
      return;
    }

    setIsUpdating(true);
    try {
      await ServiceTicket.update(ticket.id, { 
        status: newStatus,
        ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
      });
      
      toast.success(`Ticket marked as ${STATUS_CONFIG[newStatus].label.toLowerCase()}`);
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSnooze = async () => {
    const snoozeHours = prompt('Snooze for how many hours?', '2');
    const reason = prompt('Reason for snoozing:');
    
    if (!snoozeHours || !reason) return;
    
    const hours = parseInt(snoozeHours);
    if (isNaN(hours) || hours < 1) {
      toast.error('Please enter a valid number of hours');
      return;
    }

    setIsUpdating(true);
    try {
      const snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      
      await snoozeServiceTicket({
        ticketId: ticket.id,
        snoozeUntil,
        reason
      });
      
      toast.success(`Ticket snoozed for ${hours} hours`);
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to snooze ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card 
      className="flex flex-col h-full hover:border-blue-500 transition-colors cursor-pointer"
      onClick={() => onClick?.(ticket)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              <span className="truncate">{ticket.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <Badge className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
              <SlaCountdown ticket={ticket} size="sm" />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" disabled={isUpdating}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Status Transitions */}
              {statusConfig.allowedTransitions.map(status => (
                <DropdownMenuItem 
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(status);
                  }}
                >
                  Mark as {STATUS_CONFIG[status].label}
                </DropdownMenuItem>
              ))}
              
              {statusConfig.allowedTransitions.length > 0 && <DropdownMenuSeparator />}
              
              {/* Snooze Option */}
              {!['completed', 'cancelled'].includes(ticket.status) && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSnooze();
                  }}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Snooze SLA
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {ticket.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Machine:</span>
            <p className="font-medium">{machine?.machine_id || 'Unknown'}</p>
          </div>
          <div>
            <span className="text-slate-500">Location:</span>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location?.name || 'Unknown'}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Reporter:</span>
            <p className="font-medium">{ticket.reporter_email || 'System'}</p>
          </div>
        </div>

        {ticket.assigned_to && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-sm">Assigned to {ticket.assigned_to}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-slate-50 py-3 px-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>
            Created {ticket?.created_date
              ? formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true })
              : 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>
            {ticket?.created_date
              ? format(new Date(ticket.created_date), 'MMM d, HH:mm')
              : '—'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
