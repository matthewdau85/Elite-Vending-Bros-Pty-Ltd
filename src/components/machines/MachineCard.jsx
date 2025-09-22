import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, AlertTriangle, Wrench, CircleSlash } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  online: {
    label: 'Online',
    icon: Coffee,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
  },
  offline: {
    label: 'Offline',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
  },
  retired: {
    label: 'Retired',
    icon: CircleSlash,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    iconColor: 'text-slate-500',
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

const MachineCard = React.memo(({ machine, onClick }) => {
  const config = statusConfig[machine.status] || statusConfig.offline;
  const Icon = config.icon;

  return (
    <motion.div variants={itemVariants} layout>
      <Card
        className="h-full cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-slate-800 truncate pr-2">
              {machine.machine_id}
            </CardTitle>
            <Badge className={cn('whitespace-nowrap', config.color)}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-4 w-4', config.iconColor)} />
            <span>{machine.model || 'Unknown Model'}</span>
          </div>
          {machine.location_name && <p>Location: {machine.location_name}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default MachineCard;