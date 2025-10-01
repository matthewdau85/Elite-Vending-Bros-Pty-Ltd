import Layout from "./Layout.jsx";
import AdminAudit from "./AdminAudit";
import ComplaintDetail from "./ComplaintDetail";
import Report from "./Report";
import XeroCallback from "./XeroCallback";
import MapTest from "./MapTest";
import dashboard from "./dashboard";
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

export const routesConfig = [
    { path: '/', name: 'AdminAudit', Component: AdminAudit },
    { path: '/AdminAudit', name: 'AdminAudit', Component: AdminAudit },
    { path: '/ComplaintDetail', name: 'ComplaintDetail', Component: ComplaintDetail },
    { path: '/Report', name: 'Report', Component: Report },
    { path: '/XeroCallback', name: 'XeroCallback', Component: XeroCallback },
    { path: '/MapTest', name: 'MapTest', Component: MapTest },
    { path: '/dashboard', name: 'dashboard', Component: dashboard },
    { path: '/machines', name: 'machines', Component: machines },
    { path: '/routes', name: 'routes', Component: routes },
    { path: '/alerts', name: 'alerts', Component: alerts },
    { path: '/locations', name: 'locations', Component: locations },
    { path: '/inventory', name: 'inventory', Component: inventory },
    { path: '/sales', name: 'sales', Component: sales },
    { path: '/routeplanner', name: 'routeplanner', Component: routeplanner },
    { path: '/finance', name: 'finance', Component: finance },
    { path: '/complaints', name: 'complaints', Component: complaints },
    { path: '/servicetickets', name: 'servicetickets', Component: servicetickets },
    { path: '/refunds', name: 'refunds', Component: refunds },
    { path: '/aiinsights', name: 'aiinsights', Component: aiinsights },
    { path: '/aiagent', name: 'aiagent', Component: aiagent },
    { path: '/users', name: 'users', Component: users },
    { path: '/settings', name: 'settings', Component: settings },
    { path: '/help', name: 'help', Component: help },
    { path: '/features', name: 'features', Component: features },
    { path: '/telemetry', name: 'telemetry', Component: telemetry },
    { path: '/payments', name: 'payments', Component: payments },
    { path: '/mobile', name: 'mobile', Component: mobile },
    { path: '/DeviceFleet', name: 'DeviceFleet', Component: DeviceFleet },
    { path: '/energy', name: 'energy', Component: energy },
    { path: '/DeveloperPortal', name: 'DeveloperPortal', Component: DeveloperPortal },
    { path: '/developer', name: 'developer', Component: developer },
    { path: '/observability', name: 'observability', Component: observability },
    { path: '/FinancialIntegrations', name: 'FinancialIntegrations', Component: FinancialIntegrations },
    { path: '/intelligence', name: 'intelligence', Component: intelligence },
    { path: '/machinedetail', name: 'machinedetail', Component: machinedetail },
    { path: '/machineedit', name: 'machineedit', Component: machineedit },
    { path: '/routedetail', name: 'routedetail', Component: routedetail },
    { path: '/SecretsOnboarding', name: 'SecretsOnboarding', Component: SecretsOnboarding },
    { path: '/Dashboard', name: 'Dashboard', Component: Dashboard },
    { path: '/onboarding', name: 'onboarding', Component: onboarding },
    { path: '/HelpRadar', name: 'HelpRadar', Component: HelpRadar },
    { path: '/PublicDocsHome', name: 'PublicDocsHome', Component: PublicDocsHome },
    { path: '/PublicDoc', name: 'PublicDoc', Component: PublicDoc },
    { path: '/AiTrash', name: 'AiTrash', Component: AiTrash },
    { path: '/analytics', name: 'analytics', Component: analytics },
    { path: '/integrations', name: 'integrations', Component: integrations },
];

const normalizePath = (path) => {
    if (!path) {
        return '/';
    }

    const [pathname] = path.split('?');
    if (!pathname || pathname === '/') {
        return '/';
    }

    return pathname.replace(/\/+$/, '').toLowerCase();
};

const getCurrentPageName = (pathname) => {
    const normalizedPath = normalizePath(pathname);
    const matchingRoute = routesConfig.find(({ path }) => normalizePath(path) === normalizedPath);

    return matchingRoute?.name ?? routesConfig[0].name;
};

function PagesContent() {
    const location = useLocation();
    const currentPageName = getCurrentPageName(location.pathname);

    return (
        <Layout currentPageName={currentPageName}>
            <Routes>
                {routesConfig.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}
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
