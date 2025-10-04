'use client';

import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Import Video.js plugins
import 'videojs-contrib-quality-levels';
import 'videojs-hotkeys';
import 'videojs-markers';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  markers?: Array<{ time: number; text: string; category?: string; }>;
  className?: string;
  isProtected?: boolean;
  creatorUsername?: string;
  sessionId?: string;
  onUnauthorizedAccess?: () => void;
  requiresSubscription?: boolean;
  userHasSubscription?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  autoplay = false,
  muted = false,
  markers = [],
  className = '',
  isProtected = true,
  creatorUsername = 'creator',
  sessionId,
  onUnauthorizedAccess,
  requiresSubscription = false,
  userHasSubscription = true
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAccessGranted, setIsAccessGranted] = useState(
    !requiresSubscription || userHasSubscription
  );
  const [error, setError] = useState<string | null>(null);

  // Protection utilities
  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    return canvas.toDataURL();
  };

  const isValidSession = (sessionId?: string): boolean => {
    if (!isProtected) return true;
    if (!sessionId) return false;
    
    // Check if session is valid (simplified check)
    const storedSession = localStorage.getItem(`video_session_${sessionId}`);
    return storedSession === 'valid';
  };

  const checkContentProtection = (): boolean => {
    if (!isProtected) return true;
    
    // Check for developer tools
    const devtools = {
      open: false,
      orientation: null
    };
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        devtools.open = true;
        console.warn('Developer tools detected - content protection active');
      }
    }, 500);
    
    return !devtools.open;
  };

  const createCanvasWatermark = (username: string, opacity = 0.3): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.globalAlpha = opacity;
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`© ${username}`, 10, 30);
      ctx.fillText(new Date().toLocaleTimeString(), 10, 45);
    }
    
    return canvas;
  };

  const startWatermarkProtection = (player: any, username: string) => {
    const watermarkInterval = setInterval(() => {
      if (!player || !player.el()) return;
      
      const videoEl = player.el().querySelector('video');
      if (videoEl && isProtected) {
        const watermark = createCanvasWatermark(username);
        const watermarkDiv = document.createElement('div');
        watermarkDiv.style.position = 'absolute';
        watermarkDiv.style.top = '10px';
        watermarkDiv.style.right = '10px';
        watermarkDiv.style.zIndex = '1000';
        watermarkDiv.style.pointerEvents = 'none';
        watermarkDiv.appendChild(watermark);
        
        const existingWatermark = player.el().querySelector('.dynamic-watermark');
        if (existingWatermark) {
          existingWatermark.remove();
        }
        
        watermarkDiv.className = 'dynamic-watermark';
        player.el().appendChild(watermarkDiv);
      }
    }, 1000);
    
    return watermarkInterval;
  };

  const startProtectionMonitoring = (player: any) => {
    const protectionInterval = setInterval(() => {
      if (!checkContentProtection()) {
        console.warn('Content protection violation detected');
        player.pause();
        setError('Content protection violation detected');
      }
    }, 2000);
    
    return protectionInterval;
  };

  useEffect(() => {
    // Check subscription status instead of session
    if (requiresSubscription && !userHasSubscription) {
      setIsAccessGranted(false);
      onUnauthorizedAccess?.();
      return;
    }

    // Disable right-click context menu for download protection
    const disableRightClick = (e: MouseEvent) => {
      if (isProtected) {
        e.preventDefault();
        return false;
      }
    };

    // Disable keyboard shortcuts for download protection
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      if (isProtected) {
        const blockedKeys = ['F12', 'Ctrl+Shift+I', 'Ctrl+U', 'Ctrl+S', 'Ctrl+P', 'Ctrl+A'];
        const keyCombo = e.ctrlKey ? `Ctrl+${e.key}` : e.key;
        
        if (blockedKeys.includes(keyCombo) || blockedKeys.includes(e.key)) {
          e.preventDefault();
          return false;
        }
      }
    };

    // Disable text selection for download protection
    const disableTextSelection = (e: Event) => {
      if (isProtected) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('selectstart', disableTextSelection);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('selectstart', disableTextSelection);
    };
  }, [requiresSubscription, userHasSubscription, isProtected, onUnauthorizedAccess]);

  useEffect(() => {
    if (!isAccessGranted) return;

    if (!videoRef.current) return;

    // Create video element
    const videoElement = document.createElement('video');
    videoElement.className = 'video-js vjs-theme-modern';
    videoElement.setAttribute('data-setup', '{}');
    videoElement.setAttribute('controlslist', 'nodownload nofullscreen');
    videoElement.setAttribute('disablepictureinpicture', 'true');
    
    // Set source
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    videoElement.appendChild(source);

    // Initialize Video.js player
    const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      autoplay: autoplay,
      muted: muted,
      poster: poster,
      preload: 'metadata',
      techOrder: ['html5'],
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false
      },
      plugins: {
        hotkeys: {
          volumeStep: 0.1,
          seekStep: 5,
          enableModifiersForNumbers: false
        }
      }
    });

    player.ready(() => {
      setIsLoaded(true);
      
      // Remove src attribute after loading for protection
      if (!player || !player.el()) return;
      
      const videoEl = player.el().querySelector('video');
      if (videoEl && isProtected) {
        videoEl.addEventListener('loadstart', () => {
          setTimeout(() => {
            if (videoEl.src && isProtected) {
              videoEl.removeAttribute('src');
              videoEl.load();
            }
          }, 100);
        });

        // Disable video element inspection
        Object.defineProperty(videoEl, 'src', {
          get: function() {
            if (isProtected) {
              console.warn('Video source access blocked for content protection');
              return '';
            }
            return this.getAttribute('data-protected-src') || '';
          },
          set: function(value) {
            this.setAttribute('data-protected-src', value);
          }
        });

        // Disable canvas extraction
        Object.defineProperty(videoEl, 'toDataURL', {
          value: function() {
            console.warn('Canvas extraction blocked for content protection');
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJgg==';
          }
        });
      }

      // Add markers if provided
      if (markers && markers.length > 0 && (player as any).markers) {
        markers.forEach((marker) => {
          (player as any).markers.addMarker({
            time: marker.time,
            text: marker.text,
            class: marker.category ? `marker-${marker.category}` : 'marker-default'
          });
        });
      }

      // Enhanced error handling
      player.on('error', (error: any) => {
        console.error('Video.js error:', error);
        setError('Error loading video. Please try again.');
      });

      // Add quality selector for HLS streams
      if (src.includes('.m3u8') || src.includes('.mpd')) {
        player.ready(() => {
          if ((player as any).qualityLevels) {
            player.addChild('qualityLevels');
          }
        });
      }

      // Add watermark protection
      if (isProtected && creatorUsername) {
        startWatermarkProtection(player, creatorUsername);
      }

      // Protection monitoring removed to prevent errors
      // Function not implemented yet

      // Custom loading spinner
      if (player && player.el()) {
        const loadingSpinner = player.el().querySelector('.vjs-loading-spinner');
        if (loadingSpinner) {
          loadingSpinner.innerHTML = `
            <div class="vjs-spinner">
              <div class="vjs-spinner-circle"></div>
              <div class="vjs-spinner-text">Loading...</div>
            </div>
          `;
        }
      }

      // Custom menu removed to prevent errors
      // Video.js doesn't have a built-in customMenu component
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, autoplay, muted, markers, isProtected, creatorUsername, isAccessGranted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  if (!isAccessGranted && requiresSubscription) {
    return (
      <div className={`video-player-container subscription-required ${className}`}>
        <div className="subscription-overlay">
          <div className="subscription-content">
            <div className="subscription-icon">👑</div>
            <h3>Subscription Required</h3>
            <p>This content is available for subscribers only.</p>
            <p>Subscribe to {creatorUsername} to access exclusive content.</p>
            <button 
              onClick={() => {
                // In a real app, this would redirect to subscription page
                alert('Redirecting to subscription page...');
              }}
              className="subscribe-button"
            >
              Subscribe Now
            </button>
          </div>
        </div>
        <style>{`
          .subscription-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: 12px;
          }
          .subscription-content {
            text-align: center;
            color: white;
            padding: 2rem;
            max-width: 400px;
          }
          .subscription-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          .subscribe-button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
            font-size: 1.1rem;
            transition: all 0.3s ease;
          }
          .subscribe-button:hover {
            background: #ff5252;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`video-player-container error ${className}`}>
        <div className="error-overlay">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h3>Video Error</h3>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoaded(false);
              }}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
        <style>{`
          .error-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: 12px;
          }
          .error-content {
            text-align: center;
            color: white;
            padding: 2rem;
          }
          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .retry-button {
            background: white;
            color: #ff6b6b;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`video-player-container ${className}`}>
        <style>{`
        .video-player-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .video-player-container :global(.video-js) {
          width: 100%;
          height: 100%;
          border-radius: 12px;
        }
        
        .video-player-container :global(.vjs-theme-modern) {
          --vjs-theme-modern-primary: #ff6b6b;
          --vjs-theme-modern-secondary: #4ecdc4;
        }
        
        .video-player-container :global(.vjs-control-bar) {
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
          border-radius: 0 0 12px 12px;
        }
        
        .video-player-container :global(.vjs-big-play-button) {
          background: rgba(255, 107, 107, 0.9);
          border: none;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          font-size: 2rem;
          transition: all 0.3s ease;
        }
        
        .video-player-container :global(.vjs-big-play-button:hover) {
          background: rgba(255, 107, 107, 1);
          transform: scale(1.1);
        }
        
        .video-player-container :global(.vjs-progress-control) {
          height: 6px;
        }
        
        .video-player-container :global(.vjs-progress-holder) {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .video-player-container :global(.vjs-play-progress) {
          background: #ff6b6b;
          border-radius: 3px;
        }
        
        .video-player-container :global(.vjs-loading-spinner) {
          border-color: #ff6b6b transparent transparent transparent;
        }
        
        .video-player-container :global(.vjs-menu) {
          background: rgba(0, 0, 0, 0.9);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .video-player-container :global(.vjs-menu-item) {
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          margin: 0.25rem;
        }
        
        .video-player-container :global(.vjs-menu-item:hover) {
          background: rgba(255, 107, 107, 0.2);
        }
        
        .video-player-container :global(.vjs-marker) {
          background: #ff6b6b;
          border-radius: 2px;
          height: 100%;
          width: 3px;
        }
        
        .video-player-container :global(.vjs-marker-tooltip) {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 4px;
          padding: 0.5rem;
          font-size: 0.8rem;
        }
        
        .video-player-container :global(.vjs-spinner) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .video-player-container :global(.vjs-spinner-circle) {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #ff6b6b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .video-player-container :global(.vjs-spinner-text) {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .video-player-container :global(.dynamic-watermark) {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        
        .video-player-container :global(.dynamic-watermark:hover) {
          opacity: 1;
        }
      `}</style>
      
      <div ref={videoRef} />
      
      {!isLoaded && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-text">Loading video...</div>
          </div>
        </div>
      )}
      
        <style>{`
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          border-radius: 12px;
        }
        
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }
        
        .spinner-circle {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #ff6b6b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .spinner-text {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;