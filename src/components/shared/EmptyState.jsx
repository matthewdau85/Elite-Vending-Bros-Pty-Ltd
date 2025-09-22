import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ContextHelp from '../help/ContextHelp';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  ctaText,
  onCtaClick,
  helpArticleSlug
}) {
  return (
    <Card className="mt-8">
      <CardContent className="p-12 text-center">
        {Icon && <Icon className="mx-auto h-12 w-12 text-slate-400 mb-4" />}
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        <p className="text-slate-500 mt-2 mb-6 max-w-md mx-auto">{description}</p>
        <div className="flex justify-center items-center gap-4">
          {ctaText && onCtaClick && (
            <Button onClick={onCtaClick}>
              {ctaText}
            </Button>
          )}
          {helpArticleSlug && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-600">Need help?</span>
              <ContextHelp 
                articleSlug={helpArticleSlug}
                tooltipText="Learn more"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}