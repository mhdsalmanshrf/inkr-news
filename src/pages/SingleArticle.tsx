import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Bookmark, BookmarkCheck, Eye, Share2, TrendingUp } from 'lucide-react';
import ReadingProgress from '@/components/ReadingProgress';
import AIInsights from '@/components/ArticleAI/AIInsights';
import { toast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  ai_summary?: string;
  source: string;
  source_url?: string;
  published_at: string;
  reading_time: number;
  category: string;
  ai_tags?: string[];
  is_trending: boolean;
  view_count: number;
  is_bookmarked?: boolean;
}

const SingleArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
      incrementViewCount();
    }
  }, [articleId, user]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticle = async () => {
    try {
      const { data: articleData, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('is_live', true)
        .single();

      if (error) throw error;

      if (articleData) {
        // Check if bookmarked
        let isBookmarked = false;
        if (user) {
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('article_id', articleId)
            .single();
          
          isBookmarked = !!bookmark;
        }

        setArticle({ ...articleData, is_bookmarked: isBookmarked });

        // Fetch related articles with all required fields
        const { data: related } = await supabase
          .from('articles')
          .select('id, title, subtitle, content, summary, ai_summary, source, source_url, category, ai_tags, reading_time, published_at, is_trending, view_count')
          .eq('is_live', true)
          .neq('id', articleId)
          .or(`category.eq.${articleData.category}`)
          .limit(3);

        setRelatedArticles(related || []);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!articleId) return;
    
    try {
      await supabase.rpc('increment_view_count', { article_id: articleId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!article) return;

    try {
      if (article.is_bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', article.id);
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            article_id: article.id
          });
      }

      setArticle(prev => prev ? { ...prev, is_bookmarked: !prev.is_bookmarked } : null);
      
      toast({
        title: article.is_bookmarked ? "Bookmark removed" : "Bookmark added"
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-read-text">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-read-text mb-4">Article not found</h1>
          <Button 
            onClick={() => navigate('/home')} 
            className="bg-read-accent hover:bg-read-accent/90 text-black"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-read-bg">
      {/* Header */}
      <div className="sticky top-0 bg-read-surface/95 backdrop-blur-sm border-b border-read-border z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-read-text-dim hover:text-read-text"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-read-text-dim hover:text-read-text"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="text-read-text-dim hover:text-read-accent"
              >
                {article.is_bookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <ReadingProgress currentStory={1} totalStories={1} />
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <Badge variant="outline" className="border-read-border text-read-text-dim">
              {article.source}
            </Badge>
            
            <Badge variant="outline" className="border-read-border text-read-text-dim">
              {article.category}
            </Badge>
            
            {article.is_trending && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            
            <div className="flex items-center gap-4 text-read-text-dim text-sm">
              <span>{article.reading_time} min read</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.view_count || 0} views
              </span>
            </div>
          </div>
          
          <h1 className="font-serif font-light leading-tight mb-6 text-4xl text-read-text">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="font-serif italic leading-relaxed mb-6 text-xl text-read-text-dim">
              {article.subtitle}
            </p>
          )}

          {article.ai_summary && (
            <div className="bg-read-accent/10 border border-read-accent/20 rounded-lg p-6 mb-6">
              <h3 className="text-read-accent font-medium mb-2">AI Summary</h3>
              <p className="text-read-text leading-relaxed">{article.ai_summary}</p>
            </div>
          )}
          
          <div className="text-read-text-dim font-sans text-sm flex items-center justify-between">
            <span>{formatDate(article.published_at)}</span>
            {article.source_url && (
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-read-accent hover:underline"
              >
                View Original
              </a>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none font-serif leading-relaxed text-lg text-read-text">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-justify">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        {/* AI Insights Section */}
        <div className="mt-12 pt-8 border-t border-read-border">
          <AIInsights
            articleId={article.id}
            title={article.title}
            content={article.content}
            aiSummary={article.ai_summary}
          />
        </div>

        {/* AI Tags */}
        {article.ai_tags && article.ai_tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-read-border">
            <h4 className="text-read-text font-medium mb-3">Related Topics</h4>
            <div className="flex gap-2 flex-wrap">
              {article.ai_tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-read-border text-read-text-dim"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-read-border">
            <h3 className="text-2xl font-serif text-read-text mb-6">More like this</h3>
            <div className="grid gap-4">
              {relatedArticles.map((related) => (
                <Card
                  key={related.id}
                  className="bg-read-surface border-read-border hover:border-read-accent/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/article/${related.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-serif text-read-text mb-2 hover:text-read-accent transition-colors">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-read-text-dim">
                          <span>{related.source}</span>
                          <span>{related.reading_time} min</span>
                          <span>{formatDate(related.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Reading Progress Indicator */}
      <div 
        className="fixed bottom-0 left-0 h-1 bg-read-accent transition-all duration-150 ease-out z-20"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default SingleArticle;
