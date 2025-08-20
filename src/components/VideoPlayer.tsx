import { useState, useRef } from 'react';

export default function YouTubePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoContainerRef = useRef(null);
  
  // YouTube video ID - using a very common, public YouTube video that allows embedding
  const videoId = "EYvEtr8iBxY"; // https://youtu.be/EYvEtr8iBxY Gangnam Style - widely embeddable video
  
  const togglePlayPause = () => {
    const iframe = videoContainerRef.current?.querySelector('iframe');
    if (!iframe) return;
    
    try {
      if (isPlaying) {
        // Create a new iframe with autoplay disabled
        const newSrc = iframe.src.replace('&autoplay=1', '');
        iframe.src = newSrc;
        setIsPlaying(false);
      } else {
        // Create a new iframe with autoplay enabled
        let newSrc = iframe.src;
        if (!newSrc.includes('autoplay=1')) {
          newSrc += (newSrc.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        iframe.src = newSrc;
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Could not control video playback:", e);
    }
  };
  
  // Build the YouTube embed URL with minimal parameters to ensure compatibility
  const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&loop=1&playlist=${videoId}`;
  
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16">
      <div className="aspect-video rounded-2xl overflow-hidden bg-black/80 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
        <div ref={videoContainerRef} className="relative w-full h-full">
          {/* Basic YouTube iframe - most compatible approach */}
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          
          {/* Play/Pause overlay button */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className={`bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center border border-purple-500/40 ${isPlaying ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}>
              {!isPlaying ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-purple-500" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-purple-500" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}