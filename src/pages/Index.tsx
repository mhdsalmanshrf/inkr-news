
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import WelcomePage from '../components/WelcomePage';
import StoryReader from '../components/StoryReader';
import EditionComplete from '../components/EditionComplete';
import Settings from '../components/Settings';
import { UserSettings } from '../types/news';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { Button } from '@/components/ui/button';

type AppState = 'welcome' | 'reading' | 'complete' | 'settings' | 'archive';

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

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appState, setAppState] = useState<AppState>('welcome');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({
    fontSize: 'medium',
    sepia: false
  });

  const currentStory = articles[currentStoryIndex];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('is_live', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useSwipeNavigation({
    onSwipeLeft: () => {
      if (appState === 'reading' && currentStoryIndex < articles.length - 1) {
        handleNextStory();
      }
    },
    onSwipeRight: () => {
      if (appState === 'reading' && currentStoryIndex > 0) {
        handlePreviousStory();
      }
    }
  });

  const handleEnterApp = () => {
    setAppState('reading');
  };

  const handleNextStory = () => {
    if (currentStoryIndex < articles.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setAppState('complete');
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex -## 1);
    }
  };

  const handleBackToEdition = () => {
    setCurrentStoryIndex(0);
    setAppState('reading');
  };

  const handleViewArchive = () => {
    setAppState('archive');
  };

  const handleSettings = () => {
    setAppState('settings');
  };

  const handleBackFromSettings = () => {
    setAppState('reading');
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('readlight-settings', JSON.stringify(settings));
  }, [settings]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('readlight-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-read-text">Loading today's edition...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-read-text mb-4">No articles available</h1>
          <p className="text-read-text-dim mb-4">Check back later for today's edition.</p>
          {user && (
            <Button 
              onClick={() => navigate('/admin')}
              className="bg-read-accent hover:bg-read-accent/90 text-black"
            >
              Go to Admin Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (appState === 'welcome') {
    return <WelcomePage onEnterApp={handleEnterApp} />;
  }

  if (appState === 'complete') {
    return (
      <EditionComplete
        totalStories={articles.length}
        onBackToEdition={handleBackToEdition}
        onViewArchive={handleViewArchive}
      />
    );
  }

  if (appState === 'settings') {
    return (
      <Settings
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onBack={handleBackFromSettings}
      />
    );
  }

  if (appState === 'archive') {
    return (
      <div className="min-h-screen bg-read-bg px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setAppState('reading')}
            className="text-read-text-dim hover:text-read-text font-sans text-sm mb-6"
          >
            ← Back to Today's Edition
          </button>
          <h1 className="text-2xl font-serif font-light text-read-text mb-8">
            Past Editions
          </h1>
          <div className="space-y-4">
            {articles.map((article) => (
              <div 
                key={article.id} 
                className="bg-read-surface border border-read-border rounded-lg p-6 cursor-pointer hover:bg-read-surface/80"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <h2 className="text-read-text font-serif text-lg mb-2">{article.title}</h2>
                <p className="text-read-text-dim font-sans text-sm">
                  {article.source} • {new Date(article.published_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <StoryReader
        story={{
          id: currentStory.id,
          title: currentStory.title,
          subtitle: currentStory.subtitle,
          content: currentStory.content,
          source: currentStory.source,
          publishedAt: currentStory.published_at,
          readingTime: currentStory.reading_time,
          category: currentStory.category
        }}
        currentStoryIndex={currentStoryIndex}
        totalStories={articles.length}
        settings={settings}
        onNext={handleNextStory}
        onPrevious={handlePreviousStory}
        onBack={() => setAppState('welcome')}
      />

      {/* Header buttons */}
      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleSettings}
          className="text-read-text-dim hover:text-read-text font-sans text-sm"
        >
          Settings
        </button>
        {user ? (
          <button
            onClick={() => navigate('/admin')}
            className="text-read-text-dim hover:text-read-text font-sans text-sm"
          >
            Admin
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="text-read-text-dim hover:text-read-text font-sans text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Index;
