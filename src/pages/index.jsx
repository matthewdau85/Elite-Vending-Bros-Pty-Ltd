import Layout from "./Layout.jsx";

import AdminAudit from "./AdminAudit.jsx";

import ComplaintDetail from "./ComplaintDetail.jsx";

import Report from "./Report.jsx";

import XeroCallback from "./XeroCallback.jsx";

import MapTest from "./MapTest.jsx";

import DashboardPage from "./Dashboard.jsx";

import MachinesPage from "./machines.jsx";

import RoutesPage from "./routes.jsx";

import AlertsPage from "./alerts.jsx";

import LocationsPage from "./locations.jsx";

import InventoryPage from "./inventory.jsx";

import SalesPage from "./sales.jsx";

import RoutePlannerPage from "./routeplanner.jsx";

import FinancePage from "./finance.jsx";

import ComplaintsPage from "./complaints.jsx";

import ServiceTicketsPage from "./servicetickets.jsx";

import RefundsPage from "./refunds.jsx";

import AiInsightsPage from "./aiinsights.jsx";

import AiAgentPage from "./aiagent.jsx";

import UsersPage from "./users.jsx";

import SettingsPage from "./settings.jsx";

import HelpPage from "./help.jsx";

import FeaturesPage from "./features.jsx";

import TelemetryPage from "./telemetry.jsx";

import PaymentsPage from "./payments.jsx";

import MobilePage from "./mobile.jsx";

import DeviceFleet from "./DeviceFleet.jsx";

import EnergyPage from "./energy.jsx";

import DeveloperPortal from "./DeveloperPortal.jsx";

import DeveloperPage from "./developer.jsx";

import ObservabilityPage from "./observability.jsx";

import FinancialIntegrations from "./FinancialIntegrations.jsx";

import IntelligencePage from "./intelligence.jsx";

import MachineDetailPage from "./machinedetail.jsx";

import MachineEditPage from "./machineedit.jsx";

import RouteDetailPage from "./routedetail.jsx";

import SecretsOnboarding from "./SecretsOnboarding.jsx";

import OnboardingPage from "./onboarding.jsx";

import HelpRadar from "./HelpRadar.jsx";

import PublicDocsHome from "./PublicDocsHome.jsx";

import PublicDoc from "./PublicDoc.jsx";

import AiTrash from "./AiTrash.jsx";

import AnalyticsPage from "./analytics.jsx";

import IntegrationsPage from "./integrations.jsx";

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

    Dashboard: DashboardPage,

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

                <Route path="/Dashboard" element={<DashboardPage />} />

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
