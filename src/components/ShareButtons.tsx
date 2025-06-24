
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url = window.location.href }) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-read-text-dim text-sm mr-2">Share:</span>
      
      {/* Native Share (Mobile) */}
      {navigator.share && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNativeShare}
          className="text-read-text-dim hover:text-read-text"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}

      {/* Twitter/X */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(shareLinks.twitter, '_blank')}
        className="text-read-text-dim hover:text-read-text"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(shareLinks.linkedin, '_blank')}
        className="text-read-text-dim hover:text-read-text"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </Button>

      {/* WhatsApp */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(shareLinks.whatsapp, '_blank')}
        className="text-read-text-dim hover:text-read-text"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      {/* Copy Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="text-read-text-dim hover:text-read-text"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ShareButtons;
