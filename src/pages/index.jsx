import Layout from "./Layout.jsx";

import AdminAudit from "./AdminAudit";

import ComplaintDetail from "./ComplaintDetail";

import Report from "./Report";

import XeroCallback from "./XeroCallback";

import MapTest from "./MapTest";

import DashboardPage from "./dashboard";

import machines from "./machines";

import routes from "./routes";

import alerts from "./alerts";

import locations from "./locations";

import inventory from "./inventory";

import sales from "./sales";

import routeplanner from "./routeplanner";

import finance from "./finance";

import complaints from "./complaints";

import servicetickets from "./servicetickets";

import refunds from "./refunds";

import aiinsights from "./aiinsights";

import aiagent from "./aiagent";

import users from "./users";

import settings from "./settings";

import help from "./help";

import features from "./features";

import telemetry from "./telemetry";

import payments from "./payments";

import mobile from "./mobile";

import DeviceFleet from "./DeviceFleet";

import energy from "./energy";

import DeveloperPortal from "./DeveloperPortal";

import developer from "./developer";

import observability from "./observability";

import FinancialIntegrations from "./FinancialIntegrations";

import intelligence from "./intelligence";

import machinedetail from "./machinedetail";

import machineedit from "./machineedit";

import routedetail from "./routedetail";

import SecretsOnboarding from "./SecretsOnboarding";

import Dashboard from "./Dashboard";

import onboarding from "./onboarding";

import HelpRadar from "./HelpRadar";

import PublicDocsHome from "./PublicDocsHome";

import PublicDoc from "./PublicDoc";

import AiTrash from "./AiTrash";

import analytics from "./analytics";

import integrations from "./integrations";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AdminAudit: AdminAudit,
    
    ComplaintDetail: ComplaintDetail,
    
    Report: Report,
    
    XeroCallback: XeroCallback,
    
    MapTest: MapTest,
    
    dashboard: DashboardPage,
    
    machines: machines,
    
    routes: routes,
    
    alerts: alerts,
    
    locations: locations,
    
    inventory: inventory,
    
    sales: sales,
    
    routeplanner: routeplanner,
    
    finance: finance,
    
    complaints: complaints,
    
    servicetickets: servicetickets,
    
    refunds: refunds,
    
    aiinsights: aiinsights,
    
    aiagent: aiagent,
    
    users: users,
    
    settings: settings,
    
    help: help,
    
    features: features,
    
    telemetry: telemetry,
    
    payments: payments,
    
    mobile: mobile,
    
    DeviceFleet: DeviceFleet,
    
    energy: energy,
    
    DeveloperPortal: DeveloperPortal,
    
    developer: developer,
    
    observability: observability,
    
    FinancialIntegrations: FinancialIntegrations,
    
    intelligence: intelligence,
    
    machinedetail: machinedetail,
    
    machineedit: machineedit,
    
    routedetail: routedetail,
    
    SecretsOnboarding: SecretsOnboarding,
    
    Dashboard: Dashboard,
    
    onboarding: onboarding,
    
    HelpRadar: HelpRadar,
    
    PublicDocsHome: PublicDocsHome,
    
    PublicDoc: PublicDoc,
    
    AiTrash: AiTrash,
    
    analytics: analytics,
    
    integrations: integrations,
    
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
                
                <Route path="/machines" element={<machines />} />
                
                <Route path="/routes" element={<routes />} />
                
                <Route path="/alerts" element={<alerts />} />
                
                <Route path="/locations" element={<locations />} />
                
                <Route path="/inventory" element={<inventory />} />
                
                <Route path="/sales" element={<sales />} />
                
                <Route path="/routeplanner" element={<routeplanner />} />
                
                <Route path="/finance" element={<finance />} />
                
                <Route path="/complaints" element={<complaints />} />
                
                <Route path="/servicetickets" element={<servicetickets />} />
                
                <Route path="/refunds" element={<refunds />} />
                
                <Route path="/aiinsights" element={<aiinsights />} />
                
                <Route path="/aiagent" element={<aiagent />} />
                
                <Route path="/users" element={<users />} />
                
                <Route path="/settings" element={<settings />} />
                
                <Route path="/help" element={<help />} />
                
                <Route path="/features" element={<features />} />
                
                <Route path="/telemetry" element={<telemetry />} />
                
                <Route path="/payments" element={<payments />} />
                
                <Route path="/mobile" element={<mobile />} />
                
                <Route path="/DeviceFleet" element={<DeviceFleet />} />
                
                <Route path="/energy" element={<energy />} />
                
                <Route path="/DeveloperPortal" element={<DeveloperPortal />} />
                
                <Route path="/developer" element={<developer />} />
                
                <Route path="/observability" element={<observability />} />
                
                <Route path="/FinancialIntegrations" element={<FinancialIntegrations />} />
                
                <Route path="/intelligence" element={<intelligence />} />
                
                <Route path="/machinedetail" element={<machinedetail />} />
                
                <Route path="/machineedit" element={<machineedit />} />
                
                <Route path="/routedetail" element={<routedetail />} />
                
                <Route path="/SecretsOnboarding" element={<SecretsOnboarding />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/onboarding" element={<onboarding />} />
                
                <Route path="/HelpRadar" element={<HelpRadar />} />
                
                <Route path="/PublicDocsHome" element={<PublicDocsHome />} />
                
                <Route path="/PublicDoc" element={<PublicDoc />} />
                
                <Route path="/AiTrash" element={<AiTrash />} />
                
                <Route path="/analytics" element={<analytics />} />
                
                <Route path="/integrations" element={<integrations />} />
                
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