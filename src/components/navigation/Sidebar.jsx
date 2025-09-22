import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navigationGroups } from './nav-config';
import NavGroup from './NavGroup';
import TopNavLink from './TopNavLink';

// Hook for localStorage persistence
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };

  return [value, setStoredValue];
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-isCollapsed', false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "flex h-full w-64 flex-col border-r bg-background text-foreground border-border",
          "shrink-0 transition-all duration-300 ease-in-out hidden md:flex",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-foreground">Elite Vending</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Pinned Dashboard link */}
        <TopNavLink collapsed={isCollapsed} onNavigate={handleNavigation} />

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent p-4 space-y-6">
          {navigationGroups.map((group) => (
            <NavGroup
              key={group.id}
              group={group}
              collapsed={isCollapsed}
              onNavigate={handleNavigation}
            />
          ))}
        </div>
      </aside>

      {/* Mobile Menu Button - visible only on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="bg-background shadow-md"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-background text-foreground border-border"
        >
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <h1 className="text-xl font-bold text-foreground">Elite Vending</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Pinned Dashboard link for mobile */}
            <TopNavLink collapsed={false} onNavigate={handleNavigation} />

            {/* Scrollable nav area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent p-4 space-y-6">
              {navigationGroups.map((group) => (
                <NavGroup
                  key={group.id}
                  group={group}
                  collapsed={false}
                  onNavigate={handleNavigation}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}