import Layout from "./Layout.jsx";

import AdminAudit from "./AdminAudit";

import ComplaintDetail from "./ComplaintDetail";

import Report from "./Report";

import XeroCallback from "./XeroCallback";

import MapTest from "./MapTest";

import Dashboard from "./Dashboard";

import Machines from "./machines";

import RoutesPage from "./routes";

import Alerts from "./alerts";

import Locations from "./locations";

import Inventory from "./inventory";

import Sales from "./sales";

import RoutePlanner from "./routeplanner";

import Finance from "./finance";

import Complaints from "./complaints";

import ServiceTickets from "./servicetickets";

import Refunds from "./refunds";

import AiInsights from "./aiinsights";

import AiAgent from "./aiagent";

import Users from "./users";

import Settings from "./settings";

import Help from "./help";

import Features from "./features";

import Telemetry from "./telemetry";

import Payments from "./payments";

import Mobile from "./mobile";

import DeviceFleet from "./DeviceFleet";

import Energy from "./energy";

import DeveloperPortal from "./DeveloperPortal";

import Developer from "./developer";

import Observability from "./observability";

import FinancialIntegrations from "./FinancialIntegrations";

import Intelligence from "./intelligence";

import MachineDetail from "./machinedetail";

import MachineEdit from "./machineedit";

import RouteDetail from "./routedetail";

import SecretsOnboarding from "./SecretsOnboarding";


import Onboarding from "./onboarding";

import HelpRadar from "./HelpRadar";

import PublicDocsHome from "./PublicDocsHome";

import PublicDoc from "./PublicDoc";

import AiTrash from "./AiTrash";

import Analytics from "./analytics";

import Integrations from "./integrations";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AdminAudit,
    
    ComplaintDetail,
    
    Report,
    
    XeroCallback,
    
    MapTest,
    
    dashboard: Dashboard,
    
    machines: Machines,
    
    routes: RoutesPage,
    
    alerts: Alerts,
    
    locations: Locations,
    
    inventory: Inventory,
    
    sales: Sales,
    
    routeplanner: RoutePlanner,
    
    finance: Finance,
    
    complaints: Complaints,
    
    servicetickets: ServiceTickets,
    
    refunds: Refunds,
    
    aiinsights: AiInsights,
    
    aiagent: AiAgent,
    
    users: Users,
    
    settings: Settings,
    
    help: Help,
    
    features: Features,
    
    telemetry: Telemetry,
    
    payments: Payments,
    
    mobile: Mobile,
    
    DeviceFleet,
    
    energy: Energy,
    
    DeveloperPortal,
    
    developer: Developer,
    
    observability: Observability,
    
    FinancialIntegrations,
    
    intelligence: Intelligence,
    
    machinedetail: MachineDetail,
    
    machineedit: MachineEdit,
    
    routedetail: RouteDetail,
    
    SecretsOnboarding,
    
    Dashboard: Dashboard,
    
    onboarding: Onboarding,
    
    HelpRadar,
    
    PublicDocsHome,
    
    PublicDoc,
    
    AiTrash,
    
    analytics: Analytics,
    
    integrations: Integrations,
    
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
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/machines" element={<Machines />} />
                
                <Route path="/routes" element={<RoutesPage />} />
                
                <Route path="/alerts" element={<Alerts />} />
                
                <Route path="/locations" element={<Locations />} />
                
                <Route path="/inventory" element={<Inventory />} />
                
                <Route path="/sales" element={<Sales />} />
                
                <Route path="/routeplanner" element={<RoutePlanner />} />
                
                <Route path="/finance" element={<Finance />} />
                
                <Route path="/complaints" element={<Complaints />} />
                
                <Route path="/servicetickets" element={<ServiceTickets />} />
                
                <Route path="/refunds" element={<Refunds />} />
                
                <Route path="/aiinsights" element={<AiInsights />} />
                
                <Route path="/aiagent" element={<AiAgent />} />
                
                <Route path="/users" element={<Users />} />
                
                <Route path="/settings" element={<Settings />} />
                
                <Route path="/help" element={<Help />} />
                
                <Route path="/features" element={<Features />} />
                
                <Route path="/telemetry" element={<Telemetry />} />
                
                <Route path="/payments" element={<Payments />} />
                
                <Route path="/mobile" element={<Mobile />} />
                
                <Route path="/DeviceFleet" element={<DeviceFleet />} />
                
                <Route path="/energy" element={<Energy />} />
                
                <Route path="/DeveloperPortal" element={<DeveloperPortal />} />
                
                <Route path="/developer" element={<Developer />} />
                
                <Route path="/observability" element={<Observability />} />
                
                <Route path="/FinancialIntegrations" element={<FinancialIntegrations />} />
                
                <Route path="/intelligence" element={<Intelligence />} />
                
                <Route path="/machinedetail" element={<MachineDetail />} />
                
                <Route path="/machineedit" element={<MachineEdit />} />
                
                <Route path="/routedetail" element={<RouteDetail />} />
                
                <Route path="/SecretsOnboarding" element={<SecretsOnboarding />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/onboarding" element={<Onboarding />} />
                
                <Route path="/HelpRadar" element={<HelpRadar />} />
                
                <Route path="/PublicDocsHome" element={<PublicDocsHome />} />
                
                <Route path="/PublicDoc" element={<PublicDoc />} />
                
                <Route path="/AiTrash" element={<AiTrash />} />
                
                <Route path="/analytics" element={<Analytics />} />
                
                <Route path="/integrations" element={<Integrations />} />
                
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