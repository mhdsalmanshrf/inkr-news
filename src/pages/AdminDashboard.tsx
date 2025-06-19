
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  source: string;
  category: string;
  is_live: boolean;
  published_at: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(profile?.role === 'admin');
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchArticles();
    }
  }, [isAdmin]);

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
    } finally {
      setLoading(false);
    }
  };

  const toggleArticleStatus = async (articleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_live: !currentStatus })
        .eq('id', articleId);

      if (error) throw error;
      fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Error updating article status:', error);
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
      fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const fetchRSSFeed = async (source: string, url: string) => {
    // This would typically be handled by an Edge Function
    // For now, we'll show a placeholder message
    alert(`RSS feed fetching for ${source} would be implemented here. This requires an Edge Function to handle CORS and RSS parsing.`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <Card className="bg-read-surface border-read-border">
          <CardHeader>
            <CardTitle className="text-read-text">Authentication Required</CardTitle>
            <CardDescription className="text-read-text-dim">
              Please sign in to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="bg-read-accent hover:bg-read-accent/90 text-black">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <Card className="bg-read-surface border-read-border">
          <CardHeader>
            <CardTitle className="text-read-text">Access Denied</CardTitle>
            <CardDescription className="text-read-text-dim">
              You don't have admin privileges to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="bg-read-accent hover:bg-read-accent/90 text-black">
              Return to Reader
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const liveArticles = articles.filter(a => a.is_live);
  const draftArticles = articles.filter(a => !a.is_live);

  return (
    <div className="min-h-screen bg-read-bg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-read-text-dim hover:text-read-text"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reader
            </Button>
            <h1 className="text-3xl font-serif font-light text-read-text">
              Admin Dashboard
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="border-read-border text-read-text hover:bg-read-surface"
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Articles ({articles.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({liveArticles.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftArticles.length})</TabsTrigger>
            <TabsTrigger value="fetch">Fetch News</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ArticlesList 
              articles={articles} 
              onToggleStatus={toggleArticleStatus}
              onDelete={deleteArticle}
            />
          </TabsContent>

          <TabsContent value="published">
            <ArticlesList 
              articles={liveArticles} 
              onToggleStatus={toggleArticleStatus}
              onDelete={deleteArticle}
            />
          </TabsContent>

          <TabsContent value="drafts">
            <ArticlesList 
              articles={draftArticles} 
              onToggleStatus={toggleArticleStatus}
              onDelete={deleteArticle}
            />
          </TabsContent>

          <TabsContent value="fetch">
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-read-text mb-4">Fetch RSS Feeds</h3>
              <div className="grid gap-4">
                <Card className="bg-read-surface border-read-border">
                  <CardHeader>
                    <CardTitle className="text-read-text">Al Jazeera</CardTitle>
                    <CardDescription className="text-read-text-dim">
                      https://www.aljazeera.com/xml/rss/all.xml
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => fetchRSSFeed('Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml')}
                      className="bg-read-accent hover:bg-read-accent/90 text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Fetch Articles
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-read-surface border-read-border">
                  <CardHeader>
                    <CardTitle className="text-read-text">BBC News</CardTitle>
                    <CardDescription className="text-read-text-dim">
                      https://feeds.bbci.co.uk/news/world/rss.xml
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => fetchRSSFeed('BBC', 'https://feeds.bbci.co.uk/news/world/rss.xml')}
                      className="bg-read-accent hover:bg-read-accent/90 text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Fetch Articles
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-read-surface border-read-border">
                  <CardHeader>
                    <CardTitle className="text-read-text">Reuters</CardTitle>
                    <CardDescription className="text-read-text-dim">
                      https://www.reutersagency.com/feed/?best-top-news
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => fetchRSSFeed('Reuters', 'https://www.reutersagency.com/feed/?best-top-news')}
                      className="bg-read-accent hover:bg-read-accent/90 text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Fetch Articles
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface ArticlesListProps {
  articles: Article[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

const ArticlesList: React.FC<ArticlesListProps> = ({ articles, onToggleStatus, onDelete }) => {
  if (articles.length === 0) {
    return (
      <Card className="bg-read-surface border-read-border">
        <CardContent className="py-8">
          <p className="text-center text-read-text-dim">No articles found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card key={article.id} className="bg-read-surface border-read-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-read-text font-serif text-lg mb-2">
                  {article.title}
                </CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={article.is_live ? "default" : "secondary"}>
                    {article.is_live ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-read-text-dim text-sm">{article.source}</span>
                  <span className="text-read-text-dim text-sm">•</span>
                  <span className="text-read-text-dim text-sm">{article.category}</span>
                </div>
                <CardDescription className="text-read-text-dim">
                  {new Date(article.published_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStatus(article.id, article.is_live)}
                  className="border-read-border text-read-text hover:bg-read-surface"
                >
                  {article.is_live ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-read-border text-read-text hover:bg-read-surface"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(article.id)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboard;
