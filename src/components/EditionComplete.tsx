
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

interface EditionCompleteProps {
  totalStories: number;
  onBackToEdition: () => void;
  onViewArchive: () => void;
}

const EditionComplete: React.FC<EditionCompleteProps> = ({
  totalStories,
  onBackToEdition,
  onViewArchive
}) => {
  return (
    <div className="min-h-screen bg-read-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-in max-w-md mx-auto">
        <div className="mb-8">
          <BookOpen className="h-16 w-16 text-read-accent mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-light text-read-text mb-4">
            You're All Done
          </h1>
          <p className="text-read-text-dim font-sans text-lg leading-relaxed">
            You've completed today's edition of {totalStories} carefully curated stories.
          </p>
        </div>

        <div className="bg-read-surface border border-read-border rounded-lg p-6 mb-8">
          <h2 className="text-read-text font-serif text-lg mb-3">
            Reading Summary
          </h2>
          <div className="space-y-2 text-read-text-dim font-sans text-sm">
            <p>Stories Read: {totalStories}</p>
            <p>Est. Reading Time: {totalStories * 3} minutes</p>
            <p>Date: {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={onBackToEdition}
            variant="outline"
            className="w-full border-read-border text-read-text hover:bg-read-surface"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Review Today's Stories
          </Button>
          
          <Button 
            onClick={onViewArchive}
            className="w-full bg-read-accent hover:bg-read-accent/90 text-black font-medium"
          >
            Browse Past Editions
          </Button>
        </div>

        <div className="mt-8 text-read-text-dim font-sans text-xs">
          <p>Come back tomorrow for your next curated edition</p>
        </div>
      </div>
    </div>
  );
};

export default EditionComplete;
