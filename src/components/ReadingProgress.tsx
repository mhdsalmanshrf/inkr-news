
import React from 'react';

interface ReadingProgressProps {
  currentStory: number;
  totalStories: number;
  className?: string;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ 
  currentStory, 
  totalStories, 
  className = '' 
}) => {
  const progress = (currentStory / totalStories) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-read-text-dim font-sans text-xs">
          Story {currentStory} of {totalStories}
        </span>
        <span className="text-read-text-dim font-sans text-xs">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-read-border h-1 rounded-full">
        <div 
          className="bg-read-accent h-1 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ReadingProgress;
