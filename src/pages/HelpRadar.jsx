import React, { useState, useEffect } from 'react';
import { HelpArticle, HelpFeedback } from '@/api/entities';
import { featureRegistry } from '@/components/help/content/featureRegistry.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, Frown, Smile } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { PageSkeleton } from '@/components/shared/Skeletons';

const STALE_DOC_DAYS = 90;

export default function HelpRadarPage() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateReport = async () => {
      setIsLoading(true);
      const [articles, feedbacks] = await Promise.all([
        HelpArticle.list(),
        HelpFeedback.list(),
      ]);

      const articleMap = new Map(articles.map(a => [a.slug, a]));
      const feedbackMap = new Map();

      feedbacks.forEach(f => {
        if (!feedbackMap.has(f.article_id)) {
          feedbackMap.set(f.article_id, { helpful: 0, notHelpful: 0, count: 0 });
        }
        const entry = feedbackMap.get(f.article_id);
        entry.count++;
        if (f.was_helpful) {
          entry.helpful++;
        } else {
          entry.notHelpful++;
        }
      });

      let totalRequired = 0;
      let totalCovered = 0;

      const featureDetails = featureRegistry.map(feature => {
        totalRequired += feature.requiredDocs.length;
        const coveredDocs = feature.requiredDocs.filter(slug => articleMap.has(slug));
        totalCovered += coveredDocs.length;

        const coverage = feature.requiredDocs.length > 0 ? (coveredDocs.length / feature.requiredDocs.length) * 100 : 100;
        
        const staleArticles = coveredDocs
          .map(slug => articleMap.get(slug))
          .filter(article => differenceInDays(new Date(), new Date(article.updated_date)) > STALE_DOC_DAYS);

        const articleFeedback = coveredDocs.map(slug => {
          const article = articleMap.get(slug);
          const feedback = feedbackMap.get(article.id);
          if (!feedback || feedback.count === 0) return { score: null };
          return {
            score: (feedback.helpful / feedback.count) * 100,
            count: feedback.count
          };
        }).filter(f => f.score !== null);
        
        const avgFeedbackScore = articleFeedback.length > 0
          ? articleFeedback.reduce((sum, f) => sum + f.score, 0) / articleFeedback.length
          : null;

        let priority = 0;
        if (coverage < 100) priority += 3;
        if (staleArticles.length > 0 && feature.isCritical) priority += 2;
        if (avgFeedbackScore !== null && avgFeedbackScore < 70) priority += 1;
        
        return {
          ...feature,
          coverage,
          staleArticles,
          avgFeedbackScore,
          priority
        };
      });

      const overallCoverage = totalRequired > 0 ? (totalCovered / totalRequired) * 100 : 100;
      
      setReport({
        overallCoverage,
        features: featureDetails.sort((a, b) => b.priority - a.priority),
      });
      setIsLoading(false);
    };

    generateReport();
  }, []);

  if (isLoading) {
    return <PageSkeleton />;
  }

  const getPriorityBadge = (priority) => {
    if (priority >= 4) return <Badge variant="destructive">High Priority</Badge>;
    if (priority >= 2) return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medium</Badge>;
    if (priority > 0) return <Badge variant="outline">Low</Badge>;
    return <Badge variant="outline" className="bg-green-100 text-green-800">OK</Badge>;
  };
  
  const getCoverageColor = (coverage) => {
    if (coverage < 75) return "bg-red-500";
    if (coverage < 95) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Docs Health Radar</h1>
          <p className="text-slate-600 mt-1">Automated analysis of documentation coverage, freshness, and quality.</p>
        </div>

        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Overall Documentation Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-bold ${report.overallCoverage < 95 ? 'text-red-600' : 'text-green-600'}`}>
                {report.overallCoverage.toFixed(1)}%
              </span>
              <div className="flex-1">
                <Progress value={report.overallCoverage} className={getCoverageColor(report.overallCoverage)} />
                <p className="text-sm text-slate-500 mt-2">
                  Target: 95%. This check will fail in CI if coverage drops below the target.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Feature Documentation Status</CardTitle>
            <CardDescription>Features are prioritized by missing docs, stale critical content, and poor feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.features.map(feature => (
                  <TableRow key={feature.key}>
                    <TableCell className="font-medium">{feature.title}</TableCell>
                    <TableCell>{getPriorityBadge(feature.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={feature.coverage} className="w-24" />
                        <span>{feature.coverage.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {feature.coverage < 100 && (
                           <div className="flex items-center gap-1 text-red-600">
                             <AlertCircle className="w-3 h-3" /> Missing Docs
                           </div>
                        )}
                        {feature.staleArticles.length > 0 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="w-3 h-3" /> Stale Content
                          </div>
                        )}
                        {feature.coverage === 100 && feature.staleArticles.length === 0 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3 h-3" /> Up to date
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {feature.avgFeedbackScore !== null ? (
                        <div className="flex items-center gap-2">
                           {feature.avgFeedbackScore >= 80 ? <Smile className="w-4 h-4 text-green-500" /> : <Frown className="w-4 h-4 text-yellow-500" />}
                           <span>{feature.avgFeedbackScore.toFixed(0)}% helpful</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No feedback</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}