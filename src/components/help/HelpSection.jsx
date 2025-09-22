import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';

export default function HelpSection({ markdownContent }) {
  return (
    <Card className="border-none shadow-none bg-slate-50">
      <CardContent className="pt-0 p-6">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-4 border-b pb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-3" {...props} />,
              p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 my-4 space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
              code: ({node, ...props}) => <code className="bg-slate-200 text-slate-800 rounded px-1 py-0.5 font-mono text-sm" {...props} />,
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}