
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  threshold = 80
}) => {
  const opacity = Math.min(pullDistance / threshold, 1);
  const scale = Math.min(pullDistance / threshold, 1);
  const rotation = isRefreshing ? 360 : (pullDistance / threshold) * 180;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
      style={{
        transform: `translateY(${Math.min(pullDistance - 50, 0)}px)`,
        opacity: opacity
      }}
    >
      <div 
        className="bg-read-surface border border-read-border rounded-full p-3 shadow-lg"
        style={{
          transform: `scale(${scale})`
        }}
      >
        <RefreshCw 
          className={`h-6 w-6 text-read-accent ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
