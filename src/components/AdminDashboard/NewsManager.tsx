
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Eye, EyeOff, Edit, Plus } from 'lucide-react';

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
}

interface NewsManagerProps {
  onEditArticle: (article: Article) => void;
  onCreateNew: () => void;
}

const NewsManager: React.FC<NewsManagerProps> = ({ onEditArticle, onCreateNew }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [fetchingNews, setFetchingNews] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch articles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsFromSource = async (source: string) => {
    setFetchingNews(source);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { source }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.message,
      });

      await fetchArticles();
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch news from ${source}`,
        variant: 'destructive',
      });
    } finally {
      setFetchingNews(null);
    }
  };

  const toggleLiveStatus = async (articleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_live: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;

      await fetchArticles();
      toast({
        title: 'Success',
        description: `Article ${!currentStatus ? 'published' : 'unpublished'}`,
      });
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        variant: 'destructive',
      });
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      await fetchArticles();
      toast({
        title: 'Success',
        description: 'Article deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'live') return article.is_live;
    if (filter === 'draft') return !article.is_live;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading articles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* News Source Fetching */}
      <div className="bg-read-surface border border-read-border rounded-lg p-6">
        <h2 className="text-xl font-serif text-read-text mb-4">Fetch Live News</h2>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => fetchNewsFromSource('aljazeera')}
            disabled={fetchingNews === 'aljazeera'}
            variant="outline"
            className="border-read-border text-read-text hover:bg-read-surface"
          >
            {fetchingNews === 'aljazeera' ? 'Fetching...' : 'Al Jazeera'}
          </Button>
          <Button
            onClick={() => fetchNewsFromSource('bbc')}
            disabled={fetchingNews === 'bbc'}
            variant="outline"
            className="border-read-border text-read-text hover:bg-read-surface"
          >
            {fetchingNews === 'bbc' ? 'Fetching...' : 'BBC'}
          </Button>
          <Button
            onClick={() => fetchNewsFromSource('reuters')}
            disabled={fetchingNews === 'reuters'}
            variant="outline"
            className="border-read-border text-read-text hover:bg-read-surface"
          >
            {fetchingNews === 'reuters' ? 'Fetching...' : 'Reuters'}
          </Button>
        </div>
      </div>

      {/* Article Management */}
      <div className="bg-read-surface border border-read-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif text-read-text">Article Management</h2>
          <Button
            onClick={onCreateNew}
            className="bg-read-accent hover:bg-read-accent/90 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'live', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                filter === tab
                  ? 'bg-read-accent text-black'
                  : 'text-read-text-dim hover:text-read-text hover:bg-read-bg'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'live' && ` (${articles.filter(a => a.is_live).length})`}
              {tab === 'draft' && ` (${articles.filter(a => !a.is_live).length})`}
              {tab === 'all' && ` (${articles.length})`}
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="border border-read-border rounded-lg p-4 hover:bg-read-bg/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-serif text-read-text font-medium truncate">
                      {article.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      article.is_live 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.is_live ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="text-sm text-read-text-dim">
                    {article.source} • {article.category} • {article.reading_time} min read
                  </div>
                  <div className="text-xs text-read-text-dim mt-1">
                    Created: {new Date(article.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => onEditArticle(article)}
                    size="sm"
                    variant="ghost"
                    className="text-read-text-dim hover:text-read-text"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => toggleLiveStatus(article.id, article.is_live)}
                    size="sm"
                    variant="ghost"
                    className="text-read-text-dim hover:text-read-text"
                  >
                    {article.is_live ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => deleteArticle(article.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-8 text-read-text-dim">
            No articles found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManager;
