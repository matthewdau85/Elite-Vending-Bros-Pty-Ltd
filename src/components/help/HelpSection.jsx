import React from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function HelpSection({ title, icon: Icon, children }) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-blue-600" />
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="prose prose-sm prose-slate max-w-none">
              {children}
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}