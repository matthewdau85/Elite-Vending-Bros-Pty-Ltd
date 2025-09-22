import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { differenceInHours, differenceInMinutes, isPast, isAfter } from 'date-fns';

export default function SlaCountdown({ 
  ticket, 
  size = 'default',
  showIcon = true,
  showDetails = false 
}) {
  if (!ticket?.resolution_sla || ['completed', 'cancelled'].includes(ticket.status)) {
    return null;
  }

  const now = new Date();
  const slaDate = new Date(ticket.resolution_sla);
  const snoozedUntil = ticket.snoozed_until ? new Date(ticket.snoozed_until) : null;
  
  // If ticket is snoozed and snooze period hasn't expired, show snoozed state
  if (snoozedUntil && isAfter(snoozedUntil, now)) {
    const hoursUntilUnsnooze = differenceInHours(snoozedUntil, now);
    return (
      <Badge 
        variant="outline" 
        className={`bg-blue-50 text-blue-700 border-blue-200 ${
          size === 'sm' ? 'text-xs px-2 py-0.5' : ''
        }`}
      >
        {showIcon && <Clock className="w-3 h-3 mr-1" />}
        Snoozed {hoursUntilUnsnooze}h
      </Badge>
    );
  }

  const isOverdue = isPast(slaDate);
  const hoursRemaining = differenceInHours(slaDate, now);
  const minutesRemaining = differenceInMinutes(slaDate, now);
  
  // Calculate status and styling
  let status, color, icon;
  
  if (isOverdue) {
    const hoursOverdue = Math.abs(hoursRemaining);
    status = hoursOverdue < 24 ? `${hoursOverdue}h overdue` : `${Math.floor(hoursOverdue / 24)}d overdue`;
    color = 'bg-red-100 text-red-800 border-red-200';
    icon = AlertTriangle;
  } else if (hoursRemaining <= 2) {
    status = minutesRemaining < 60 ? `${minutesRemaining}m left` : `${hoursRemaining}h left`;
    color = 'bg-red-100 text-red-800 border-red-200';
    icon = AlertTriangle;
  } else if (hoursRemaining <= 8) {
    status = `${hoursRemaining}h left`;
    color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    icon = Clock;
  } else {
    const daysRemaining = Math.floor(hoursRemaining / 24);
    status = daysRemaining > 0 ? `${daysRemaining}d left` : `${hoursRemaining}h left`;
    color = 'bg-green-100 text-green-700 border-green-200';
    icon = CheckCircle2;
  }

  const IconComponent = icon;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        className={`${color} ${
          size === 'sm' ? 'text-xs px-2 py-0.5' : ''
        }`}
      >
        {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
      
      {showDetails && (
        <span className="text-xs text-slate-500">
          Due: {slaDate.toLocaleDateString()} {slaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}