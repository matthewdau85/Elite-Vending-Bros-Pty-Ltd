
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Search, BookOpen, ChevronRight, ThumbsUp, ThumbsDown, LifeBuoy, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '../components/shared/Skeletons';
import HelpTourChecklist from '../components/help/HelpTourChecklist';

import { HelpArticle } from '@/api/entities';
import { submitHelpFeedback } from '@/api/functions';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ArticleCard = ({ article, onSelect }) => (
  <div
    className="flex items-center justify-between p-4 cursor-pointer" // Removed bg-white rounded-lg shadow-sm hover:shadow-md to work better with parent's divide-y
    onClick={() => onSelect(article)}
  >
    <div className="flex items-center">
      <BookOpen className="w-5 h-5 text-blue-500 mr-3" />
      <span className="text-lg font-medium text-slate-800">{article.title}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-400" />
  </div>
);

const ArticleView = ({ article, onBack }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (wasHelpful) => {
    if (feedbackSent) return; // Prevent multiple submissions
    setIsSubmitting(true);
    try {
      // Assuming submitHelpFeedback sends feedback to a backend
      await submitHelpFeedback({ article_id: article.id, was_helpful: wasHelpful });
      toast.success("Thank you for your feedback!");
      setFeedbackSent(true); // Mark feedback as sent to update UI
    } catch (error) {
      toast.error("Failed to submit feedback.");
      console.error("Feedback submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800 mb-4" onClick={onBack}>
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Help Center
        </Button>
        <CardTitle>{article.title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {article.category && (
            <Badge variant="outline" className="capitalize">
              {article.category.replace(/_/g, ' ')}
            </Badge>
          )}
          {article.tags?.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-slate max-w-none">
          {/* Using content_markdown field for ReactMarkdown */}
          <ReactMarkdown>{article.content_markdown}</ReactMarkdown>
        </div>
        <div className="mt-8 pt-6 border-t">
          <h4 className="font-semibold text-center mb-3 text-slate-700">Was this article helpful?</h4>
          {feedbackSent ? (
            <p className="text-center text-green-600 font-medium">Thanks for your feedback!</p>
          ) : (
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => handleFeedback(true)} disabled={isSubmitting}>
                <ThumbsUp className="w-4 h-4 mr-2" /> Yes
              </Button>
              <Button variant="outline" onClick={() => handleFeedback(false)} disabled={isSubmitting}>
                <ThumbsDown className="w-4 h-4 mr-2" /> No
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function HelpCenter({ contextPath }) {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Load articles using HelpArticle entity
  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch data from your API via the HelpArticle entity
      // const allArticles = await HelpArticle.list();
      // For demonstration, using mock data that matches the expected structure (content_markdown, slug, tags)
      const mockArticles = [
        {
          id: '1',
          title: 'Getting Started with Your Dashboard',
          category: 'getting_started',
          content_markdown: `## Welcome to Your Dashboard!\n\nThis guide helps you navigate your personalized dashboard, the central hub for all your activities.\n\n### Key Sections:\n1.  **Overview**: A quick glance at your recent activity and key metrics.\n2.  **Projects**: Access and manage all your projects.\n3.  **Tasks**: View and update your assigned tasks.\n\n### Quick Tips:\n*   Use the navigation sidebar on the left to quickly jump between sections.\n*   The search bar at the top allows you to find anything quickly.\n\nIf you have any questions, feel free to use the search bar in the Help Center!\n`,
          slug: 'getting-started-dashboard',
          tags: ['dashboard', 'onboarding', 'start']
        },
        {
          id: '2',
          title: 'How to Create a New Project',
          category: 'projects',
          content_markdown: `### Step-by-step Guide to Project Creation\n\nCreating a new project is straightforward. Follow these steps:\n\n1.  **Navigate to Projects**: From your dashboard, click on 'Projects' in the left sidebar.\n2.  **Click 'New Project'**: On the projects page, you'll see a prominent 'New Project' button, usually in the top right corner.\n3.  **Fill in Details**: A form will appear. Provide the project name, description, and any other required fields.\n4.  **Assign Members (Optional)**: You can invite team members to your project at this stage or later.\n5.  **Save**: Click 'Create Project' to finalize.\n\nYour new project will now appear in your project list. You can start adding tasks and collaborating immediately.`,
          slug: 'create-new-project',
          tags: ['projects', 'creation', 'setup']
        },
        {
          id: '3',
          title: 'Managing User Permissions',
          category: 'account_management',
          content_markdown: `### Understanding and Managing User Permissions\n\nPermissions control what actions users can perform within your account.\n\n#### Roles:\n*   **Admin**: Full access to all features, including billing and user management.\n*   **Editor**: Can create, edit, and delete content within projects they have access to.\n*   **Viewer**: Can only view content, no editing capabilities.\n\n#### How to Change Permissions:\n1.  Go to 'Settings' > 'Team Members'.\n2.  Locate the user you wish to modify.\n3.  Click on their current role to open a dropdown menu.\n4.  Select the new role and save changes.\n\n**Note**: Be cautious when assigning Admin roles, as they have extensive control over your account.`,
          slug: 'manage-user-permissions',
          tags: ['admin', 'users', 'security', 'roles']
        },
        {
          id: '4',
          title: 'Understanding Analytics Reports',
          category: 'analytics',
          content_markdown: `### Deep Dive into Your Analytics Reports\n\nOur analytics reports provide valuable insights into your data, helping you make informed decisions.\n\n#### Key Metrics:\n*   **Engagement Rate**: How actively users interact with your content.\n*   **Completion Rate**: The percentage of tasks or projects completed.\n*   **User Activity**: A timeline of user actions within the platform.\n\n#### Navigating Reports:\n1.  **Access Analytics**: Click 'Analytics' in the main navigation.\n2.  **Select Report Type**: Choose from predefined reports or create a custom view.\n3.  **Filter Data**: Use date ranges, project filters, and user filters to narrow down results.\n\nFor detailed explanations of each metric, hover over the 'i' icon next to its name in the report.`,
          slug: 'analytics-reports-guide',
          tags: ['analytics', 'reports', 'data', 'metrics']
        },
        {
          id: '5',
          title: 'Troubleshooting Common Issues',
          category: 'troubleshooting',
          content_markdown: `### Solutions to Frequently Encountered Problems\n\nFacing an issue? Check these common solutions before contacting support.\n\n#### 1. Page Not Loading / Blank Screen:\n*   **Clear Cache**: Try clearing your browser's cache and cookies.\n*   **Try Different Browser**: Test if the issue persists in another browser.\n*   **Check Internet Connection**: Ensure you have a stable internet connection.\n\n#### 2. Cannot Log In:\n*   **Password Reset**: Use the 'Forgot Password' link on the login page. (This assumes you have a "Forgot Password" feature)\n*   **Check Caps Lock**: Ensure your Caps Lock is not enabled.\n*   **Correct Email**: Verify you're using the correct email associated with your account.\n\nIf these steps don't resolve your issue, please contact our support team with details.`,
          slug: 'troubleshooting-common-issues',
          tags: ['faq', 'errors', 'support', 'login']
        },
        {
          id: '6',
          title: 'Setting Up Your Profile',
          category: 'getting_started',
          content_markdown: `### Personalizing Your User Profile\n\nYour profile allows you to customize your experience and share information with your team.\n\n#### What You Can Edit:\n*   **Name**: Your display name.\n*   **Email**: Your primary contact email (may require verification).\n*   **Profile Picture**: Upload a photo to personalize your account.\n*   **Timezone**: Adjust for accurate timestamps.\n*   **Notifications**: Configure how and when you receive alerts.\n\n#### How to Edit:\n1.  Click on your profile avatar/icon in the top right corner.\n2.  Select 'Profile Settings' or 'My Account'.\n3.  Make your desired changes and click 'Save Changes'.`,
          slug: 'setup-user-profile',
          tags: ['profile', 'settings', 'personalization']
        },
      ];

      setArticles(mockArticles); // Set all articles
      setFilteredArticles(mockArticles); // Initialize filtered articles with all articles
    } catch (error) {
      toast.error("Failed to load help articles.");
      console.error("Error loading articles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load articles on component mount
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Effect to filter articles based on search term
  useEffect(() => {
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = articles.filter(article => {
        const titleMatch = article.title?.toLowerCase().includes(lowercasedFilter);
        const contentMatch = article.content_markdown?.toLowerCase().includes(lowercasedFilter);
        const categoryMatch = article.category?.toLowerCase().includes(lowercasedFilter);
        const tagsMatch = article.tags?.some(tag => tag.toLowerCase().includes(lowercasedFilter));
        
        return titleMatch || contentMatch || categoryMatch || tagsMatch;
      });
      setFilteredArticles(filtered);
    } else {
      // If no search term, show all articles
      setFilteredArticles(articles);
    }
  }, [searchTerm, articles]);

  // Group filtered articles by category and sort them
  const groupedArticles = useMemo(() => {
    const grouped = filteredArticles.reduce((acc, article) => {
      // Use 'uncategorized' for articles without a category, or the actual category
      const category = article.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(article);
      return acc;
    }, {});
    // Sort categories alphabetically by key
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped = {};
    sortedKeys.forEach(key => {
      sortedGrouped[key] = grouped[key];
    });
    return sortedGrouped;
  }, [filteredArticles]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <LifeBuoy className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-slate-900">Help Center</h1>
          <p className="text-slate-600 mt-2">Find answers, tutorials, and best practices.</p>
          <div className="relative mt-6 max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search for articles..."
              className="pl-12 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(groupedArticles).map(([category, articles]) => (
            <Card key={category} className="shadow-sm">
              <CardHeader>
                <CardTitle className="capitalize">{category.replace('_', ' ')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-slate-100">
                  {articles.map(article => <ArticleCard key={article.id} article={article} onSelect={setSelectedArticle} />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="mt-8 bg-slate-50 border-dashed">
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 bg-white rounded-lg border">
              <ShieldCheck className="w-6 h-6 text-blue-600"/>
            </div>
            <div>
              <CardTitle>Docs Health Radar</CardTitle>
              <CardDescription>View our internal documentation quality and coverage report.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
             <Link to="/help/radar">
                <Button variant="outline">
                    Go to Radar
                </Button>
             </Link>
          </CardContent>
        </Card>

        {Object.values(groupedArticles).flat().length === 0 && searchTerm && (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold">No articles found for "{searchTerm}"</h3>
            <p className="text-slate-500 mt-2">Try searching for a different keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}
