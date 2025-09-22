
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import HelpCopyButton from './HelpCopyButton';

export default function HelpArticleView({ article, onHeadingsChange }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && onHeadingsChange) {
      const headingElements = contentRef.current.querySelectorAll('h2, h3');
      const headings = Array.from(headingElements).map(el => ({
        id: el.id,
        text: el.innerText,
        level: parseInt(el.tagName.substring(1), 10)
      }));
      onHeadingsChange(headings);
    }
  }, [article, onHeadingsChange]);

  const slugify = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  return (
    <div className="prose prose-slate max-w-none lg:prose-lg prose-headings:scroll-mt-24 prose-h2:border-b prose-h2:pb-2">
      <div className="not-prose mb-8">
        {article.updatedAt && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {format(new Date(article.updatedAt), 'MMMM d, yyyy')}</span>
            </div>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{article.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags && article.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </div>
      <div ref={contentRef}>
        <ReactMarkdown
          components={{
            h2: ({ children, ...props }) => {
              // Clean props to remove any unwanted attributes
              const cleanProps = { id: slugify(children) };
              return <h2 {...cleanProps}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const cleanProps = { id: slugify(children) };
              return <h3 {...cleanProps}>{children}</h3>;
            },
            p: ({ children }) => <p>{children}</p>,
            ul: ({ children }) => <ul>{children}</ul>,
            li: ({ children }) => <li>{children}</li>,
            strong: ({ children }) => <strong>{children}</strong>,
            pre: ({ children }) => (
              <div className="relative group">
                <HelpCopyButton text={children} />
                <pre className="bg-slate-900 text-white p-4 rounded-lg">{children}</pre>
              </div>
            ),
            code: ({ inline, children }) => {
              if (inline) {
                return <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-sm">{children}</code>;
              }
              return <code>{children}</code>;
            }
          }}
          skipHtml={false}
          unwrapDisallowed={false}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
