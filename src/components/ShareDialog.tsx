import React, { useState } from 'react';
import { X, Copy, Check, Share2, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Tooltip, TooltipContent } from './ui/tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';

export function generateHashtagsFromText(text: string, max: number = 5): string[] {
  const stopWords = new Set([
    'the', 'and', 'is', 'in', 'at', 'of', 'a', 'to', 'for', 'on', 'with', 'this', 'that', 'by', 'an', 'be'
  ]);

  return Array.from(
    text
      .toLowerCase()
      .match(/\b[a-z]{3,}\b/g) // Match words only, min 3 chars
      ?.filter(word => !stopWords.has(word))
      .reduce((map, word) => map.set(word, (map.get(word) || 0) + 1), new Map<string, number>())
      .entries() || []
  )
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, max)
    .map(([word]) => `#${word}`);
}

export const ShareDialog = ({
  isOpen,
  onClose,
  url,
  title = '',
  description = ''
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const hashtags = generateHashtagsFromText(description).join(' ');
  
  // Truncate description for better sharing (most platforms have character limits)
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description;
  
  // Create different share messages for different platforms
  const createShareMessage = (platform: string) => {
    switch (platform) {
      case 'twitter':
        // Twitter has 280 char limit, so keep it concise
        return `🚨 ${title}\n\n📝 ${truncatedDescription}\n\n🔗 ${shareUrl}\n\n${hashtags} #MeetnMart`;
      
      case 'whatsapp':
        // WhatsApp supports emojis well
        return `🚨 Just in!\n📝 ${title}\n\n${truncatedDescription}\n\n🔗 Check it out: ${shareUrl}\n\n${hashtags} #MeetnMart`;
      
      case 'facebook':
        // Facebook will auto-generate preview, so simpler text
        return `${title}\n\n${truncatedDescription}\n\n${hashtags} #MeetnMart`;
      
      case 'linkedin':
        // LinkedIn prefers professional tone
        return `${title}\n\n${truncatedDescription}\n\n${hashtags} #MeetnMart`;
      
      default:
        return `${title}\n\n${truncatedDescription}\n\n${shareUrl}\n\n${hashtags} #MeetnMart`;
    }
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(createShareMessage('facebook'))}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(createShareMessage('twitter'))}`,
      color: 'bg-black hover:bg-gray-800'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(createShareMessage('linkedin'))}`,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(createShareMessage('whatsapp'))}`,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const handleSocialShare = (platform) => {
    window.open(platform.url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleCopyLink = async () => {
    const shareMessage = createShareMessage('default');
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-foreground rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h2 className="text-base sm:text-lg font-semibold text-muted-foreground">Share</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background rounded-full transition-colors touch-target"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Social Media Icons */}
        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">Share to social media</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Tooltip key={platform.name}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSocialShare(platform)}
                      className={`${platform.color} text-white p-3 sm:p-3 rounded-lg transition-colors flex items-center justify-center group min-h-[48px] touch-target`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="ml-2 text-xs sm:hidden">{platform.name}</span>
                    </button>
                  </TooltipTrigger>

                  <TooltipContent>
                    {`Share on ${platform.name}`}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Preview of share message */}
        <div className="mb-4 p-2 sm:p-3 rounded-md bg-background/80 border">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line line-clamp-4 overflow-hidden">
            {createShareMessage('default')}
          </p>
        </div>

        {/* Copy Link Section */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full px-3 py-2 bg-muted text-white text-xs sm:text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-sm font-medium text-sm transition-colors flex items-center gap-2 justify-center min-h-[48px] touch-target ${copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-background text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Message
                  </>
                )}
              </button>
            </TooltipTrigger>

            <TooltipContent>
              {copied ? 'Share message copied!' : 'Copy full share message'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};