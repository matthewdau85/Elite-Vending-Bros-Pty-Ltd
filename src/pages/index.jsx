import Layout from "./Layout.jsx";

import AdminAudit from "./AdminAudit";

import ComplaintDetail from "./ComplaintDetail";

import Report from "./Report";

import XeroCallback from "./XeroCallback";

import MapTest from "./MapTest";

import DashboardPage from "./dashboard";

import MachinesPage from "./machines";

import RoutesPage from "./routes";

import AlertsPage from "./alerts";

import LocationsPage from "./locations";

import InventoryPage from "./inventory";

import SalesPage from "./sales";

import RoutePlannerPage from "./routeplanner";

import FinancePage from "./finance";

import ComplaintsPage from "./complaints";

import ServiceTicketsPage from "./servicetickets";

import RefundsPage from "./refunds";

import AiInsightsPage from "./aiinsights";

import AiAgentPage from "./aiagent";

import UsersPage from "./users";

import SettingsPage from "./settings";

import HelpPage from "./help";

import FeaturesPage from "./features";

import TelemetryPage from "./telemetry";

import PaymentsPage from "./payments";

import MobilePage from "./mobile";

import DeviceFleet from "./DeviceFleet";

import EnergyPage from "./energy";

import DeveloperPortal from "./DeveloperPortal";

import DeveloperPage from "./developer";

import ObservabilityPage from "./observability";

import FinancialIntegrations from "./FinancialIntegrations";

import IntelligencePage from "./intelligence";

import MachineDetailPage from "./machinedetail";

import MachineEditPage from "./machineedit";

import RouteDetailPage from "./routedetail";

import SecretsOnboarding from "./SecretsOnboarding";

import Dashboard from "./Dashboard";

import OnboardingPage from "./onboarding";

import HelpRadar from "./HelpRadar";

import PublicDocsHome from "./PublicDocsHome";

import PublicDoc from "./PublicDoc";

import AiTrash from "./AiTrash";

import AnalyticsPage from "./analytics";

import IntegrationsPage from "./integrations";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    AdminAudit: AdminAudit,

    ComplaintDetail: ComplaintDetail,

    Report: Report,

    XeroCallback: XeroCallback,

    MapTest: MapTest,

    dashboard: DashboardPage,

    machines: MachinesPage,

    routes: RoutesPage,

    alerts: AlertsPage,

    locations: LocationsPage,

    inventory: InventoryPage,

    sales: SalesPage,

    routeplanner: RoutePlannerPage,

    finance: FinancePage,

    complaints: ComplaintsPage,

    servicetickets: ServiceTicketsPage,

    refunds: RefundsPage,

    aiinsights: AiInsightsPage,

    aiagent: AiAgentPage,

    users: UsersPage,

    settings: SettingsPage,

    help: HelpPage,

    features: FeaturesPage,

    telemetry: TelemetryPage,

    payments: PaymentsPage,

    mobile: MobilePage,

    DeviceFleet: DeviceFleet,

    energy: EnergyPage,

    DeveloperPortal: DeveloperPortal,

    developer: DeveloperPage,

    observability: ObservabilityPage,

    FinancialIntegrations: FinancialIntegrations,

    intelligence: IntelligencePage,

    machinedetail: MachineDetailPage,

    machineedit: MachineEditPage,

    routedetail: RouteDetailPage,

    SecretsOnboarding: SecretsOnboarding,

    Dashboard: Dashboard,

    onboarding: OnboardingPage,

    HelpRadar: HelpRadar,

    PublicDocsHome: PublicDocsHome,

    PublicDoc: PublicDoc,

    AiTrash: AiTrash,

    analytics: AnalyticsPage,

    integrations: IntegrationsPage,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AdminAudit />} />
                
                
                <Route path="/AdminAudit" element={<AdminAudit />} />
                
                <Route path="/ComplaintDetail" element={<ComplaintDetail />} />
                
                <Route path="/Report" element={<Report />} />
                
                <Route path="/XeroCallback" element={<XeroCallback />} />
                
                <Route path="/MapTest" element={<MapTest />} />
                
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/machines" element={<MachinesPage />} />

                <Route path="/routes" element={<RoutesPage />} />

                <Route path="/alerts" element={<AlertsPage />} />

                <Route path="/locations" element={<LocationsPage />} />

                <Route path="/inventory" element={<InventoryPage />} />

                <Route path="/sales" element={<SalesPage />} />

                <Route path="/routeplanner" element={<RoutePlannerPage />} />

                <Route path="/finance" element={<FinancePage />} />

                <Route path="/complaints" element={<ComplaintsPage />} />

                <Route path="/servicetickets" element={<ServiceTicketsPage />} />

                <Route path="/refunds" element={<RefundsPage />} />

                <Route path="/aiinsights" element={<AiInsightsPage />} />

                <Route path="/aiagent" element={<AiAgentPage />} />

                <Route path="/users" element={<UsersPage />} />

                <Route path="/settings" element={<SettingsPage />} />

                <Route path="/help" element={<HelpPage />} />

                <Route path="/features" element={<FeaturesPage />} />

                <Route path="/telemetry" element={<TelemetryPage />} />

                <Route path="/payments" element={<PaymentsPage />} />

                <Route path="/mobile" element={<MobilePage />} />
                
                <Route path="/DeviceFleet" element={<DeviceFleet />} />
                
                <Route path="/energy" element={<EnergyPage />} />
                
                <Route path="/DeveloperPortal" element={<DeveloperPortal />} />
                
                <Route path="/developer" element={<DeveloperPage />} />

                <Route path="/observability" element={<ObservabilityPage />} />
                
                <Route path="/FinancialIntegrations" element={<FinancialIntegrations />} />
                
                <Route path="/intelligence" element={<IntelligencePage />} />

                <Route path="/machinedetail" element={<MachineDetailPage />} />

                <Route path="/machineedit" element={<MachineEditPage />} />

                <Route path="/routedetail" element={<RouteDetailPage />} />
                
                <Route path="/SecretsOnboarding" element={<SecretsOnboarding />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/onboarding" element={<OnboardingPage />} />
                
                <Route path="/HelpRadar" element={<HelpRadar />} />
                
                <Route path="/PublicDocsHome" element={<PublicDocsHome />} />
                
                <Route path="/PublicDoc" element={<PublicDoc />} />
                
                <Route path="/AiTrash" element={<AiTrash />} />
                
                <Route path="/analytics" element={<AnalyticsPage />} />

                <Route path="/integrations" element={<IntegrationsPage />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}