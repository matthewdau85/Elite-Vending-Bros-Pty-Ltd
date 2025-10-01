
import {
  Cpu,
  MapPin,
  Truck,
  Boxes,
  Wrench,
  DollarSign,
  Landmark,
  AlertTriangle,
  Undo2,
  TrendingUp,
  Sparkles,
  Zap,
  Settings,
  Banknote,
  Users,
  Code,
  ShieldCheck,
} from 'lucide-react'; // Assuming lucide-react for icons

export const navigationGroups = [
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { name: 'Machines', href: '/machines', icon: Cpu },
      { name: 'Locations', href: '/locations', icon: MapPin },
      { name: 'Routes', href: '/routes', icon: Truck },
      { name: 'Inventory', href: '/inventory', icon: Boxes },
      { name: 'Service Tickets', href: '/servicetickets', icon: Wrench },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis',
    items: [
      { name: 'Sales', href: '/sales', icon: DollarSign },
      { name: 'Finance', href: '/finance', icon: Landmark },
      { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
      { name: 'Refunds', href: '/refunds', icon: Undo2 },
      { name: 'Analytics', href: '/analytics', icon: TrendingUp },
      { name: 'AI Insights', href: '/aiinsights', icon: Sparkles, role: 'admin' },
      { name: 'Energy', href: '/energy', icon: Zap, role: 'admin' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Admin',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Integrations', href: '/integrations', icon: Banknote },
      { name: 'Compliance', href: '/compliance', icon: ShieldCheck, role: 'admin' },
      { name: 'Users', href: '/users', icon: Users, role: 'admin' },
      { name: 'Developer', href: '/developer', icon: Code, role: 'admin' },
    ],
  },
];
