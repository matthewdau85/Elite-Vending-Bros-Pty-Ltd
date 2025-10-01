import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { appRoutes } from './routes-config';

const defaultRoute = appRoutes.find((route) => route.isDefault) ?? appRoutes[0];

function getCurrentPage(pathname) {
    if (!pathname) {
        return defaultRoute?.pageKey;
    }

    const [pathWithoutQuery] = pathname.split('?');
    let normalizedPath = pathWithoutQuery;

    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1);
    }

    const matchedRoute = appRoutes.find(
        (route) => route.path.toLowerCase() === normalizedPath.toLowerCase()
    );

    return matchedRoute?.pageKey ?? defaultRoute?.pageKey;
}

function PagesContent() {
    const location = useLocation();
    const currentPage = getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                {appRoutes.map(({ path, Component }) => (
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
