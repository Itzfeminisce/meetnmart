import React, { useState } from 'react';
import { X, Copy, Check, Share2, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';

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
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description);

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
      color: 'bg-black hover:bg-gray-800'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const handleSocialShare = (platform) => {
    window.open(platform.url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 container">
      <div className="bg-primary-foreground rounded-lg p-6 w-full max-w-md mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-muted-foreground">Share</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Social Media Icons */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Share to social media</p>
          <div className="grid grid-cols-4 gap-3">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={platform.name}
                  onClick={() => handleSocialShare(platform)}
                  className={`${platform.color} text-white p-3 rounded-lg transition-colors flex items-center justify-center group`}
                  title={`Share on ${platform.name}`}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3 p-2 rounded-sm hidden md:inline-block bg-background/80">
          <p className='line-clamp-2 text-muted-foreground text-base'>
            {decodeURIComponent(shareDescription)}
          </p>
        </div>

        {/* Copy Link Section */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Or copy link</p>
          <div className=" flex-col md:flex-row md:flex items-center gap-4 space-y-4 md:space-y-0">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="font-bold flex-1 px-3 py-2 rounded-lg bg-foreground text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 w-full md:w-auto justify-center ${copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-background text-gray-700  hover:bg-gray-200'
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
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// // Example usage component
// const ExampleUsage = () => {
//   const [isShareOpen, setShareOpen] = useState(false);

//   return (
//     <div className="p-8 max-w-md mx-auto">
//       {/* Example Post Card */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//         <h3 className="text-lg font-semibold mb-2">Sample Post Title</h3>
//         <p className="text-gray-600 mb-4">
//           This is a sample post description that demonstrates how the share dialog works.
//         </p>
//         <button
//           onClick={() => setShareOpen(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//         >
//           <Share2 className="w-4 h-4" />
//           Share
//         </button>
//       </div>

//       {/* Share Dialog */}
//       <ShareDialog
//         isOpen={isShareOpen}
//         onClose={() => setShareOpen(false)}
//         url="https://example.com/post/123"
//         title="Check out this amazing post!"
//         description="This is a sample post that you might want to share with your friends."
//       />
//     </div>
//   );
// };

// export default ExampleUsage;