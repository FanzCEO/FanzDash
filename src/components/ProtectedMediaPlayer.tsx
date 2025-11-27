/**
 * ProtectedMediaPlayer - Screen Capture Protection Component
 *
 * Multi-layer protection system that prevents screenshots and screen recording:
 * 1. Browser API blocking
 * 2. Keyboard shortcut detection (PrintScreen, Cmd+Shift+3/4/5)
 * 3. Dev tools detection
 * 4. CSS-based protection
 * 5. Screen blanking during violation attempts
 * 6. Violation logging and enforcement
 */

import React, { useEffect, useRef, useState } from 'react';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface ProtectedMediaPlayerProps {
  mediaUrl: string;
  mediaAssetId: string;
  userId: string;
  sessionId: string;
  platformId: string;
  onViolation?: (violationType: string) => void;
  showProtectionIndicator?: boolean;
}

export const ProtectedMediaPlayer: React.FC<ProtectedMediaPlayerProps> = ({
  mediaUrl,
  mediaAssetId,
  userId,
  sessionId,
  platformId,
  onViolation,
  showProtectionIndicator = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [protectionActive, setProtectionActive] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // ========================================================================
    // Layer 1: Browser API Blocking
    // ========================================================================

    // Block Screen Capture API (Chrome/Edge)
    if ('getDisplayMedia' in navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = async (constraints?: any) => {
        logViolation('screen_recording_api_blocked');
        throw new DOMException('Screen capture is not allowed on this page', 'NotAllowedError');
      };
    }

    // Block MediaStream Recording
    if (window.MediaRecorder) {
      const originalMediaRecorder = window.MediaRecorder;
      (window as any).MediaRecorder = function(...args: any[]) {
        logViolation('media_recorder_blocked');
        throw new DOMException('Recording is not allowed on this page', 'NotAllowedError');
      };
    }

    // ========================================================================
    // Layer 2: Keyboard Shortcut Detection
    // ========================================================================

    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key (Windows)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        handleScreenshotAttempt('printscreen_key');
        return;
      }

      // Cmd+Shift+3 (Mac - Full screenshot)
      if (e.metaKey && e.shiftKey && e.key === '3') {
        e.preventDefault();
        handleScreenshotAttempt('mac_fullscreen_shortcut');
        return;
      }

      // Cmd+Shift+4 (Mac - Partial screenshot)
      if (e.metaKey && e.shiftKey && e.key === '4') {
        e.preventDefault();
        handleScreenshotAttempt('mac_partial_shortcut');
        return;
      }

      // Cmd+Shift+5 (Mac - Screenshot/Recording menu)
      if (e.metaKey && e.shiftKey && e.key === '5') {
        e.preventDefault();
        handleScreenshotAttempt('mac_screenshot_menu');
        return;
      }

      // Ctrl+Shift+S (Windows - Snipping tool)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleScreenshotAttempt('windows_snipping_tool');
        return;
      }

      // Windows+Shift+S (Windows 10+ - Snip & Sketch)
      if (e.metaKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleScreenshotAttempt('windows_snip_sketch');
        return;
      }

      // F12 (Dev Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        handleScreenshotAttempt('dev_tools_f12');
        return;
      }

      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        handleScreenshotAttempt('dev_tools_shortcut');
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Additional detection after key release
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        handleScreenshotAttempt('printscreen_key_up');
      }
    };

    // ========================================================================
    // Layer 3: Dev Tools Detection
    // ========================================================================

    let devToolsCheckInterval: NodeJS.Timeout;

    const detectDevTools = () => {
      // Method 1: Window size difference
      const widthThreshold = 160;
      const heightThreshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > widthThreshold || heightDiff > heightThreshold) {
        handleScreenshotAttempt('dev_tools_open');
      }

      // Method 2: DevTools detection via console
      const element = new Image();
      let devtoolsOpen = false;
      Object.defineProperty(element, 'id', {
        get: function() {
          devtoolsOpen = true;
          handleScreenshotAttempt('dev_tools_console');
          return '';
        }
      });
      console.log(element);

      // Method 3: Debugger detection
      const checkDebugger = () => {
        const start = performance.now();
        debugger; // This will pause if DevTools is open
        const end = performance.now();
        if (end - start > 100) {
          handleScreenshotAttempt('debugger_pause');
        }
      };
      checkDebugger();
    };

    devToolsCheckInterval = setInterval(detectDevTools, 1000);

    // ========================================================================
    // Layer 4: Visibility Change Detection
    // ========================================================================

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - possible screen recording app opened
        logViolation('page_hidden_suspicious');
      }
    };

    // ========================================================================
    // Layer 5: Context Menu Blocking
    // ========================================================================

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleScreenshotAttempt('right_click_blocked');
    };

    // ========================================================================
    // Layer 6: Blur Detection (for screen recording software)
    // ========================================================================

    const handleBlur = () => {
      // Window lost focus - possible recording software
      logViolation('window_blur_suspicious');
    };

    // ========================================================================
    // Attach Event Listeners
    // ========================================================================

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    containerRef.current.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);

    // ========================================================================
    // Cleanup
    // ========================================================================

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (containerRef.current) {
        containerRef.current.removeEventListener('contextmenu', handleContextMenu);
      }
      window.removeEventListener('blur', handleBlur);
      clearInterval(devToolsCheckInterval);
    };
  }, [mediaAssetId, userId, sessionId, platformId]);

  // ========================================================================
  // Violation Handling
  // ========================================================================

  const handleScreenshotAttempt = (method: string) => {
    console.warn(`🚨 Screenshot attempt detected: ${method}`);

    logViolation(method);

    // Blank the screen temporarily
    setIsBlocked(true);
    setShowWarning(true);
    setViolationCount(prev => prev + 1);

    // Callback to parent component
    if (onViolation) {
      onViolation(method);
    }

    // Show blank screen for 3 seconds
    setTimeout(() => {
      setIsBlocked(false);
    }, 3000);

    // Hide warning after 5 seconds
    setTimeout(() => {
      setShowWarning(false);
    }, 5000);

    // Escalate after 3 violations
    if (violationCount >= 2) {
      handleRepeatedViolations();
    }
  };

  const logViolation = async (violationType: string) => {
    try {
      await fetch('/api/media/log-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          platformId,
          mediaAssetId,
          violationType,
          detectedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        })
      });
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  };

  const handleRepeatedViolations = () => {
    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Show permanent warning
    alert(
      'VIOLATION NOTICE\n\n' +
      'Multiple attempts to capture protected content have been detected.\n' +
      'Your session has been logged and may result in account suspension.\n\n' +
      'Screenshot and screen recording are strictly prohibited.\n' +
      'Continued violations will result in immediate account termination.'
    );

    // Log severe violation
    logViolation('repeated_violations_3x');

    // Optional: Terminate session
    // window.location.href = '/violation-warning';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        pointerEvents: isBlocked ? 'none' : 'auto'
      }}
    >
      {/* Protection Indicator */}
      {showProtectionIndicator && protectionActive && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <Shield className="w-4 h-4" />
          <span>Content Protected</span>
        </div>
      )}

      {/* Violation Warning */}
      {showWarning && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-bold text-lg">Screenshot Attempt Detected</div>
              <div className="text-sm mt-1">
                Screen capture is prohibited. Violation #{violationCount} logged.
              </div>
              {violationCount >= 2 && (
                <div className="text-sm mt-2 font-bold">
                  ⚠️ Account suspension may occur if violations continue.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blank Screen Overlay */}
      {isBlocked && (
        <div className="absolute inset-0 z-40 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <EyeOff className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <div className="text-2xl font-bold">Content Blocked</div>
            <div className="text-lg mt-2">Screenshot attempt prevented</div>
          </div>
        </div>
      )}

      {/* Protected Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        controlsList="nodownload"
        disablePictureInPicture
        playsInline
        style={{
          pointerEvents: isBlocked ? 'none' : 'auto'
        }}
      >
        <source src={mediaUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Watermark Overlay (visible) */}
      <div className="absolute bottom-4 left-4 z-30 opacity-30 text-white text-xs pointer-events-none select-none">
        FANZ © {new Date().getFullYear()} | User: {userId.slice(0, 8)} | Protected Content
      </div>

      {/* CSS-based Protection Layer */}
      <style>{`
        /* Prevent text selection */
        .select-none * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* Prevent drag and drop */
        video {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }

        /* Prevent long-press on mobile */
        video {
          -webkit-touch-callout: none;
        }

        /* Additional hardening */
        video::cue {
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ProtectedMediaPlayer;
