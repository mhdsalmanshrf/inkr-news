
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import NewsManager from '../components/AdminDashboard/NewsManager';
import ArticleEditor from '../components/AdminDashboard/ArticleEditor';

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

type ViewState = 'dashboard' | 'editor';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.role !== 'admin') {
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setCurrentView('editor');
  };

  const handleCreateNew = () => {
    setEditingArticle(undefined);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setEditingArticle(undefined);
    setCurrentView('dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-read-text">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-read-bg">
      {/* Header */}
      <div className="border-b border-read-border bg-read-surface">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-read-text-dim hover:text-read-text"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
              <h1 className="text-2xl font-serif text-read-text">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-read-text-dim text-sm">
                {user?.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-read-text-dim hover:text-red-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'dashboard' && (
          <NewsManager
            onEditArticle={handleEditArticle}
            onCreateNew={handleCreateNew}
          />
        )}

        {currentView === 'editor' && (
          <ArticleEditor
            article={editingArticle}
            onBack={handleBackToDashboard}
            onSave={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
