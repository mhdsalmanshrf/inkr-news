
import React, { useState, useEffect } from 'react';
import WelcomePage from '../components/WelcomePage';
import StoryReader from '../components/StoryReader';
import EditionComplete from '../components/EditionComplete';
import Settings from '../components/Settings';
import { todaysEdition, pastEditions } from '../data/mockNews';
import { NewsStory, UserSettings } from '../types/news';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';

type AppState = 'welcome' | 'reading' | 'complete' | 'settings' | 'archive';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [settings, setSettings] = useState<UserSettings>({
    fontSize: 'medium',
    sepia: false
  });

  const currentStory = todaysEdition.stories[currentStoryIndex];

  useSwipeNavigation({
    onSwipeLeft: () => {
      if (appState === 'reading' && currentStoryIndex < todaysEdition.stories.length - 1) {
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
    if (currentStoryIndex < todaysEdition.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setAppState('complete');
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
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

  if (appState === 'welcome') {
    return <WelcomePage onEnterApp={handleEnterApp} />;
  }

  if (appState === 'complete') {
    return (
      <EditionComplete
        totalStories={todaysEdition.stories.length}
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
            {pastEditions.map((edition) => (
              <div key={edition.id} className="bg-read-surface border border-read-border rounded-lg p-6">
                <h2 className="text-read-text font-serif text-lg mb-2">{edition.title}</h2>
                <p className="text-read-text-dim font-sans text-sm">
                  {edition.stories.length} stories • {new Date(edition.date).toLocaleDateString()}
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
        story={currentStory}
        currentStoryIndex={currentStoryIndex}
        totalStories={todaysEdition.stories.length}
        settings={settings}
        onNext={handleNextStory}
        onPrevious={handlePreviousStory}
        onBack={() => setAppState('welcome')}
      />

      {/* Settings Button */}
      <button
        onClick={handleSettings}
        className="fixed top-4 right-4 z-20 text-read-text-dim hover:text-read-text font-sans text-sm"
      >
        Settings
      </button>
    </div>
  );
};

export default Index;
