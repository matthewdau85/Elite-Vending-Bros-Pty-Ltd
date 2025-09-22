import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HelpArticle } from '@/api/entities';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '../components/shared/Skeletons';
import { AlertCircle } from 'lucide-react';

export default function PublicDoc() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const articles = await HelpArticle.filter({ slug: slug, is_public: true, is_published: true });
        if (articles.length > 0) {
          setArticle(articles[0]);
          document.title = `${articles[0].title} | Elite Vending Support`;
        } else {
          setError("Article not found or is not public.");
        }
      } catch (err) {
        console.error("Failed to load public article:", err);
        setError("Could not load the article. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Error</h2>
        <p className="text-slate-600 mt-2">{error}</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/docs">Back to Support Home</Link>
        </Button>
      </div>
    );
  }

  if (!article) {
    return null; // Should be handled by error state
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <Button asChild variant="link" className="p-0 h-auto mb-4">
            <Link to="/docs">&larr; Back to all articles</Link>
          </Button>
          <CardTitle className="text-3xl">{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown>{article.content_markdown}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}