import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpArticle } from '@/api/entities';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { PageSkeleton } from '../components/shared/Skeletons';

export default function PublicDocsHome() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicArticles = async () => {
      setIsLoading(true);
      try {
        const publicArticles = await HelpArticle.filter({ is_public: true, is_published: true });
        setArticles(publicArticles);
      } catch (error) {
        console.error("Failed to load public articles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicArticles();
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Support Center</h1>
        <p className="mt-4 text-lg text-slate-600">Find answers and guides to help you with our services.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <Link to={`/docs/${article.slug}`} key={article.id}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform">
              <CardHeader>
                <div className="mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {article.content_markdown.split('\n')[0].replace(/###\s/g, '')}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
       {articles.length === 0 && (
        <p className="text-center text-slate-500 py-12">No public articles available at this time.</p>
      )}
    </div>
  );
}