import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ContextHelp({ articleSlug, tooltipText = "Get help for this page" }) {
  if (!articleSlug) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={`/help?article=${articleSlug}`}>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}