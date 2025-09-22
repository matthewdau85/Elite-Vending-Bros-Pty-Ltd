import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function TopNavLink({ collapsed, onNavigate, to = '/dashboard', label = 'Dashboard' }) {
  const { pathname } = useLocation();
  const isActive = pathname === to || (pathname === '/' && to === '/dashboard');

  const content = (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors outline-none w-full",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        "text-sm font-medium",
        "focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
    >
      <Gauge className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate leading-5">{label}</span>}
    </Link>
  );
  
  const parentClasses = "px-4 pt-4 pb-2 border-b border-border";

  if (collapsed) {
    return (
      <div className={parentClasses}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="text-foreground">
              <p className="text-sm font-medium">{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return <div className={parentClasses}>{content}</div>;
}