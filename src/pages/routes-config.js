import AdminAudit from './AdminAudit';
import ComplaintDetail from './ComplaintDetail';
import Report from './Report';
import XeroCallback from './XeroCallback';
import MapTest from './MapTest';
import MachinesPage from './machines';
import RoutesPage from './routes';
import AlertsPage from './alerts';
import LocationsPage from './locations';
import InventoryPage from './inventory';
import SalesPage from './sales';
import RoutePlannerPage from './routeplanner';
import FinancePage from './finance';
import ComplaintsPage from './complaints';
import ServiceTicketsPage from './servicetickets';
import RefundsPage from './refunds';
import AIInsightsPage from './aiinsights';
import AiAgentPage from './aiagent';
import UsersPage from './users';
import SettingsPage from './settings';
import HelpCenter from './help';
import FeaturesPage from './features';
import TelemetryPage from './telemetry';
import PaymentsPage from './payments';
import MobilePage from './mobile';
import DeviceFleet from './DeviceFleet';
import EnergyModule from './energy';
import DeveloperPortalPage from './DeveloperPortal';
import DeveloperPortalAdmin from './developer';
import ObservabilityPage from './observability';
import FinancialIntegrationsPage from './FinancialIntegrations';
import IntelligencePage from './intelligence';
import MachineDetailPage from './machinedetail';
import MachineEditPage from './machineedit';
import RouteDetailPage from './routedetail';
import SecretsOnboarding from './SecretsOnboarding';
import DashboardRedirect from './Dashboard';
import OnboardingPage from './onboarding';
import HelpRadar from './HelpRadar';
import PublicDocsHome from './PublicDocsHome';
import PublicDoc from './PublicDoc';
import AiTrash from './AiTrash';
import AnalyticsPage from './analytics';
import IntegrationsPage from './integrations';

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
  Settings as SettingsIcon,
  Banknote,
  Users as UsersIcon,
  Code,
} from 'lucide-react';

export const appRoutes = [
  {
    path: '/',
    Component: AdminAudit,
    pageKey: 'AdminAudit',
    isDefault: true,
  },
  {
    path: '/dashboard',
    Component: AdminAudit,
    pageKey: 'AdminAudit',
  },
  {
    path: '/Dashboard',
    Component: DashboardRedirect,
    pageKey: 'DashboardRedirect',
  },
  {
    path: '/AdminAudit',
    Component: AdminAudit,
    pageKey: 'AdminAudit',
  },
  {
    path: '/ComplaintDetail',
    Component: ComplaintDetail,
    pageKey: 'ComplaintDetail',
  },
  {
    path: '/Report',
    Component: Report,
    pageKey: 'Report',
  },
  {
    path: '/XeroCallback',
    Component: XeroCallback,
    pageKey: 'XeroCallback',
  },
  {
    path: '/MapTest',
    Component: MapTest,
    pageKey: 'MapTest',
  },
  {
    path: '/machines',
    Component: MachinesPage,
    pageKey: 'Machines',
    nav: {
      groupId: 'operations',
      groupTitle: 'Operations',
      label: 'Machines',
      icon: Cpu,
    },
  },
  {
    path: '/locations',
    Component: LocationsPage,
    pageKey: 'Locations',
    nav: {
      groupId: 'operations',
      groupTitle: 'Operations',
      label: 'Locations',
      icon: MapPin,
    },
  },
  {
    path: '/routes',
    Component: RoutesPage,
    pageKey: 'Routes',
    nav: {
      groupId: 'operations',
      groupTitle: 'Operations',
      label: 'Routes',
      icon: Truck,
    },
  },
  {
    path: '/inventory',
    Component: InventoryPage,
    pageKey: 'Inventory',
    nav: {
      groupId: 'operations',
      groupTitle: 'Operations',
      label: 'Inventory',
      icon: Boxes,
    },
  },
  {
    path: '/servicetickets',
    Component: ServiceTicketsPage,
    pageKey: 'ServiceTickets',
    nav: {
      groupId: 'operations',
      groupTitle: 'Operations',
      label: 'Service Tickets',
      icon: Wrench,
    },
  },
  {
    path: '/sales',
    Component: SalesPage,
    pageKey: 'Sales',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'Sales',
      icon: DollarSign,
    },
  },
  {
    path: '/finance',
    Component: FinancePage,
    pageKey: 'Finance',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'Finance',
      icon: Landmark,
    },
  },
  {
    path: '/alerts',
    Component: AlertsPage,
    pageKey: 'Alerts',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'Alerts',
      icon: AlertTriangle,
    },
  },
  {
    path: '/refunds',
    Component: RefundsPage,
    pageKey: 'Refunds',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'Refunds',
      icon: Undo2,
    },
  },
  {
    path: '/analytics',
    Component: AnalyticsPage,
    pageKey: 'Analytics',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'Analytics',
      icon: TrendingUp,
    },
  },
  {
    path: '/aiinsights',
    Component: AIInsightsPage,
    pageKey: 'AIInsights',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'AI Insights',
      icon: Sparkles,
      role: 'admin',
    },
  },
  {
    path: '/energy',
    Component: EnergyModule,
    pageKey: 'Energy',
    nav: {
      groupId: 'analysis',
      groupTitle: 'Analysis',
      label: 'Energy',
      icon: Zap,
      role: 'admin',
    },
  },
  {
    path: '/settings',
    Component: SettingsPage,
    pageKey: 'Settings',
    nav: {
      groupId: 'settings',
      groupTitle: 'Settings & Admin',
      label: 'Settings',
      icon: SettingsIcon,
    },
  },
  {
    path: '/integrations',
    Component: IntegrationsPage,
    pageKey: 'Integrations',
    nav: {
      groupId: 'settings',
      groupTitle: 'Settings & Admin',
      label: 'Integrations',
      icon: Banknote,
    },
  },
  {
    path: '/users',
    Component: UsersPage,
    pageKey: 'Users',
    nav: {
      groupId: 'settings',
      groupTitle: 'Settings & Admin',
      label: 'Users',
      icon: UsersIcon,
      role: 'admin',
    },
  },
  {
    path: '/developer',
    Component: DeveloperPortalAdmin,
    pageKey: 'Developer',
    nav: {
      groupId: 'settings',
      groupTitle: 'Settings & Admin',
      label: 'Developer',
      icon: Code,
      role: 'admin',
    },
  },
  {
    path: '/routeplanner',
    Component: RoutePlannerPage,
    pageKey: 'RoutePlanner',
  },
  {
    path: '/complaints',
    Component: ComplaintsPage,
    pageKey: 'Complaints',
  },
  {
    path: '/aiagent',
    Component: AiAgentPage,
    pageKey: 'AiAgent',
  },
  {
    path: '/help',
    Component: HelpCenter,
    pageKey: 'Help',
  },
  {
    path: '/features',
    Component: FeaturesPage,
    pageKey: 'Features',
  },
  {
    path: '/telemetry',
    Component: TelemetryPage,
    pageKey: 'Telemetry',
  },
  {
    path: '/payments',
    Component: PaymentsPage,
    pageKey: 'Payments',
  },
  {
    path: '/mobile',
    Component: MobilePage,
    pageKey: 'Mobile',
  },
  {
    path: '/DeviceFleet',
    Component: DeviceFleet,
    pageKey: 'DeviceFleet',
  },
  {
    path: '/DeveloperPortal',
    Component: DeveloperPortalPage,
    pageKey: 'DeveloperPortal',
  },
  {
    path: '/observability',
    Component: ObservabilityPage,
    pageKey: 'Observability',
  },
  {
    path: '/FinancialIntegrations',
    Component: FinancialIntegrationsPage,
    pageKey: 'FinancialIntegrations',
  },
  {
    path: '/intelligence',
    Component: IntelligencePage,
    pageKey: 'Intelligence',
  },
  {
    path: '/machinedetail',
    Component: MachineDetailPage,
    pageKey: 'MachineDetail',
  },
  {
    path: '/machineedit',
    Component: MachineEditPage,
    pageKey: 'MachineEdit',
  },
  {
    path: '/routedetail',
    Component: RouteDetailPage,
    pageKey: 'RouteDetail',
  },
  {
    path: '/SecretsOnboarding',
    Component: SecretsOnboarding,
    pageKey: 'SecretsOnboarding',
  },
  {
    path: '/onboarding',
    Component: OnboardingPage,
    pageKey: 'Onboarding',
  },
  {
    path: '/HelpRadar',
    Component: HelpRadar,
    pageKey: 'HelpRadar',
  },
  {
    path: '/PublicDocsHome',
    Component: PublicDocsHome,
    pageKey: 'PublicDocsHome',
  },
  {
    path: '/PublicDoc',
    Component: PublicDoc,
    pageKey: 'PublicDoc',
  },
  {
    path: '/AiTrash',
    Component: AiTrash,
    pageKey: 'AiTrash',
  },
];

function buildNavigationGroups() {
  const groups = new Map();

  appRoutes.forEach((route) => {
    if (!route.nav) {
      return;
    }

    const { groupId, groupTitle, ...navItem } = route.nav;
    if (!groups.has(groupId)) {
      groups.set(groupId, {
        id: groupId,
        title: groupTitle,
        items: [],
      });
    }

    groups.get(groupId).items.push({
      name: navItem.label,
      href: route.path,
      icon: navItem.icon,
      role: navItem.role,
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    items: group.items,
  }));
}

export const navigationGroups = buildNavigationGroups();
