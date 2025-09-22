export const featureRegistry = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    isCritical: true,
    routes: ['/dashboard'],
    requiredDocs: ['dashboard-overview'],
  },
  {
    key: 'machines',
    title: 'Machine Management',
    isCritical: true,
    routes: ['/machines', '/machines/:id'],
    requiredDocs: ['add-first-machine'], // Will show as missing
  },
  {
    key: 'refunds',
    title: 'Refunds & Complaints',
    isCritical: false,
    routes: ['/refunds', '/complaints'],
    requiredDocs: ['processing-refunds', 'handling-complaints'], // Will show as missing
  },
  {
    key: 'servicetickets',
    title: 'Service Tickets',
    isCritical: false,
    routes: ['/servicetickets'],
    requiredDocs: ['managing-service-tickets'], // Will show as missing
  },
  {
    key: 'admin',
    title: 'Admin & Security',
    isCritical: true,
    routes: ['/admin/audit', '/settings'],
    requiredDocs: ['understanding-audit-trail', 'security-settings'], // Will show as missing
  },
  {
    key: 'help-center',
    title: 'Help Center Features',
    isCritical: false,
    routes: ['/help', '/help/radar'],
    requiredDocs: ['troubleshooting-page-errors'],
  }
];