// Comprehensive help articles covering all platform features
export const helpArticles = [
  // GETTING STARTED
  {
    id: 'getting-started-overview',
    title: 'Platform Overview & Getting Started',
    slug: 'getting-started-overview',
    category: 'getting_started',
    subcategory: 'overview',
    target_roles: ['owner', 'ops_lead', 'admin'],
    content_markdown: `
# Welcome to Elite Vending Operations Platform

This comprehensive platform manages every aspect of your vending operation, from machine monitoring to financial reporting.

## Key Modules

### Operations Core
- **Dashboard**: Real-time overview of your entire operation
- **Machines**: Monitor status, health, and performance of all vending machines  
- **Locations**: Manage venue relationships and site details
- **Inventory**: Track stock levels, planograms, and reorder needs
- **Routes**: Plan and optimize service routes for maximum efficiency

### Financial Management
- **Sales Analytics**: Track revenue trends and product performance
- **Payments**: Monitor payment processing and settlement
- **Finance**: Comprehensive P&L, cash flow, and financial reporting
- **Refunds**: Process customer refunds and manage disputes

### Support & Maintenance
- **Alerts**: Real-time notifications for operational issues
- **Service Tickets**: Track maintenance and repair workflows
- **Complaints**: Handle customer feedback and resolution

### Intelligence & Analytics
- **AI Insights**: Predictive analytics for demand forecasting and optimization
- **AI Assistant**: Chat with your data for instant business insights
- **Energy & ESG**: Monitor environmental impact and energy efficiency
- **Location Intelligence**: Optimize placement and product mix

### Administration
- **Team Management**: Control user access and permissions
- **Feature Management**: Configure platform capabilities
- **Developer Portal**: API access and integrations
- **System Settings**: Platform configuration and preferences

## Quick Start Steps

1. **Complete Onboarding**: Run the setup wizard to configure your operation
2. **Add Locations**: Set up your venue partnerships
3. **Register Machines**: Connect your vending machines to the platform
4. **Configure Products**: Build your product catalog and pricing
5. **Set Up Routes**: Create efficient service schedules
6. **Enable Integrations**: Connect payment processors and accounting systems

## User Roles

- **Owner**: Full platform access and business oversight
- **Ops Lead**: Day-to-day operations management
- **Driver**: Route completion and stock management
- **Tech**: Maintenance and service tickets
- **Accountant**: Financial data and compliance
- **Viewer**: Read-only access to reports and data

## Support Resources

- Use the **Help Center** for detailed guides and troubleshooting
- Contact support through the platform for urgent issues  
- Join our community forum for best practices and tips
    `,
    tags: ['overview', 'getting-started', 'platform', 'modules'],
    contextual_ui_paths: ['/dashboard', '/'],
    related_articles: ['onboarding-wizard', 'user-roles-permissions'],
    is_published: true
  },

  {
    id: 'onboarding-wizard',
    title: 'Complete Initial Setup with Onboarding Wizard',
    slug: 'onboarding-wizard',
    category: 'getting_started',
    subcategory: 'setup',
    target_roles: ['owner', 'ops_lead'],
    content_markdown: `
# Onboarding Wizard Setup Guide

The Onboarding Wizard intelligently configures your platform based on your specific operation.

## Questionnaire Sections

### Fleet Information
- **Fleet Size**: Number of vending machines you operate
- **Growth Plans**: Expected expansion timeline
- **Machine Types**: Snack, beverage, combo, coffee, fresh food

### Technology Setup
- **Cashless Readers**: Nayax, Cantaloupe, Payter, or others
- **Telemetry Standards**: DEX, NAMA-VDI, EVA-DTS capabilities
- **Connectivity**: WiFi, cellular, or offline operation needs

### Operations Model
- **Warehouse & Pre-kitting**: Centralized inventory management
- **Service Frequency**: How often machines are restocked
- **Geography**: Single area vs multi-region operations
- **Staff Roles**: Which team roles you need enabled

### Business Requirements
- **Cash Handling**: Physical cash collection and reconciliation
- **Perishables**: Expiry tracking and FEFO (First Expired, First Out)
- **Accounting Integration**: Xero, QuickBooks, or CSV exports
- **Compliance**: GST reporting and audit requirements
- **Energy Tracking**: Environmental impact monitoring

## Tier Recommendations

Based on your answers, the system recommends one of five tiers:

### Solo (1-5 machines)
- Simplified interface focused on essentials
- Manual inventory management
- Basic alert notifications
- Optional payment integration
- File-based telemetry uploads

### Small (6-25 machines) 
- Light pre-kitting workflows
- Basic route optimization
- Telemetry ingestion enabled
- Refunds processing console
- Inventory and planogram management

### Growing (26-100 machines)
- Advanced route optimization
- Warehouse management systems
- Cash bag reconciliation
- Alert orchestration and escalation
- Device fleet operations

### Pro (101-500 machines)
- Multi-region route management
- Advanced demand forecasting
- Reader lifecycle management
- API and webhook integrations
- Energy and ESG reporting

### Enterprise (500+ machines)
- All Pro features plus:
- SLA monitoring and reporting
- Audit export capabilities
- Feature flag management
- Sandbox environments
- Enhanced security controls

## Customization Options

After receiving your tier recommendation:

- **Review Settings**: See exactly which features will be enabled
- **Override Toggles**: Customize any recommended settings
- **Preview Impact**: Understand how changes affect your operation
- **Apply Configuration**: Save your personalized setup

## Re-running the Wizard

- Access anytime from Settings → Onboarding
- Creates versioned profiles for rollback capability
- Maintains audit trail of all configuration changes
- Can be used when expanding or changing business model

## Best Practices

1. **Be Honest**: Answer questions based on current reality, not aspirations
2. **Consider Growth**: Think 6-12 months ahead for feature needs
3. **Start Conservative**: You can always enable more features later
4. **Test Thoroughly**: Use sandbox mode to validate configuration
5. **Document Changes**: Use profile names that clearly indicate purpose
    `,
    tags: ['onboarding', 'setup', 'wizard', 'configuration'],
    contextual_ui_paths: ['/settings', '/onboarding'],
    related_articles: ['getting-started-overview', 'feature-management'],
    checklist_items: [
      {
        task: "Gather fleet information",
        description: "Count total machines and identify types",
        required_role: "ops_lead"
      },
      {
        task: "Inventory technology stack", 
        description: "List all readers, telemetry systems, and connectivity",
        required_role: "tech"
      },
      {
        task: "Define operational model",
        description: "Document service frequency and geography",
        required_role: "ops_lead"
      },
      {
        task: "Review business requirements",
        description: "Confirm accounting, compliance, and reporting needs",
        required_role: "owner"
      }
    ],
    is_published: true
  },

  // MACHINES & TELEMETRY
  {
    id: 'machine-management',
    title: 'Machine Management & Monitoring',
    slug: 'machine-management',
    category: 'machines_telemetry',
    subcategory: 'management',
    target_roles: ['ops_lead', 'tech', 'driver'],
    content_markdown: `
# Machine Management Guide

Effective machine management is the foundation of successful vending operations.

## Machine Registration

### Adding New Machines
1. Navigate to **Machines** → **Add Machine**
2. Enter machine details:
   - Machine ID (your internal identifier)
   - Location assignment
   - Machine type and model
   - Serial number
   - Installation date
3. Configure telemetry settings if applicable
4. Set up payment terminal assignments

### Bulk Import
- Use CSV templates for large fleet additions
- Validate data before import
- Review assignment conflicts
- Confirm location mappings

## Machine Status Monitoring

### Status Types
- **Online**: Machine is communicating normally
- **Offline**: No recent communication (check connectivity)
- **Maintenance**: Scheduled for service or repair  
- **Retired**: No longer in service

### Health Indicators
- **Signal Strength**: Communication quality
- **Last Heartbeat**: Most recent telemetry update
- **Error Codes**: Active fault conditions
- **Temperature**: Cooling system status (if applicable)

## Telemetry Integration

### Supported Standards
- **DEX (Data Exchange)**: Industry standard audit format
- **NAMA-VDI**: Vending machine communication protocol  
- **EVA-DTS**: European vending telemetry standard
- **Proprietary**: Manufacturer-specific formats

### Connection Methods
- **Direct Pull**: Platform retrieves data from machines
- **Webhook Push**: Machines send data to platform
- **File Upload**: Manual or automated file transfer
- **FTP/SFTP**: Scheduled file collection

### Troubleshooting Connectivity
1. **Check Network**: Verify internet connection at location
2. **Validate Credentials**: Ensure API keys are current
3. **Review Firewall**: Confirm required ports are open
4. **Test Communication**: Use built-in connection tests

## Machine Detail Views

### Overview Tab
- Current status and health metrics
- Recent activity and alerts
- Key performance indicators
- Quick action buttons

### Stock Status Tab  
- Current inventory levels by slot
- Low stock warnings
- Planogram configuration
- Expiry date tracking

### Service History Tab
- Maintenance records
- Visit logs and notes
- Parts replacement history
- Performance trends

### Financial Tab
- Sales revenue by period
- Payment method breakdown
- Commission calculations  
- Profitability analysis

## Maintenance Scheduling

### Preventive Maintenance
- Set up recurring schedules based on:
  - Time intervals (monthly, quarterly)
  - Usage metrics (vends, hours)
  - Performance thresholds
- Automatic work order generation
- Parts and supply requirements

### Predictive Maintenance
- AI-powered failure prediction
- Component risk assessment
- Optimal timing recommendations
- Cost-benefit analysis

## Performance Optimization

### Key Metrics
- **Sales Volume**: Revenue and transaction counts
- **Fill Rate**: Percentage of capacity utilized
- **Uptime**: Availability and reliability
- **Efficiency**: Sales per visit or per day

### Improvement Actions
- Adjust planogram based on demand patterns
- Optimize service frequency
- Address recurring technical issues
- Consider location or product changes

## Mobile Management

### Driver Interface
- Machine status at-a-glance
- Stock level verification
- Issue reporting capability
- Photo documentation tools

### Tech Interface  
- Diagnostic information access
- Service ticket integration
- Parts inventory tracking
- Completion workflow

## Alerts and Notifications

### Automatic Alerts
- Machine offline detection
- Low stock warnings
- Temperature excursions
- Payment system errors
- Unusual activity patterns

### Alert Routing
- Configure recipient rules by:
  - Alert type and priority
  - Machine location or type
  - Time of day and escalation
  - Communication channel preferences

## Reporting and Analytics

### Standard Reports
- Fleet status summary
- Performance rankings
- Maintenance schedules
- Error frequency analysis

### Custom Dashboards
- Create role-specific views
- Filter by location, type, or status
- Set up automated delivery
- Export capabilities for external analysis

## Best Practices

1. **Regular Monitoring**: Check machine status daily
2. **Proactive Maintenance**: Address issues before they cause downtime
3. **Data Quality**: Ensure accurate machine information
4. **Documentation**: Maintain detailed service records
5. **Training**: Keep staff updated on procedures and tools
    `,
    tags: ['machines', 'monitoring', 'telemetry', 'maintenance'],
    contextual_ui_paths: ['/machines', '/machines/edit'],
    related_articles: ['telemetry-setup', 'maintenance-workflows'],
    is_published: true
  },

  // INVENTORY & PLANOGRAMS  
  {
    id: 'inventory-management',
    title: 'Inventory Management & Planograms',
    slug: 'inventory-management', 
    category: 'inventory_planograms',
    subcategory: 'management',
    target_roles: ['ops_lead', 'driver'],
    content_markdown: `
# Inventory Management Guide

Effective inventory management reduces waste, maximizes sales, and ensures customer satisfaction.

## Product Catalog Management

### Adding Products
1. Navigate to **Inventory** → **Products** → **Add Product**
2. Enter product details:
   - SKU (Stock Keeping Unit)
   - Product name and description
   - Brand and category
   - Cost and retail pricing
   - GST rate and tax information
3. Configure storage requirements:
   - Temperature requirements (ambient, chilled, frozen)
   - Shelf life and expiry tracking
   - Special handling notes

### Product Information
- **Barcode Scanning**: Support for UPC/EAN codes
- **Supplier Integration**: Link to supplier records
- **Nutritional Data**: Allergen and dietary information
- **Marketing Assets**: Product images and descriptions

## Planogram Design

### What is a Planogram?
A planogram defines which products go in which machine slots, optimizing:
- Product visibility and accessibility
- Sales performance and profitability  
- Inventory efficiency and freshness
- Customer satisfaction

### Creating Planograms
1. **Machine Template**: Start with machine layout
2. **Product Assignment**: Assign SKUs to specific slots
3. **Capacity Setting**: Define maximum units per slot
4. **Pricing Configuration**: Set selling prices per location
5. **Fill Priorities**: Rank products for restocking order

### Optimization Factors
- **Sales Velocity**: How quickly products sell
- **Profit Margins**: Higher margin products in prime slots
- **Complementary Products**: Strategic placement of related items
- **Seasonal Variations**: Adjust mix based on weather/events

## Stock Level Monitoring

### Current Inventory
- Real-time stock levels across all machines
- Color-coded alerts for low stock situations
- Par level violations and reorder triggers
- Expiry date warnings and FIFO alerts

### Replenishment Planning
- **Automatic Reorder Points**: Set minimum stock levels
- **Economic Order Quantities**: Optimize order sizes
- **Lead Time Management**: Account for supplier delivery schedules
- **Seasonal Adjustments**: Modify levels for demand fluctuations

## Pre-kitting and Picking

### Wave Planning
1. **Route Analysis**: Group machines by service schedule
2. **Demand Forecasting**: Predict required quantities
3. **Inventory Allocation**: Reserve stock for specific routes
4. **Pick List Generation**: Create detailed picking instructions

### Picking Workflow
1. **Pick List Review**: Verify quantities and locations
2. **Warehouse Collection**: Gather products efficiently
3. **Quality Checks**: Inspect for damage or expiry
4. **Load Organization**: Pack by route and machine
5. **Documentation**: Record actual quantities picked

### Driver Instructions
- Machine-specific stock requirements
- Product placement guidance
- Expiry date verification requirements
- Return protocols for unsold items

## Expiry Management

### FIFO (First In, First Out)
- Automatic rotation recommendations
- Expiry date tracking by batch
- Urgent removal notifications
- Waste minimization strategies

### FEFO (First Expired, First Out)  
- Advanced expiry management for perishables
- Batch-level tracking and traceability
- Automatic stock rotation instructions
- Compliance reporting for audits

## Inventory Transactions

### Transaction Types
- **Receipts**: New stock arrivals from suppliers
- **Issues**: Stock sent to machines or routes
- **Adjustments**: Corrections for count discrepancies
- **Returns**: Products returned from machines
- **Shrinkage**: Loss due to damage, theft, or expiry

### Reconciliation Process
1. **Physical Counts**: Regular cycle counting programs
2. **Variance Analysis**: Investigate discrepancies
3. **Root Cause**: Identify reasons for differences
4. **Corrective Actions**: Address systematic issues
5. **Documentation**: Record findings and improvements

## Batch and Lot Tracking

### Traceability Requirements
- Supplier batch identification
- Manufacturing dates and expiry
- Quality certifications
- Recall preparedness

### Recall Management
- Rapid identification of affected products
- Location tracking across the fleet
- Customer notification procedures  
- Regulatory compliance reporting

## Demand Forecasting

### AI-Powered Predictions
- Historical sales analysis
- Seasonal pattern recognition
- Weather impact correlation
- Location-specific factors

### Manual Adjustments
- Special events and promotions
- New product launches
- Venue changes or relocations
- Market intelligence incorporation

## Performance Analytics

### Key Metrics
- **Inventory Turnover**: How efficiently stock is converted to sales
- **Fill Rate**: Percentage of demand met from available stock
- **Waste Percentage**: Products lost to expiry or damage
- **Carrying Costs**: Investment in inventory relative to sales

### Optimization Reports
- Product performance rankings
- Slow-moving inventory identification
- Planogram effectiveness analysis
- Cost reduction opportunities

## Mobile Inventory Management

### Driver App Features
- Real-time stock level updates
- Pick list management
- Return processing
- Photo documentation for discrepancies

### Offline Capabilities
- Work without internet connection
- Synchronize when connectivity restored  
- Conflict resolution for simultaneous updates
- Data integrity maintenance

## Integration Capabilities

### Supplier Systems
- Electronic Data Interchange (EDI)
- Automated purchase orders
- Delivery confirmation processing
- Invoice matching and approval

### Accounting Systems
- Cost of goods sold calculations
- Inventory valuation methods
- Tax reporting integration
- Financial statement preparation

## Best Practices

1. **Regular Audits**: Conduct frequent physical counts
2. **Data Accuracy**: Maintain clean product data
3. **Training Programs**: Ensure staff understand procedures
4. **Continuous Improvement**: Regularly review and optimize processes
5. **Technology Adoption**: Leverage AI and automation where possible
6. **Supplier Relationships**: Build strong partnerships for reliability
7. **Customer Focus**: Balance efficiency with product availability
    `,
    tags: ['inventory', 'planograms', 'stock', 'forecasting'],
    contextual_ui_paths: ['/inventory', '/inventory/planograms'],
    related_articles: ['route-optimization', 'demand-forecasting'],
    is_published: true
  },

  // Add more comprehensive articles covering all other modules...
  // This is a foundational structure that can be expanded for each feature area

];

export default helpArticles;