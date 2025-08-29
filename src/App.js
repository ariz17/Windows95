import React, { useState, useEffect } from 'react';
import BackgroundContext from './BackgroundContext';
import SplashScreen from './components/SplashScreen';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import ResumeWindow from './components/ResumeWindow';
import ProjectsWindow from './components/ProjectsWindow';
import DrawingsWindow from './components/DrawingsWindow';
import GamesWindow from './components/GamesWindow';
import ChangeBackgroundWindow from './components/ChangeBackgroundWindow';
import MailWindow from './components/MailWindow';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState(null);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [wallpaperUrl, setWallpaperUrl] = useState(null);
  const [wallpaperLoaded, setWallpaperLoaded] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const desktopIcons = [
    { id: 'resume', icon: '📄', label: 'Resume', component: ResumeWindow },
    { id: 'projects', icon: '💼', label: 'Projects', component: ProjectsWindow },
    { id: 'mail', icon: '📧', label: 'Mail Me', component: MailWindow },
    { id: 'drawings', icon: '🎨', label: 'Drawings', component: DrawingsWindow },
    { id: 'bg', icon: '🖼️', label: 'Change Background', component: ChangeBackgroundWindow },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowMobileWarning(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Prevent zoom on double tap for mobile
    document.addEventListener('touchstart', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Load saved wallpaper once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wallpaperUrl');
      if (saved) setWallpaperUrl(saved);
      setWallpaperLoaded(true);
    } catch {
      setWallpaperLoaded(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setIsLoading(false);
    
    // Show mobile warning if on mobile device, but allow Mail Me app to work
    if (isMobile) {
      setShowMobileWarning(true);
      setHasInitialized(true); // Allow desktop to be interactive
      return;
    }
    
    // Clean boot - no windows open by default
    setHasInitialized(true);
  };

  const handleMobileWarningClose = () => {
    setShowMobileWarning(false);
    setHasInitialized(true);
  };

  const handleIconSelect = (iconId) => {
    setSelectedIcon(iconId);
  };

  const handleIconDoubleClick = (iconId) => {
    const icon = desktopIcons.find(i => i.id === iconId);
    if (!icon) return;

    const existingWindow = openWindows.find(w => w.id === iconId);
    if (existingWindow) {
      setActiveWindow(iconId);
      return;
    }

    const newWindow = {
      id: iconId,
      title: icon.label,
      icon: icon.icon,
      component: icon.component,
      position: { 
        x: 50 + openWindows.length * 30, 
        y: 50 + openWindows.length * 30 
      }
    };

    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindow(iconId);
  };

  const handleOpenWindow = (windowConfig) => {
    const existingWindow = openWindows.find(w => w.id === windowConfig.id);
    if (existingWindow) {
      setActiveWindow(windowConfig.id);
      return;
    }

    const newWindow = {
      ...windowConfig,
      position: { 
        x: 50 + openWindows.length * 30, 
        y: 50 + openWindows.length * 30 
      }
    };

    setOpenWindows(prev => [...prev, newWindow]);
    setActiveWindow(windowConfig.id);
  };

  const handleWindowClose = (windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
    setMinimizedWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindow === windowId) {
      const remainingWindows = openWindows.filter(w => w.id !== windowId);
      setActiveWindow(remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1].id : null);
    }
  };

  const handleWindowMinimize = (windowId) => {
    const window = openWindows.find(w => w.id === windowId);
    if (window && !minimizedWindows.find(w => w.id === windowId)) {
      setMinimizedWindows(prev => [...prev, window]);
    }
    if (activeWindow === windowId) {
      const visibleWindows = openWindows.filter(w => w.id !== windowId && !minimizedWindows.find(m => m.id === w.id));
      setActiveWindow(visibleWindows.length > 0 ? visibleWindows[visibleWindows.length - 1].id : null);
    }
  };

  const handleWindowRestore = (windowId) => {
    setMinimizedWindows(prev => prev.filter(w => w.id !== windowId));
    setActiveWindow(windowId);
  };

  const handleWindowFocus = (windowId) => {
    setActiveWindow(windowId);
  };

  const handleStartClick = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleStartMenuClose = () => {
    setIsStartMenuOpen(false);
  };

  const handleDesktopClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
      setIsStartMenuOpen(false);
    }
  };

  return (
    <BackgroundContext.Provider value={{ wallpaperUrl, setWallpaperUrl }}>
      <div
        className={`h-screen overflow-hidden ${wallpaperLoaded && wallpaperUrl && !isLoading ? '' : 'bg-win95-desktop'} ${isMobile ? 'pb-10' : ''}`}
        onClick={handleDesktopClick}
        style={wallpaperLoaded && wallpaperUrl && !isLoading ? {
          backgroundImage: `url(${wallpaperUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        {isLoading && <SplashScreen onComplete={handleSplashComplete} />}
        {!isLoading && showMobileWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-win95-gray border-2 border-outset p-6 max-w-sm w-full text-center">
              <h3 className="text-lg font-bold mb-3">Windows 95</h3>
              <p className="text-sm mb-4 text-gray-700">
                For the best experience, please use this on a larger screen (PC).
              </p>
              <button
                onClick={handleMobileWarningClose}
                className="win95-button px-4 py-2 text-sm font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {!isLoading && !showMobileWarning && (
          <>
            <div className={`${isMobile ? 'desktop-icons-container' : 'flex flex-col space-y-2 p-4'}`}>
              {desktopIcons.map((icon) => (
                <DesktopIcon
                  key={icon.id}
                  icon={icon.icon}
                  label={icon.label}
                  isSelected={selectedIcon === icon.id}
                  onSelect={() => handleIconSelect(icon.id)}
                  onDoubleClick={() => handleIconDoubleClick(icon.id)}
                />
              ))}
            </div>

            {openWindows.map((window) => {
              const isMinimized = minimizedWindows.find(w => w.id === window.id);
              return (
                <Window
                  key={window.id}
                  title={window.title}
                  initialPosition={isMobile ? { x: 10, y: 10 } : window.position}
                  width={isMobile ? Math.min(window.innerWidth - 20, 350) : 500}
                  height={isMobile ? Math.min(window.innerHeight - 120, 450) : 400}
                  isActive={activeWindow === window.id}
                  isMinimized={!!isMinimized}
                  onClose={() => handleWindowClose(window.id)}
                  onFocus={() => handleWindowFocus(window.id)}
                  onMinimize={() => handleWindowMinimize(window.id)}
                >
                  <window.component />
                </Window>
              );
            })}
            <StartMenu isOpen={isStartMenuOpen} onClose={handleStartMenuClose} onOpenWindow={handleOpenWindow} />
            <Taskbar 
              onStartClick={handleStartClick} 
              isStartMenuOpen={isStartMenuOpen}
              minimizedWindows={minimizedWindows}
              onWindowRestore={handleWindowRestore}
            />
          </>
        )}
      </div>
    </BackgroundContext.Provider>
  );
}

export default App;
