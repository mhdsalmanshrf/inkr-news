
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ReadingProgress from '@/components/ReadingProgress';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  source: string;
  published_at: string;
  reading_time: number;
  category: string;
}

const SingleArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const currentIndex = articles.findIndex(a => a.id === articleId);
  const totalArticles = articles.length;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch all live articles
        const { data: allArticles, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .eq('is_live', true)
          .order('published_at', { ascending: false });

        if (articlesError) throw articlesError;
        
        setArticles(allArticles || []);

        // Find the specific article
        const currentArticle = allArticles?.find(a => a.id === articleId);
        setArticle(currentArticle || null);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticles();
    }
  }, [articleId]);

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
          <Button onClick={() => navigate('/')} className="bg-read-accent hover:bg-read-accent/90 text-black">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-read-bg">
      {/* Header */}
      <div className="sticky top-0 bg-read-surface/95 backdrop-blur-sm border-b border-read-border z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-read-text-dim hover:text-read-text"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Today's Edition
            </Button>
            <div className="text-read-text-dim font-sans text-sm">
              {formatDate(article.published_at)}
            </div>
          </div>
          {totalArticles > 0 && (
            <ReadingProgress 
              currentStory={currentIndex + 1} 
              totalStories={totalArticles}
            />
          )}
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-2xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-read-accent font-sans text-sm font-medium uppercase tracking-wide">
              {article.category}
            </span>
            <span className="text-read-text-dim font-sans text-sm">
              {article.reading_time} min read
            </span>
          </div>
          
          <h1 className="font-serif font-light leading-tight mb-4 text-3xl text-read-text">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="font-serif italic leading-relaxed mb-6 text-lg text-read-text-dim">
              {article.subtitle}
            </p>
          )}
          
          <div className="text-read-text-dim font-sans text-sm">
            {article.source} • {formatDate(article.published_at)}
          </div>
        </header>

        <div className="prose prose-lg max-w-none font-serif leading-relaxed text-lg text-read-text">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-justify">
              {paragraph.trim()}
            </p>
          ))}
        </div>
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
