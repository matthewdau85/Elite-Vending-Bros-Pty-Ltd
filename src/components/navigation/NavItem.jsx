import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getIcon } from './icon-map';

export default function NavItem({ item, collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

  const IconFromKey = getIcon(item.iconKey);
  const Icon = item.icon ?? IconFromKey;
  const label = item.label ?? item.name ?? item.id ?? "Item";

  const content = (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors outline-none",
        // active = filled with muted bg + solid fg
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        "text-sm font-medium",
        "focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate leading-5">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-foreground">
            <p className="text-sm font-medium">{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}