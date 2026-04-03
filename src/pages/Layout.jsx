

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  LifeBuoy // Added icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User } from "@/api/entities";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Machines",
    url: createPageUrl("Machines"),
    icon: Coffee,
  },
  {
    title: "Locations",
    url: createPageUrl("Locations"),
    icon: MapPin,
  },
  {
    title: "Inventory",
    url: createPageUrl("Inventory"), 
    icon: Package,
  },
  {
    title: "Routes",
    url: createPageUrl("Routes"),
    icon: Truck,
  },
  {
    title: "Sales",
    url: createPageUrl("Sales"),
    icon: BarChart3,
  },
  {
    title: "Finance",
    url: createPageUrl("Finance"),
    icon: DollarSign,
  },
  {
    title: "Alerts",
    url: createPageUrl("Alerts"),
    icon: AlertTriangle,
  },
  {
    title: "AI Insights",
    url: createPageUrl("AIInsights"),
    icon: Brain,
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIAgent"),
    icon: Bot,
  },
  {
    title: "Users",
    url: createPageUrl("Users"),
    icon: Settings,
  },
  {
    title: "Admin",
    url: createPageUrl("Admin"),
    icon: Settings,
  },
  {
    title: "Help",
    url: createPageUrl("Help"),
    icon: LifeBuoy,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [uiDensity, setUiDensity] = useState("comfortable");

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const user = await User.me();
        if (user?.preferences?.ui_density) {
          setUiDensity(user.preferences.ui_density);
        }
      } catch (error) {
        // If user data can't be loaded, just use default preferences
        console.log("Could not load user preferences, using defaults");
        setUiDensity("comfortable");
      }
    };
    
    // Only fetch preferences if we're not already loading
    fetchUserPreferences();
  }, []);

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full bg-slate-50 ${uiDensity === 'compact' ? 'compact' : ''}`}>
        <style>{`
          .compact .p-4 { padding: 0.75rem; }
          .compact .p-6 { padding: 1rem; }
          .compact .p-8 { padding: 1.5rem; }
          .compact .py-2 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .compact .px-3 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .compact .gap-4 { gap: 0.75rem; }
          .compact .gap-6 { gap: 1rem; }
          .compact .mb-8 { margin-bottom: 1.5rem; }
          .compact .text-3xl { font-size: 1.5rem; line-height: 2rem; }
          .compact .h-20 { height: 4rem; }
          .compact .h-10 { height: 2.25rem; }
          .compact .min-h-12 { min-height: 2.5rem; }
          .compact td, .compact th { padding: 0.5rem 0.75rem; }
          .compact .rounded-lg { border-radius: 0.375rem; }
        `}</style>

        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              {/* Logo: replace src with a local asset path (e.g. /logo.jpg) once available */}
              <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg select-none" aria-label="Elite Vending Bros logo">EV</div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-tight">
                  The Elite Vending<br />
                  Bros Pty Ltd
                </h2>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Operations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg ${
                          location.pathname.startsWith(item.url) 
                            ? 'bg-blue-50 text-blue-700 font-semibold' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <div>
                <h1 className="text-base font-semibold text-slate-900 leading-tight">
                  The Elite Vending<br />
                  Bros Pty Ltd
                </h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

