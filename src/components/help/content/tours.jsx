export const tours = {
  'dashboard-overview': {
    id: 'dashboard-overview',
    title: 'Dashboard Overview Tour',
    description: 'Get a quick walkthrough of the main dashboard.',
    steps: [
      {
        selector: '#stats-overview-wrapper',
        title: 'Key Metrics at a Glance',
        content: 'This section shows your most important real-time stats like revenue, machine uptime, and active alerts. Use the date filter above to change the time period.',
        placement: 'bottom',
      },
      {
        selector: '#charts-grid-wrapper',
        title: 'Visualizing Your Data',
        content: 'These charts provide a visual breakdown of your daily revenue and refund rates, helping you spot trends quickly.',
        placement: 'bottom',
      },
      {
        selector: '#secondary-grid-wrapper',
        title: 'Deeper Insights',
        content: 'Here you can find your top-performing locations, a feed of active alerts, and any service tickets that are breaching their SLA.',
        placement: 'top',
      },
      {
        selector: '#live-map-wrapper',
        title: 'Live Operations Map',
        content: 'This map gives you a real-time view of your entire machine fleet, showing their status and location.',
        placement: 'top',
      },
       {
        selector: '#quick-actions-wrapper',
        title: 'Quick Actions',
        content: 'Use these shortcuts to jump directly to key sections of the application, like managing machines or planning routes.',
        placement: 'top',
      },
    ]
  },
  'machines-page': {
    id: 'machines-page',
    title: 'Managing Your Machines',
    description: 'Learn how to find and manage your vending machines.',
    steps: [
       {
        selector: '#machine-actions-header',
        title: 'Search and Add',
        content: 'You can search for any machine by its ID or model. Use the "Add Machine" button to register a new machine in the system.',
        placement: 'bottom',
      },
      {
        selector: '.machine-card-link', // Target the first card
        title: 'Machine Card',
        content: 'Each card gives you a snapshot of a machine\'s status, location, and key details. Click on a card to view more detailed information.',
        placement: 'bottom',
      }
    ]
  }
  // Add other tours here e.g., 'refunds-tickets-complaints', 'secrets-management'
};