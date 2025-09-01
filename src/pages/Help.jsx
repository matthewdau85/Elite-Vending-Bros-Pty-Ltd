import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { 
  LayoutDashboard, 
  Coffee, 
  Package, 
  DollarSign, 
  Settings, 
  BarChart3,
  AlertTriangle,
  Truck,
  Brain,
  MapPin,
  Bot,
  Users,
  LifeBuoy
} from "lucide-react";
import HelpSection from "../components/help/HelpSection";

export default function HelpPage() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-blue-100">
                <LifeBuoy className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Help & Support Center</h1>
                <p className="text-slate-600 mt-1">
                    Your guide to all features in the Vending Operations application.
                </p>
            </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <HelpSection title="Dashboard" icon={LayoutDashboard}>
            <h4>Operations Dashboard</h4>
            <p>The dashboard provides a real-time, at-a-glance overview of your entire vending operation.</p>
            <ul>
              <li><strong>Stat Cards:</strong> Key metrics like machines online, today's revenue, critical alerts, and active locations.</li>
              <li><strong>Active Alerts:</strong> A list of the most recent, pressing issues that require your attention (e.g., low stock, machine offline). Click "View All Alerts" to go to the main Alerts page.</li>
              <li><strong>Machine Status:</strong> A quick look at recently updated machines and their current status (online, offline, maintenance). Click any machine to view its detailed page.</li>
              <li><strong>Today's Sales:</strong> A live feed of recent transactions.</li>
              <li><strong>Quick Actions:</strong> Large buttons to quickly navigate to the most common management pages.</li>
            </ul>
          </HelpSection>

          <HelpSection title="Machines & Locations" icon={Coffee}>
            <h4>Machine Fleet Management</h4>
            <p>This section allows you to manage all your physical vending machines.</p>
            <ul>
                <li><strong>Adding a Machine:</strong> Click the "Add Machine" button and fill in the details. You must assign it to a pre-existing Location.</li>
                <li><strong>Filtering:</strong> Use the status buttons (Online, Offline, etc.) and the search bar to find specific machines.</li>
                <li><strong>Machine Details:</strong> Click on any machine card to go to its detailed view, where you can manage its stock, view sales history, and see specific alerts.</li>
            </ul>
            <h4>Location Management</h4>
            <p>The Locations page lets you manage the physical sites where your machines are installed.</p>
            <ul>
                <li><strong>Adding a Location:</strong> Click "Add Location" to create a new site entry with address and contact details.</li>
                <li><strong>Deleting a Location:</strong> You can only delete a location if it has no machines assigned to it.</li>
            </ul>
          </HelpSection>

          <HelpSection title="Inventory & Products" icon={Package}>
            <h4>Inventory Management</h4>
            <p>This is your central hub for managing products, stock levels, and pricing across all machines.</p>
            <ul>
              <li><strong>Product Catalog:</strong> View all products you offer. You can add new products, edit existing ones, manage suppliers, and set costs/prices.</li>
              <li><strong>Stock Overview:</strong> See the current stock level of every product in every machine. You can directly edit stock counts and par levels from this table.</li>
              <li><strong>Reorder Planning:</strong> This tab automatically shows you which items are below their par (minimum) level and need restocking, helping you plan your warehouse orders.</li>
              <li><strong>Managing Pricing:</strong> From the Product Catalog, click the price on any product to open the pricing dialog. Here you can set a default price and override it for specific machines or locations.</li>
            </ul>
          </HelpSection>
          
          <HelpSection title="Routes & Visits" icon={Truck}>
            <h4>Route Management</h4>
            <p>Plan and manage restocking and maintenance routes for your operators.</p>
            <ul>
              <li><strong>Creating a Route:</strong> Click "Create New Route", give it a name, assign an operator (user), and select the machines to be included in the route.</li>
              <li><strong>Viewing a Route:</strong> Click "View Route Details" on any route card to see the planned stops, an optimized map, and a picking list of all products needed for that route.</li>
              <li><strong>Completing a Visit:</strong> On the Route Detail page, operators can complete visits for each machine, recording stock added, cash collected, and any issues found.</li>
            </ul>
          </HelpSection>

          <HelpSection title="Sales & Finance" icon={BarChart3}>
            <h4>Sales Analytics</h4>
            <p>Dive deep into your sales data to understand performance.</p>
            <ul>
              <li><strong>Filtering:</strong> Use the powerful filters at the top to narrow down data by date range, machine, location, product, or transaction status.</li>
              <li><strong>Overview Tab:</strong> See key metrics like total revenue, best-selling products, and top-performing machines for the selected filter period.</li>
              <li><strong>Analytics Tab:</strong> View charts that visualize sales trends over time, by location, and by product category.</li>
              <li><strong>Transactions Tab:</strong> A detailed, searchable table of every single sales transaction.</li>
            </ul>
            <h4>Financials</h4>
             <p>Track your profitability and manage payouts.</p>
            <ul>
                <li><strong>Financial Overview:</strong> Key metrics including Total Revenue, Cost of Goods Sold (COGS), Gross Profit, and margins.</li>
                <li><strong>Profit & Loss Chart:</strong> A chart showing your revenue vs. costs over time, giving you a clear view of your profitability trend.</li>
                <li><strong>Payouts Table:</strong> Shows a history of payouts received from your payment processor (e.g., Nayax).</li>
            </ul>
          </HelpSection>

          <HelpSection title="AI Tools" icon={Brain}>
             <h4>AI Insights</h4>
            <p>Leverage machine learning to get predictive insights and optimize your business.</p>
            <ul>
                <li><strong>Generate Insights:</strong> Click the "Generate AI Insights" button to have the AI analyze your data and produce forecasts. This can take a few moments.</li>
                <li><strong>Demand Forecasting:</strong> Predicts how many units of a product are likely to sell in a specific machine.</li>
                <li><strong>Predictive Maintenance:</strong> Forecasts potential machine failures before they happen.</li>
                <li><strong>Smart Pricing:</strong> Recommends optimal pricing for products to maximize profit.</li>
                 <li><strong>Clear AI Data:</strong> Use the "Clear All AI Data" button if you want to remove all generated predictions and start fresh.</li>
            </ul>
            <h4>AI Business Assistant</h4>
            <p>Chat with an AI that has full access to your business data. Ask it complex questions in plain English.</p>
            <ul>
                <li><strong>Start a Chat:</strong> Simply type a question into the input box at the bottom. Use the suggested prompts for ideas.</li>
                <li><strong>Example Questions:</strong> "Which 5 machines had the lowest sales last month?", "What is the profit margin for all Coca-Cola products?", "Plan an efficient restocking route for all machines that have low stock alerts."</li>
                <li><strong>Function Calls:</strong> The AI can perform actions like updating data. It will show you the "tools" it's using to answer your question.</li>
            </ul>
          </HelpSection>
          
          <HelpSection title="Admin & Users" icon={Settings}>
            <h4>Admin Panel</h4>
            <p>This is the control center for system settings and integrations. <strong>Caution:</strong> Changes here can have a major impact on the application.</p>
            <ul>
                <li><strong>Integrations:</strong> Set up your Nayax API credentials to enable data synchronization.</li>
                <li><strong>Product Mapping:</strong> When a new, unrecognized product is sold through Nayax, it appears here. You must map it to an existing product in your inventory to ensure accurate reporting.</li>
                <li><strong>Danger Zone:</strong> Contains the "Delete All Data" function. This is irreversible and will wipe all transactional data from your application. Use with extreme caution.</li>
            </ul>
             <h4>User Management</h4>
            <p>Manage who has access to the application.</p>
            <ul>
                <li><strong>Invite User:</strong> The "Invite User" button will send an email invitation to a new team member. (Note: This is managed by the base44 platform).</li>
                <li><strong>Roles:</strong> You can assign roles to users (e.g., Admin, Operator). Admins have access to all settings.</li>
                <li><strong>Deleting Users:</strong> For security reasons, user accounts must be deleted from the main base44 platform dashboard, not from within this application.</li>
            </ul>
          </HelpSection>

        </Accordion>
      </div>
    </div>
  );
}