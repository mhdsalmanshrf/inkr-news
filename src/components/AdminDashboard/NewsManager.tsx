
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import ArticleTable from './ArticleTable';
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

interface NewsManagerProps {
  onEditArticle: (article: Article) => void;
  onCreateNew: () => void;
}

type FilterType = 'all' | 'live' | 'draft';

const NewsManager: React.FC<NewsManagerProps> = ({ onEditArticle, onCreateNew }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sourceFilter, setSourceFilter] = useState('');

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
        title: "Failed to fetch articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsFromSources = async () => {
    setFetching(true);
    
    try {
      const sources = ['aljazeera', 'bbc', 'reuters'];
      const promises = sources.map(source => 
        supabase.functions.invoke('fetch-news', {
          body: { source }
        })
      );

      const results = await Promise.all(promises);
      
      let totalFetched = 0;
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Error fetching from ${sources[index]}:`, result.error);
        } else {
          totalFetched += result.data?.count || 0;
        }
      });

      toast({
        title: `Successfully fetched ${totalFetched} new articles`,
        description: "Check the draft articles to review and publish them."
      });
      
      fetchArticles();
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Failed to fetch news",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };

  const stats = {
    total: articles.length,
    live: articles.filter(a => a.is_live).length,
    draft: articles.filter(a => !a.is_live).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-read-text">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-read-text mb-2">Content Management</h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-read-border text-read-text-dim">
              Total: {stats.total}
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Live: {stats.live}
            </Badge>
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
              Draft: {stats.draft}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchNewsFromSources}
            disabled={fetching}
            variant="outline"
            className="border-read-border text-read-text hover:bg-read-surface"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Fetching...' : 'Fetch News'}
          </Button>
          
          <Button
            onClick={onCreateNew}
            className="bg-read-accent hover:bg-read-accent/90 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-read-text-dim" />
          <span className="text-read-text-dim text-sm">Filters:</span>
        </div>
        
        <div className="flex gap-2">
          {(['all', 'live', 'draft'] as FilterType[]).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={
                filter === filterType
                  ? "bg-read-accent text-black hover:bg-read-accent/90"
                  : "border-read-border text-read-text-dim hover:text-read-text"
              }
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>
        
        <Input
          placeholder="Filter by source..."
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-48 bg-read-bg border-read-border text-read-text"
        />
      </div>

      {/* Articles Table */}
      <ArticleTable
        articles={articles}
        onEditArticle={onEditArticle}
        onRefresh={fetchArticles}
        filter={filter}
        sourceFilter={sourceFilter}
      />
    </div>
  );
};

export default NewsManager;
