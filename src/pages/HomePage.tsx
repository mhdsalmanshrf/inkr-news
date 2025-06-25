
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bookmark, BookmarkCheck, Clock, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';

interface PersonalizedArticle {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  ai_summary?: string;
  source: string;
  category: string;
  ai_tags?: string[];
  is_trending: boolean;
  published_at: string;
  reading_time: number;
  view_count: number;
  is_bookmarked: boolean;
}

type FilterType = 'all' | 'trending' | 'latest' | 'bookmarked';

const ARTICLES_PER_PAGE = 10;

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState<PersonalizedArticle[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [userName, setUserName] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await fetchArticles(true);
  }, [filter, user]);

  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80
  });

  useEffect(() => {
    fetchUserData();
    fetchArticles(true);
  }, [user, filter]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1000 >= 
        document.documentElement.scrollHeight &&
        !loadingMore &&
        hasMore
      ) {
        loadMoreArticles();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page, filter]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data: interests } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

      setUserInterests(interests?.map(i => i.interest) || []);
      setUserName(user.email?.split('@')[0] || 'there');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchArticles = async (reset = false) => {
    try {
      const currentPage = reset ? 0 : page;

      if (filter === 'bookmarked') {
        if (!user) {
          setArticles([]);
          setHasMore(false);
          return;
        }

        const { data, count } = await supabase
          .from('bookmarks')
          .select(`
            article_id,
            articles (
              id, title, subtitle, summary, ai_summary, source, category, 
              ai_tags, is_trending, published_at, reading_time, view_count
            )
          `, { count: 'exact' })
          .eq('user_id', user.id)
          .range(currentPage * ARTICLES_PER_PAGE, (currentPage + 1) * ARTICLES_PER_PAGE - 1);

        const bookmarkedArticles = data?.map(b => ({
          ...b.articles,
          is_bookmarked: true
        })) || [];

        if (reset) {
          setArticles(bookmarkedArticles as PersonalizedArticle[]);
        } else {
          setArticles(prev => [...prev, ...bookmarkedArticles as PersonalizedArticle[]]);
        }

        setHasMore((count || 0) > (currentPage + 1) * ARTICLES_PER_PAGE);
      } else if (user) {
        // For authenticated users, get all articles and handle pagination client-side for now
        const { data } = await supabase.rpc('get_personalized_articles', {
          user_id: user.id,
          limit_count: (currentPage + 1) * ARTICLES_PER_PAGE
        });

        let filteredData = data || [];
        
        if (filter === 'trending') {
          filteredData = filteredData.filter(a => a.is_trending);
        } else if (filter === 'latest') {
          filteredData = filteredData.sort((a, b) => 
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        }

        if (reset) {
          setArticles(filteredData.slice(0, ARTICLES_PER_PAGE));
        } else {
          const startIndex = currentPage * ARTICLES_PER_PAGE;
          const endIndex = (currentPage + 1) * ARTICLES_PER_PAGE;
          const newArticles = filteredData.slice(startIndex, endIndex);
          setArticles(prev => [...prev, ...newArticles]);
        }

        setHasMore(filteredData.length > (currentPage + 1) * ARTICLES_PER_PAGE);
      } else {
        const { data, count } = await supabase
          .from('articles')
          .select('*', { count: 'exact' })
          .eq('is_live', true)
          .order('published_at', { ascending: false })
          .range(currentPage * ARTICLES_PER_PAGE, (currentPage + 1) * ARTICLES_PER_PAGE - 1);

        const articlesWithBookmark = data?.map(article => ({
          ...article,
          is_bookmarked: false
        })) || [];

        if (reset) {
          setArticles(articlesWithBookmark as PersonalizedArticle[]);
        } else {
          setArticles(prev => [...prev, ...articlesWithBookmark as PersonalizedArticle[]]);
        }

        setHasMore((count || 0) > (currentPage + 1) * ARTICLES_PER_PAGE);
      }

      if (reset) {
        setPage(1);
      } else {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMoreArticles = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchArticles(false);
    }
  }, [loadingMore, hasMore, page, filter]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0);
    setHasMore(true);
    setLoading(true);
  };

  const handleBookmark = async (articleId: string, isCurrentlyBookmarked: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isCurrentlyBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            article_id: articleId
          });
      }

      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, is_bookmarked: !isCurrentlyBookmarked }
          : article
      ));

      toast({
        title: isCurrentlyBookmarked ? "Bookmark removed" : "Bookmark added"
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const published = new Date(timestamp);
    const diffInHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-read-text">Loading personalized news...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-read-bg">
      <PullToRefreshIndicator 
        pullDistance={pullDistance} 
        isRefreshing={isRefreshing || refreshing}
      />
      
      {/* Header */}
      <div className="border-b border-read-border bg-read-surface/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif text-read-text">Inkr News</h1>
              {user && userInterests.length > 0 && (
                <p className="text-read-text-dim text-sm">
                  Hello {userName}, here's news on {userInterests.slice(0, 3).join(', ')}
                  {userInterests.length > 3 && ` +${userInterests.length - 3} more`}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="text-read-text-dim hover:text-read-text"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                size="sm"
                className="text-read-text-dim hover:text-read-text"
              >
                Settings
              </Button>
              {user ? (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="ghost"
                  size="sm"
                  className="text-read-text-dim hover:text-read-text"
                >
                  Admin
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-read-accent hover:bg-read-accent/90 text-black"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'trending', 'latest', 'bookmarked'] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filterType)}
                className={
                  filter === filterType
                    ? "bg-read-accent text-black hover:bg-read-accent/90"
                    : "border-read-border text-read-text-dim hover:text-read-text"
                }
                disabled={filterType === 'bookmarked' && !user}
              >
                {filterType === 'trending' && <TrendingUp className="h-4 w-4 mr-1" />}
                {filterType === 'bookmarked' && <Bookmark className="h-4 w-4 mr-1" />}
                {filterType === 'latest' && <Clock className="h-4 w-4 mr-1" />}
                {filterType === 'all' && <Filter className="h-4 w-4 mr-1" />}
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {!user && userInterests.length === 0 && (
          <Card className="mb-6 bg-read-accent/10 border-read-accent/20">
            <CardContent className="pt-6">
              <p className="text-read-text mb-4">
                Get personalized news by setting your interests!
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/onboarding')}
                  className="bg-read-accent hover:bg-read-accent/90 text-black"
                >
                  Personalize Feed
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="border-read-border text-read-text-dim hover:text-read-text"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-serif text-read-text mb-4">
              {filter === 'bookmarked' ? 'No bookmarked articles yet' : 'No articles found'}
            </h2>
            <p className="text-read-text-dim mb-6">
              {filter === 'bookmarked' 
                ? 'Start bookmarking articles to see them here.'
                : 'Try adjusting your filters or check back later.'
              }
            </p>
            {filter === 'bookmarked' && (
              <Button
                onClick={() => handleFilterChange('all')}
                className="bg-read-accent hover:bg-read-accent/90 text-black"
              >
                Browse All Articles
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-read-surface border-read-border hover:border-read-accent/50 transition-all cursor-pointer group"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-read-border text-read-text-dim text-xs">
                          {article.source}
                        </Badge>
                        {article.is_trending && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(article.id, article.is_bookmarked);
                        }}
                        className="h-8 w-8 p-0 text-read-text-dim hover:text-read-accent"
                      >
                        {article.is_bookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <h3 className="font-serif text-lg leading-tight text-read-text group-hover:text-read-accent transition-colors">
                      {article.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {(article.ai_summary || article.summary) && (
                      <p className="text-read-text-dim text-sm line-clamp-3">
                        {article.ai_summary || article.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-read-text-dim">
                      <div className="flex items-center gap-4">
                        <span>{formatTimeAgo(article.published_at)}</span>
                        <span>{article.reading_time} min read</span>
                        {article.view_count > 0 && (
                          <span>{article.view_count} views</span>
                        )}
                      </div>
                    </div>

                    {article.ai_tags && article.ai_tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {article.ai_tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-read-border text-read-text-dim text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="text-center py-8">
                <div className="text-read-text-dim">Loading more articles...</div>
              </div>
            )}

            {/* End of Articles Indicator */}
            {!hasMore && articles.length > 0 && (
              <div className="text-center py-8">
                <p className="text-read-text-dim">You've reached the end!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
