import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ crumbs }) {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
              )}
              <Link
                to={crumb.href}
                className={`ml-2 text-sm font-medium ${
                  index === crumbs.length - 1
                    ? 'text-slate-700 cursor-default'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-current={index === crumbs.length - 1 ? 'page' : undefined}
                onClick={(e) => index === crumbs.length - 1 && e.preventDefault()}
              >
                {crumb.label}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}