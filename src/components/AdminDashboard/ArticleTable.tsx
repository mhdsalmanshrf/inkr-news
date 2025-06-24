
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Eye, ToggleLeft, ToggleRight, Trash, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  source: string;
  category: string;
  is_live: boolean;
  reading_time: number;
  published_at: string;
  created_at: string;
  view_count?: number;
  ai_summary?: string;
}

interface ArticleTableProps {
  articles: Article[];
  onEditArticle: (article: Article) => void;
  onRefresh: () => void;
  filter: 'all' | 'live' | 'draft';
  sourceFilter: string;
}

const ArticleTable: React.FC<ArticleTableProps> = ({ 
  articles, 
  onEditArticle, 
  onRefresh,
  filter,
  sourceFilter 
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const filteredArticles = articles.filter(article => {
    const statusMatch = filter === 'all' || 
                       (filter === 'live' && article.is_live) || 
                       (filter === 'draft' && !article.is_live);
    
    const sourceMatch = !sourceFilter || 
                       article.source.toLowerCase().includes(sourceFilter.toLowerCase());
    
    return statusMatch && sourceMatch;
  });

  const toggleStatus = async (articleId: string, currentStatus: boolean) => {
    setLoading(prev => ({ ...prev, [articleId]: true }));
    
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_live: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: `Article ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error toggling article status:', error);
      toast({
        title: "Failed to update article status",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    setLoading(prev => ({ ...prev, [articleId]: true }));
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: "Article deleted successfully"
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Failed to delete article",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const generateAISummary = async (articleId: string) => {
    setLoading(prev => ({ ...prev, [`ai-${articleId}`]: true }));
    
    try {
      // This would call your AI generation edge function
      // For now, we'll show a placeholder
      toast({
        title: "AI Summary generation started",
        description: "This feature will be implemented with OpenAI integration"
      });
    } catch (error) {
      console.error('Error generating AI summary:', error);
    } finally {
      setLoading(prev => ({ ...prev, [`ai-${articleId}`]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-read-text-dim text-sm">
        Showing {filteredArticles.length} of {articles.length} articles
      </div>
      
      {filteredArticles.map((article) => (
        <Card key={article.id} className="bg-read-surface border-read-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-read-text font-serif text-lg mb-2">
                  {article.title}
                </CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant={article.is_live ? "default" : "outline"}
                    className={article.is_live ? "bg-green-500 text-white" : "border-read-border text-read-text-dim"}
                  >
                    {article.is_live ? 'Live' : 'Draft'}
                  </Badge>
                  <Badge variant="outline" className="border-read-border text-read-text-dim">
                    {article.source}
                  </Badge>
                  <Badge variant="outline" className="border-read-border text-read-text-dim">
                    {article.category}
                  </Badge>
                  {article.view_count && (
                    <div className="flex items-center gap-1 text-read-text-dim text-sm">
                      <Eye className="h-3 w-3" />
                      {article.view_count}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditArticle(article)}
                  className="text-read-text-dim hover:text-read-text"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStatus(article.id, article.is_live)}
                  disabled={loading[article.id]}
                  className="text-read-text-dim hover:text-read-accent"
                >
                  {article.is_live ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </Button>
                
                {!article.ai_summary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateAISummary(article.id)}
                    disabled={loading[`ai-${article.id}`]}
                    className="text-read-text-dim hover:text-read-accent"
                    title="Generate AI Summary"
                  >
                    <Brain className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteArticle(article.id)}
                  disabled={loading[article.id]}
                  className="text-read-text-dim hover:text-red-400"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-between items-center text-read-text-dim text-sm">
              <span>Published: {formatDate(article.published_at)}</span>
              <span>{article.reading_time} min read</span>
            </div>
            
            {article.subtitle && (
              <p className="text-read-text-dim text-sm mt-2 line-clamp-2">
                {article.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-read-text-dim">No articles found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default ArticleTable;
