'use client';

import { useState } from 'react';

interface SocialShareProps {
  eventId: number;
  eventTitle: string;
  eventDescription?: string;
  eventDate?: string;
}

export default function SocialShare({ eventId, eventTitle, eventDescription, eventDate }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`;
  const encodedUrl = encodeURIComponent(eventUrl);
  const encodedTitle = encodeURIComponent(eventTitle);
  const encodedDescription = encodeURIComponent(eventDescription || eventTitle);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0D%0A%0D%0AEvent: ${eventUrl}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks];
    if (url) {
      if (platform === 'email') {
        // For email, use location.href for better compatibility
        try {
          window.location.href = url;
        } catch (error) {
          console.error('Email share failed:', error);
          // Fallback: show copy link message
          alert('Please copy the link and send it via email manually:\n\n' + eventUrl);
        }
      } else {
        // For social media, open in new window
        window.open(url, '_blank', 'width=600,height=400');
      }
    }
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold transition-colors"
      >
        <span className="text-lg">📤</span>
        Share Event
      </button>

      {/* Share Menu */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 min-w-max border border-gray-200 dark:border-gray-700">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 transition-colors"
          >
            <span className="text-lg">🔗</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Copy Link</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {copied ? '✓ Copied!' : 'Copy event link'}
              </p>
            </div>
          </button>

          {/* Twitter */}
          <button
            onClick={() => handleShare('twitter')}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 transition-colors"
          >
            <span className="text-lg">𝕏</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Share on X</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Post to your followers</p>
            </div>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 transition-colors"
          >
            <span className="text-lg">f</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Share on Facebook</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Share with friends</p>
            </div>
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 transition-colors"
          >
            <span className="text-lg">in</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Share on LinkedIn</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Share professionally</p>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 transition-colors"
          >
            <span className="text-lg">💬</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Share on WhatsApp</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Send to contacts</p>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={() => handleShare('email')}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
          >
            <span className="text-lg">✉️</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Share via Email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Send email invitation</p>
            </div>
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
