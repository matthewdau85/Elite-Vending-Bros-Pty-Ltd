import Layout from "./Layout.jsx";

import AdminAudit from "./AdminAudit.jsx";

import ComplaintDetailPage from "./ComplaintDetail.jsx";

import Report from "./Report.jsx";

import XeroCallback from "./XeroCallback.jsx";

import MapTest from "./MapTest.jsx";

import DashboardRedirect from "./Dashboard.jsx";

import MachinesPage from "./machines.jsx";

import RoutesPage from "./routes.jsx";

import AlertsPage from "./alerts.jsx";

import LocationsPage from "./locations.jsx";

import Inventory from "./inventory.jsx";

import Sales from "./sales.jsx";

import RoutePlannerPage from "./routeplanner.jsx";

import FinancePage from "./finance.jsx";

import ComplaintsPage from "./complaints.jsx";

import ServiceTicketsPage from "./servicetickets.jsx";

import RefundsPage from "./refunds.jsx";

import AIInsightsPage from "./aiinsights.jsx";

import AiAgentPage from "./aiagent.jsx";

import UsersPage from "./users.jsx";

import SettingsPage from "./settings.jsx";

import HelpCenter from "./help.jsx";

import FeaturesPage from "./features.jsx";

import TelemetryPage from "./telemetry.jsx";

import PaymentsPage from "./payments.jsx";

import MobilePage from "./mobile.jsx";

import DeviceFleet from "./DeviceFleet.jsx";

import EnergyModule from "./energy.jsx";

import DeveloperPortalPage from "./DeveloperPortal.jsx";

import DeveloperPortalSecurePage from "./developer.jsx";

import ObservabilityPage from "./observability.jsx";

import FinancialIntegrationsPage from "./FinancialIntegrations.jsx";

import Intelligence from "./intelligence.jsx";

import MachineDetail from "./machinedetail.jsx";

import MachineEdit from "./machineedit.jsx";

import RouteDetail from "./routedetail.jsx";

import SecretsOnboarding from "./SecretsOnboarding.jsx";

import OnboardingPage from "./onboarding.jsx";

import HelpRadarPage from "./HelpRadar.jsx";

import PublicDocsHome from "./PublicDocsHome.jsx";

import PublicDoc from "./PublicDoc.jsx";

import AiTrashPage from "./AiTrash.jsx";

import AnalyticsPage from "./analytics.jsx";

import IntegrationsPage from "./integrations.jsx";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AdminAudit: AdminAudit,

    ComplaintDetail: ComplaintDetailPage,

    Report: Report,

    XeroCallback: XeroCallback,

    MapTest: MapTest,

    dashboard: DashboardRedirect,

    machines: MachinesPage,

    routes: RoutesPage,

    alerts: AlertsPage,

    locations: LocationsPage,

    inventory: Inventory,

    sales: Sales,

    routeplanner: RoutePlannerPage,

    finance: FinancePage,

    complaints: ComplaintsPage,

    servicetickets: ServiceTicketsPage,

    refunds: RefundsPage,

    aiinsights: AIInsightsPage,

    aiagent: AiAgentPage,

    users: UsersPage,

    settings: SettingsPage,

    help: HelpCenter,

    features: FeaturesPage,

    telemetry: TelemetryPage,

    payments: PaymentsPage,

    mobile: MobilePage,

    DeviceFleet: DeviceFleet,

    energy: EnergyModule,

    DeveloperPortal: DeveloperPortalPage,

    developer: DeveloperPortalSecurePage,

    observability: ObservabilityPage,

    FinancialIntegrations: FinancialIntegrationsPage,

    intelligence: Intelligence,

    machinedetail: MachineDetail,

    machineedit: MachineEdit,

    routedetail: RouteDetail,

    SecretsOnboarding: SecretsOnboarding,

    Dashboard: DashboardRedirect,

    onboarding: OnboardingPage,

    HelpRadar: HelpRadarPage,

    PublicDocsHome: PublicDocsHome,

    PublicDoc: PublicDoc,

    AiTrash: AiTrashPage,

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

                <Route path="/ComplaintDetail" element={<ComplaintDetailPage />} />

                <Route path="/Report" element={<Report />} />

                <Route path="/XeroCallback" element={<XeroCallback />} />

                <Route path="/MapTest" element={<MapTest />} />

                <Route path="/dashboard" element={<DashboardRedirect />} />

                <Route path="/machines" element={<MachinesPage />} />

                <Route path="/routes" element={<RoutesPage />} />

                <Route path="/alerts" element={<AlertsPage />} />

                <Route path="/locations" element={<LocationsPage />} />

                <Route path="/inventory" element={<Inventory />} />

                <Route path="/sales" element={<Sales />} />

                <Route path="/routeplanner" element={<RoutePlannerPage />} />

                <Route path="/finance" element={<FinancePage />} />

                <Route path="/complaints" element={<ComplaintsPage />} />

                <Route path="/servicetickets" element={<ServiceTicketsPage />} />

                <Route path="/refunds" element={<RefundsPage />} />

                <Route path="/aiinsights" element={<AIInsightsPage />} />

                <Route path="/aiagent" element={<AiAgentPage />} />

                <Route path="/users" element={<UsersPage />} />

                <Route path="/settings" element={<SettingsPage />} />

                <Route path="/help" element={<HelpCenter />} />

                <Route path="/features" element={<FeaturesPage />} />

                <Route path="/telemetry" element={<TelemetryPage />} />

                <Route path="/payments" element={<PaymentsPage />} />

                <Route path="/mobile" element={<MobilePage />} />

                <Route path="/DeviceFleet" element={<DeviceFleet />} />

                <Route path="/energy" element={<EnergyModule />} />

                <Route path="/DeveloperPortal" element={<DeveloperPortalPage />} />

                <Route path="/developer" element={<DeveloperPortalSecurePage />} />

                <Route path="/observability" element={<ObservabilityPage />} />

                <Route path="/FinancialIntegrations" element={<FinancialIntegrationsPage />} />

                <Route path="/intelligence" element={<Intelligence />} />

                <Route path="/machinedetail" element={<MachineDetail />} />

                <Route path="/machineedit" element={<MachineEdit />} />

                <Route path="/routedetail" element={<RouteDetail />} />

                <Route path="/SecretsOnboarding" element={<SecretsOnboarding />} />

                <Route path="/Dashboard" element={<DashboardRedirect />} />

                <Route path="/onboarding" element={<OnboardingPage />} />

                <Route path="/HelpRadar" element={<HelpRadarPage />} />

                <Route path="/PublicDocsHome" element={<PublicDocsHome />} />

                <Route path="/PublicDoc" element={<PublicDoc />} />

                <Route path="/AiTrash" element={<AiTrashPage />} />

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