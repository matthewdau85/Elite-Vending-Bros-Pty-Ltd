import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Home, Coffee, MapPin, Package, Truck, LineChart, DollarSign, Bell, Wrench, MessageSquareWarning, PlusCircle
} from 'lucide-react';

export default function CommandMenu({ open, setOpen, onSelectAction }) {
  const navigate = useNavigate();

  const runCommand = (command) => {
    command();
    setOpen(false);
  };

  const pages = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Machines', icon: Coffee, href: '/machines' },
    { name: 'Locations', icon: MapPin, href: '/locations' },
    { name: 'Inventory', icon: Package, href: '/inventory' },
    { name: 'Routes', icon: Truck, href: '/routes' },
    { name: 'Sales', icon: LineChart, href: '/sales' },
    { name: 'Finance', icon: DollarSign, href: '/finance' },
    { name: 'Alerts', icon: Bell, href: '/alerts' },
    { name: 'Service Tickets', icon: Wrench, href: '/servicetickets' },
    { name: 'Complaints', icon: MessageSquareWarning, href: '/complaints' },
  ];

  const actions = [
    { name: 'New Service Ticket', icon: PlusCircle, action: () => onSelectAction('new_ticket') },
    { name: 'Log New Complaint', icon: PlusCircle, action: () => onSelectAction('new_complaint') },
    { name: 'Add New Machine', icon: PlusCircle, action: () => onSelectAction('new_machine') },
    // This action is stubbed for future implementation
    { name: 'New Refund', icon: PlusCircle, action: () => onSelectAction('new_refund') },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => runCommand(() => navigate(page.href))}>
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          {actions.map((action) => (
            <CommandItem key={action.name} onSelect={() => runCommand(action.action)}>
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}