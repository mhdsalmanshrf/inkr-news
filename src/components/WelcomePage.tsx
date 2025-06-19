
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface WelcomePageProps {
  onEnterApp: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-read-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-in">
        <div className="mb-8">
          <BookOpen className="h-16 w-16 text-read-accent mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-light text-read-text mb-2">
            ReadLight
          </h1>
          <p className="text-read-text-dim font-sans text-lg">
            Distraction-free news reading
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12 space-y-4">
          <p className="text-read-text font-serif text-lg leading-relaxed">
            A new way to read the news — calm, clean, and clutter-free.
          </p>
          <p className="text-read-text-dim font-sans text-sm leading-relaxed">
            Swipe through today's curated stories one at a time, in a dark, typography-first reading experience that feels like a book.
          </p>
        </div>

        <div className="space-y-6">
          <Button 
            onClick={onEnterApp}
            className="bg-read-accent hover:bg-read-accent/90 text-black font-sans font-medium px-8 py-3 rounded-lg"
          >
            Read Today's Edition
          </Button>
          
          <div className="text-read-text-dim font-sans text-xs space-y-1">
            <p>📚 Kindle-style swipe navigation</p>
            <p>🌙 Always-on dark mode</p>
            <p>🔕 No notifications, no ads</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
