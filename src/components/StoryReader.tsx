
import React, { useState, useEffect } from 'react';
import { NewsStory, UserSettings } from '../types/news';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ReadingProgress from './ReadingProgress';

interface StoryReaderProps {
  story: NewsStory;
  currentStoryIndex: number;
  totalStories: number;
  settings: UserSettings;
  onNext: () => void;
  onPrevious: () => void;
  onBack: () => void;
}

const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  currentStoryIndex,
  totalStories,
  settings,
  onNext,
  onPrevious,
  onBack
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small': return 'text-base';
      case 'large': return 'text-xl';
      default: return 'text-lg';
    }
  };

  const getBackgroundClass = () => {
    return settings.sepia ? 'bg-amber-50' : 'bg-read-bg';
  };

  const getTextClass = () => {
    return settings.sepia ? 'text-amber-900' : 'text-read-text';
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
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

  return (
    <div className={`min-h-screen ${getBackgroundClass()} transition-colors duration-300`}>
      {/* Header */}
      <div className="sticky top-0 bg-read-surface/95 backdrop-blur-sm border-b border-read-border z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-read-text-dim hover:text-read-text"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="text-read-text-dim font-sans text-sm">
              {formatDate(story.publishedAt)}
            </div>
          </div>
          <ReadingProgress 
            currentStory={currentStoryIndex + 1} 
            totalStories={totalStories}
          />
        </div>
      </div>

      {/* Story Content */}
      <article className="max-w-2xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-read-accent font-sans text-sm font-medium uppercase tracking-wide">
              {story.category}
            </span>
            <span className="text-read-text-dim font-sans text-sm">
              {story.readingTime} min read
            </span>
          </div>
          
          <h1 className={`font-serif font-light leading-tight mb-4 ${getFontSizeClass() === 'text-base' ? 'text-2xl' : getFontSizeClass() === 'text-xl' ? 'text-4xl' : 'text-3xl'} ${getTextClass()}`}>
            {story.title}
          </h1>
          
          {story.subtitle && (
            <p className={`font-serif italic leading-relaxed mb-6 ${getFontSizeClass()} ${settings.sepia ? 'text-amber-700' : 'text-read-text-dim'}`}>
              {story.subtitle}
            </p>
          )}
          
          <div className="text-read-text-dim font-sans text-sm">
            {story.source} • {formatDate(story.publishedAt)}
          </div>
        </header>

        <div className={`prose prose-lg max-w-none font-serif leading-relaxed ${getFontSizeClass()} ${getTextClass()}`}>
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-justify">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-read-border">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStoryIndex === 0}
              className="border-read-border text-read-text hover:bg-read-surface"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Story
            </Button>
            
            <Button
              onClick={onNext}
              disabled={currentStoryIndex === totalStories - 1}
              className="bg-read-accent hover:bg-read-accent/90 text-black"
            >
              Next Story
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </footer>
      </article>

      {/* Reading Progress Indicator */}
      <div 
        className="fixed bottom-0 left-0 h-1 bg-read-accent transition-all duration-150 ease-out z-20"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default StoryReader;
