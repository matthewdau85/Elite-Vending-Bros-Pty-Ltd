import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Machines from "./Machines";

import Admin from "./Admin";

import Inventory from "./Inventory";

import Finance from "./Finance";

import Sales from "./Sales";

import RoutesPage from "./Routes";

import Alerts from "./Alerts";

import MachineDetail from "./MachineDetail";

import RouteDetail from "./RouteDetail";

import AIInsights from "./AIInsights";

import Users from "./Users";

import Locations from "./Locations";

import AIAgent from "./AIAgent";

import Help from "./Help";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Machines: Machines,
    
    Admin: Admin,
    
    Inventory: Inventory,
    
    Finance: Finance,
    
    Sales: Sales,
    
    Routes: RoutesPage,
    
    Alerts: Alerts,
    
    MachineDetail: MachineDetail,
    
    RouteDetail: RouteDetail,
    
    AIInsights: AIInsights,
    
    Users: Users,
    
    Locations: Locations,
    
    AIAgent: AIAgent,
    
    Help: Help,
    
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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Machines" element={<Machines />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/Finance" element={<Finance />} />
                
                <Route path="/Sales" element={<Sales />} />
                
                <Route path="/Routes" element={<RoutesPage />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/MachineDetail" element={<MachineDetail />} />
                
                <Route path="/RouteDetail" element={<RouteDetail />} />
                
                <Route path="/AIInsights" element={<AIInsights />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/Locations" element={<Locations />} />
                
                <Route path="/AIAgent" element={<AIAgent />} />
                
                <Route path="/Help" element={<Help />} />
                
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