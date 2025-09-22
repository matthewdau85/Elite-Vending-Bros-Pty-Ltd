import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelpArticle, HelpFeedback } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Search, BookOpen, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '../shared/Skeletons';

const ArticleCard = ({ article, onSelect }) => (
  <div 
    className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
    onClick={() => onSelect(article)}
  >
    <div className="flex items-center gap-4">
      <div className="p-2 bg-slate-100 rounded-md">
        <BookOpen className="w-5 h-5 text-slate-600" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">{article.title}</h4>
        <div className="flex gap-2 mt-1">
          {article.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-400" />
  </div>
);

const ArticleView = ({ article, onBack, user }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = async (wasHelpful) => {
    if (feedbackSent) {
      toast.info("You've already provided feedback for this article.");
      return;
    }
    try {
      await HelpFeedback.create({
        article_id: article.id,
        user_email: user.email,
        rating: wasHelpful ? 5 : 1,
        was_helpful: wasHelpful
      });
      toast.success("Thank you for your feedback!");
      setFeedbackSent(true);
    } catch (error) {
      toast.error("Failed to submit feedback.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <Button variant="link" className="p-0 h-auto text-blue-600 mb-4 -ml-1" onClick={onBack}>
          &larr; Back to Help Center
        </Button>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>Category: {article.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{article.content_markdown}</ReactMarkdown>
        </div>
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-semibold text-center mb-3">Was this article helpful?</h4>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" onClick={() => handleFeedback(true)} disabled={feedbackSent}>
              <ThumbsUp className="w-4 h-4 mr-2" /> Yes
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleFeedback(false)} disabled={feedbackSent}>
              <ThumbsDown className="w-4 h-4 mr-2" /> No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HelpCenter({ user }) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      try {
        const fetchedArticles = await HelpArticle.filter({ is_published: true });
        setArticles(fetchedArticles);

        // Check for article slug in query params
        const params = new URLSearchParams(location.search);
        const articleSlug = params.get('article');
        if (articleSlug) {
          const articleToSelect = fetchedArticles.find(a => a.slug === articleSlug);
          if (articleToSelect) {
            setSelectedArticle(articleToSelect);
          }
        }
      } catch (error) {
        toast.error("Failed to load help articles.");
      } finally {
        setIsLoading(false);
      }
    };
    loadArticles();
  }, [location.search]);

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    navigate(`/help?article=${article.slug}`, { replace: true });
  };

  const handleBack = () => {
    setSelectedArticle(null);
    navigate('/help');
  };

  const filteredArticles = useMemo(() => {
    if (!searchTerm) return articles;
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content_markdown.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [articles, searchTerm]);

  const categorizedArticles = useMemo(() => {
    return filteredArticles.reduce((acc, article) => {
      const category = article.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(article);
      return acc;
    }, {});
  }, [filteredArticles]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={handleBack} user={user} />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-slate-500 mt-2">Find answers and guidance on how to use the platform.</p>
        <div className="relative max-w-lg mx-auto mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search for articles..."
            className="pl-12 h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {Object.entries(categorizedArticles).length > 0 ? (
        Object.entries(categorizedArticles).map(([category, articlesInCategory]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category.replace('_', ' ')}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {articlesInCategory.map(article => (
                <ArticleCard key={article.id} article={article} onSelect={handleSelectArticle} />
              ))}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500">No articles found matching your search.</p>
        </div>
      )}
    </div>
  );
}