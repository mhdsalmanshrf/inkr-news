
import React from 'react';
import { UserSettings } from '../types/news';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const handleFontSizeChange = (fontSize: UserSettings['fontSize']) => {
    onUpdateSettings({ ...settings, fontSize });
  };

  const handleSepiaToggle = () => {
    onUpdateSettings({ ...settings, sepia: !settings.sepia });
  };

  return (
    <div className="min-h-screen bg-read-bg">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-read-text-dim hover:text-read-text mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-serif font-light text-read-text">
            Reading Settings
          </h1>
        </div>

        <div className="space-y-8">
          {/* Font Size */}
          <div className="bg-read-surface border border-read-border rounded-lg p-6">
            <h2 className="text-read-text font-serif text-lg mb-4">Font Size</h2>
            <div className="space-y-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    settings.fontSize === size
                      ? 'border-read-accent bg-read-accent/10 text-read-text'
                      : 'border-read-border text-read-text-dim hover:border-read-accent/50'
                  }`}
                >
                  <div className={`font-serif ${
                    size === 'small' ? 'text-base' : 
                    size === 'large' ? 'text-xl' : 'text-lg'
                  }`}>
                    {size.charAt(0).toUpperCase() + size.slice(1)} - The quick brown fox jumps
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sepia Mode */}
          <div className="bg-read-surface border border-read-border rounded-lg p-6">
            <h2 className="text-read-text font-serif text-lg mb-4">Display Mode</h2>
            <button
              onClick={handleSepiaToggle}
              className={`w-full text-left p-4 rounded border transition-colors ${
                settings.sepia
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'border-read-border text-read-text-dim hover:border-read-accent/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-serif text-lg mb-1">Sepia Mode</div>
                  <div className="font-sans text-sm opacity-75">
                    Easier on the eyes for extended reading
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  settings.sepia ? 'border-amber-600 bg-amber-600' : 'border-read-border'
                }`}>
                  {settings.sepia && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </button>
          </div>

          {/* About */}
          <div className="bg-read-surface border border-read-border rounded-lg p-6">
            <h2 className="text-read-text font-serif text-lg mb-4">About ReadLight</h2>
            <div className="space-y-3 text-read-text-dim font-sans text-sm">
              <p>
                ReadLight is designed for mindful news consumption. We curate essential stories 
                and present them in a distraction-free reading environment.
              </p>
              <p>
                No ads, no infinite scroll, no notifications. Just the news that matters, 
                delivered with the calm elegance of a book.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
