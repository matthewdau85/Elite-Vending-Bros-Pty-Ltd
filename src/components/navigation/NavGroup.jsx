import React from 'react';
import NavItem from './NavItem';

export default function NavGroup({ group, collapsed, onNavigate }) {
  if (collapsed && !group.title) return null; // Don't render title-less groups when collapsed

  const groupLabel = group.label ?? group.title ?? "Navigation";

  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItem
            key={item.id ?? item.href}
            item={item}
            collapsed={true}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  return (
    <div key={group.id}>
      {group.title && (
        <h2
          id={`nav-group-${group.id ?? group.key ?? groupLabel}`}
          className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {groupLabel}
        </h2>
      )}
      <nav
        className="space-y-1"
        role="group"
        aria-labelledby={`nav-group-${group.id ?? group.key ?? groupLabel}`}
      >
        {group.items.map((item) => (
          <NavItem
            key={item.id ?? item.href}
            item={item}
            collapsed={false}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}