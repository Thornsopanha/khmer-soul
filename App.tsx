import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Menu, X, ArrowRight, ChevronLeft, Map as MapIcon, Camera, Compass } from 'lucide-react';
import { api } from './services/api';
import { Category, ContentItem } from './types';
import Admin from './pages/Admin';

// --- Shared Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
  </div>
);

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync state with actual audio events
  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        // State update handled by onPlay
      } else {
        audio.pause();
        // State update handled by onPause
      }
    } catch (error) {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleSpeed = () => {
    // Cycle through 1x -> 1.5x -> 2x -> 1x
    const newRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(newRate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (

    <div className="mb-20 w-max">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={onPlay}
        onPause={onPause}
      />
      {/* Container - Stone block aesthetic, clean and powerful */}
      <div className="relative bg-stone-900 border border-stone-800 p-1 pr-6 rounded-full flex items-center gap-6 shadow-2xl shadow-black/50">
        
        {/* Play/Pause Button - The 'Jewel' */}
        <button
          onClick={togglePlay}
          className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-stone-100 shadow-lg shadow-amber-900/40 hover:scale-105 hover:shadow-amber-600/30 transition-all duration-500 group"
        >
          {/* Inner ring */}
          <div className="absolute inset-[2px] rounded-full border border-amber-500/30"></div>
          
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
        </button>

        {/* Content Area */}
        <div className="flex flex-col gap-1 min-w-[280px]">
          {/* Label & Time */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-stone-500 font-sans font-medium">
            <span className="text-amber-700">Audio History</span>
            <div className="flex gap-2">
              <span>{formatTime(currentTime)}</span>
              <span className="text-stone-700">/</span>
              <span className="text-stone-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Progress Bar - Sharp, clean line */}
          <div className="relative h-[2px] w-full group/slider cursor-pointer py-2">
            {/* Track */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-stone-800 rounded-full"></div>
            {/* Fill */}
            <div 
              className="absolute top-1/2 left-0 h-[2px] bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)] transition-all duration-100 ease-out"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              {/* Handle - Glow dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] opacity-0 group-hover/slider:opacity-100 transition-opacity"></div>
            </div>
            
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Speed - Subtle, clean */}
        <button
          onClick={toggleSpeed}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-full border border-stone-800 text-[9px] font-bold font-sans text-stone-500 hover:text-amber-500 hover:border-amber-900/50 transition-colors"
          title="Playback Speed"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
};

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className, fallbackSrc, ...props }) => {
  const [error, setError] = useState(false);

  // Use a reliable placeholder (Khmer stone texture) if no fallback is provided
  const placeholder = fallbackSrc || 'https://www.shutterstock.com/image-photo/old-wall-texture-isolation-background-600nw-2191412685.jpg';

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-stone-900 border border-stone-800 ${className} overflow-hidden`}>
        {/* We try to render the fallback image instead of just an icon */}
        <img
          src={placeholder}
          alt="Fallback"
          className="w-full h-full object-cover opacity-50"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Hide Navbar on Admin pages
  if (location.pathname.startsWith('/admin')) return null;

  // Scroll detection for "Ceremonial Compact" effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCollectionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('categories');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('categories');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
        isScrolled
          ? 'bg-stone-950/95 backdrop-blur-md py-4 border-b border-black shadow-2xl'
          : 'bg-gradient-to-b from-stone-950/90 to-transparent py-8'
      }`}
    >
      <div className="w-full lg:w-[60%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative">
          
          {/* Mobile Menu Button - Left Aligned for symmetry */}
          <div className="md:hidden z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-400 hover:text-amber-500 p-2 transition-colors duration-500"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Left Navigation Link (Desktop) - Context Aware */}
          <div className="hidden md:flex flex-1 justify-end px-12">
            {(location.pathname.startsWith('/category/') || location.pathname.startsWith('/item/')) ? (
              <Link
                to="/"
                className="group relative px-4 py-2 text-xs font-sans font-medium uppercase tracking-[0.25em] text-amber-500 hover:text-amber-400 transition-colors duration-500 flex items-center gap-2"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 group-hover:w-1/2 transition-all duration-700 ease-out"></span>
              </Link>
            ) : (
              <Link
                to="/"
                className="group relative px-4 py-2 text-xs font-sans font-medium uppercase tracking-[0.25em] text-stone-400 hover:text-stone-100 transition-colors duration-500"
              >
                <span>Home</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 group-hover:w-1/2 transition-all duration-700 ease-out"></span>
              </Link>
            )}
          </div>

          {/* Center Logo - Royal Seal Style */}
          <Link to="/" className="flex flex-col items-center group relative z-10 shrink-0 mx-auto">
             {/* Naga Guardian Glow (Behind) */}
             <div className="absolute -inset-4 bg-amber-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
             
             <div className="relative flex flex-col items-center">
              <span className={`font-serif font-bold tracking-tight text-[#E6E1D8] group-hover:text-amber-400 transition-all duration-700 ease-out ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
                វប្បធម៌ខ្មែរ
              </span>
              <div className={`mt-2 flex flex-col items-center transition-all duration-700 ${isScrolled ? 'gap-1' : 'gap-2'}`}>
                {/* Decorative Line */}
                <span className={`h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent transition-all duration-700 ${isScrolled ? 'w-12' : 'w-24'}`}></span>
                <span className="font-sans text-[10px] text-stone-500 uppercase tracking-[0.4em] group-hover:text-amber-500/80 transition-colors duration-500 text-center">
                  Khmer Culture Archive
                </span>
              </div>
            </div>
          </Link>

          {/* Right Navigation Link (Desktop) */}
          <div className="hidden md:flex flex-1 justify-start px-12">
            <a
              href="#categories"
              onClick={handleCollectionsClick}
              className="group relative px-4 py-2 text-xs font-sans font-medium uppercase tracking-[0.25em] text-stone-400 hover:text-stone-100 transition-colors duration-500 cursor-pointer"
            >
              <span>Collections</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500 group-hover:w-1/2 transition-all duration-700 ease-out"></span>
            </a>
          </div>

          {/* Empty div for flex balance on mobile */}
          <div className="w-10 md:hidden"></div>

        </div>
      </div>

      {/* Mobile Menu Overlay - Ceremonial Reveal */}
      <div className={`fixed inset-0 z-40 bg-stone-950/98 backdrop-blur-xl transition-all duration-700 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full space-y-12">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-2xl font-serif text-stone-300 hover:text-amber-500 transition-colors duration-500"
          >
            Home
          </Link>
          <div className="w-12 h-px bg-stone-800"></div>
          <a
            href="#categories"
            onClick={handleCollectionsClick}
            className="text-2xl font-serif text-stone-300 hover:text-amber-500 transition-colors duration-500"
          >
            Collections
          </a>
        </div>
      </div>

      {/* Bottom Border Gradient - The "Guardian Line" */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent transition-opacity duration-700 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}></div>
    </nav>
  );
};

const Footer: React.FC = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="relative bg-stone-950 text-stone-400 py-16 md:py-20 mt-32 border-t border-stone-800/50">
      {/* Subtle Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative w-full lg:w-[80%] xl:w-[70%] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-16">
        
        {/* 1. Identity & Mission (Left) */}
        <div className="md:col-span-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-stone-200 text-xl tracking-wide">Khmer Culture Archive</h3>
            <div className="h-px w-12 bg-amber-700/50"></div>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed font-light max-w-sm">
            Preserving the soul of Cambodia through digital storytelling.
            <br />
            An archive designed with respect, for future generations.
          </p>
        </div>

        {/* 2. Cultural Use & Image License Notice (Middle - Important) */}
        <div className="md:col-span-5 space-y-6">
          <h4 className="font-sans text-[10px] uppercase tracking-[0.2em] text-amber-700/80 font-bold">
            Cultural Media Notice
          </h4>
          <div className="text-xs text-stone-500/80 leading-7 font-light text-justify border-l border-stone-800 pl-6">
            <p className="mb-4">
              All images, audio, and visual materials presented on this website are used solely for cultural preservation, educational, and promotional purposes related to Khmer heritage.
            </p>
            <p>
              If you are the rightful owner of any content displayed here and believe its use is inappropriate or unauthorized, please contact us. We will promptly review and remove the material with respect.
            </p>
          </div>
        </div>

        {/* 3. Meta / Utility Links (Right) */}
        <div className="md:col-span-3 md:flex md:flex-col md:items-end justify-between space-y-8 md:space-y-0">
          <div className="flex flex-col space-y-3 text-sm md:text-right">
             <span className="text-stone-300 font-serif">© 2025 Archive</span>
             <Link to="/admin" className="text-stone-600 hover:text-amber-600 transition-colors text-xs uppercase tracking-wider">Admin Access</Link>
             <span className="text-stone-600 text-xs hover:text-stone-400 cursor-pointer transition-colors">Credits & Sources</span>
          </div>

          <div className="pt-2">
             <span className="text-[10px] uppercase tracking-[0.3em] text-stone-700">Made with Respect</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AudioToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const hasAttemptedAutoplay = useRef(false);

  const fetchSettings = async () => {
    const settings = await api.getSiteSettings();
    // Only set URL if it exists and is not empty.
    const newUrl = settings['bg_music'] || "";
    setAudioUrl(newUrl);
  };

  // Initial load and event listener
  useEffect(() => {
    fetchSettings();

    // Listen for custom event from Admin panel
    const handleRefresh = () => {
      console.log("Refreshing audio settings...");
      fetchSettings();
    };

    window.addEventListener('REFRESH_SETTINGS', handleRefresh);
    return () => window.removeEventListener('REFRESH_SETTINGS', handleRefresh);
  }, []);

  // Auto-play when audio URL is loaded
  useEffect(() => {
    if (audioUrl && audioRef.current && !hasAttemptedAutoplay.current) {
      hasAttemptedAutoplay.current = true;
      audioRef.current.src = audioUrl;
      audioRef.current.volume = 0.2;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audioUrl]);

  // Update audio source dynamically when URL changes
  useEffect(() => {
    if (audioRef.current) {
      // If the URL actually changed
      const currentSrc = audioRef.current.src;

      // Note: .src property resolves to absolute URL, so strictly comparing might be tricky if audioUrl is relative, 
      // but here we expect full URLs from Supabase.
      if (audioUrl && currentSrc !== audioUrl) {
        audioRef.current.src = audioUrl;
        // If it was already playing, resume playing the new track
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Auto-resume failed", e));
        }
      }
    }
  }, [audioUrl, isPlaying]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 0.2; // Low volume
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Only render if we have a URL
  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} loop />
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-full shadow-lg border border-stone-800 transition-all duration-300 ${isPlaying ? 'bg-amber-600 text-white shadow-amber-900/50' : 'bg-stone-900 text-stone-400 hover:text-amber-400 hover:border-amber-600/50'
          }`}
        aria-label="Toggle Background Music"
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </div>
  );
};

// --- Pages ---

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItem, setFeaturedItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, settings, featuredItems] = await Promise.all([
          api.getCategories(),
          api.getSiteSettings(),
          api.getItemsByCategory('featured').catch(() => []) // Gracefully handle if 'featured' category doesn't exist yet
        ]);
        setCategories(cats);
        if (settings['hero_image']) {
          setHeroImage(settings['hero_image']);
        }
        if (featuredItems && featuredItems.length > 0) {
          setFeaturedItem(featuredItems[0]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Grid Logic for Editorial/Museum Layout
  const getGridSpan = (index: number) => {
    const i = index % 6;
    switch (i) {
      case 0: return 'md:col-span-7 md:aspect-[16/9] aspect-[4/3]';
      case 1: return 'md:col-span-5 md:aspect-[4/3] aspect-[4/3]';
      case 2: return 'md:col-span-5 md:aspect-[4/3] aspect-[4/3]';
      case 3: return 'md:col-span-7 md:aspect-[16/9] aspect-[4/3]';
      case 4: return 'md:col-span-6 md:aspect-[2/1] aspect-[4/3]';
      case 5: return 'md:col-span-6 md:aspect-[2/1] aspect-[4/3]';
      default: return 'md:col-span-4 md:aspect-[4/3] aspect-[4/3]';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      {/* Hero: Royal Inscription Style */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-stone-950">

        {/* 1. Background Treatment */}
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <ImageWithFallback
              src={heroImage}
              alt="Hero Background"
              className="w-full h-full object-cover grayscale-[30%] animate-zoom-fade"
            />
          )}
          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

          {/* Deep Vignette & Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/20 to-stone-950"></div>
          <div className="absolute inset-0 bg--[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/40 to-stone-950/90"></div>
        </div>

        {/* 2. Content: Monumental & Quiet */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">

          {/* Top Seal Title */}
          <div className="animate-fade-in-slow mb-16 opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <span className="block font-sans text-amber-500 text-[10px] md:text-xs tracking-[0.5em] uppercase font-bold text-shadow-sm border-b border-amber-500/30 pb-4 mb-2">
              Kingdom of Wonder
            </span>
            <span className="font-serif text-stone-600 text-xs italic tracking-widest opacity-60">
              Est. 802 AD
            </span>
          </div>

          {/* Primary Khmer Title */}
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#E6E1D8] font-bold mb-10 drop-shadow-2xl leading-relaxed py-2 opacity-0 animate-fade-in-up-slow" style={{ animationDelay: '0.5s' }}>
            ព្រលឹងខ្មែរ
          </h1>

          {/* Supporting Descriptions */}
          <div className="space-y-6 mb-16 opacity-0 animate-fade-in-up-slow" style={{ animationDelay: '0.8s' }}>
            <h2 className="font-sans text-stone-400/80 text-sm md:text-base tracking-[0.4em] uppercase font-light">
              The Soul of Khmer Civilization
            </h2>
            <p className="font-serif text-stone-400 text-lg md:text-xl max-w-xl mx-auto leading-loose italic opacity-80">
              "A curated proclamation of history, art, and the enduring spirit of an empire."
            </p>
          </div>

          {/* Royal Seal Button */}
          <a
            href="#categories"
            onClick={handleExploreClick}
            className="group relative inline-flex items-center justify-center gap-4 bg-[#8B6E4E] text-[#EAE5DF] px-10 py-4 min-w-[240px] rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-700 hover:bg-[#70563C] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] hover:-translate-y-1 opacity-0 animate-fade-in-up-slow border border-[#A68A6D]/20"
            style={{ animationDelay: '1.2s' }}
          >
            <span className="font-sans text-xs font-bold tracking-[0.25em] uppercase pointer-events-none">
              Enter The Archives
            </span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#D4C5A9]/50 to-transparent group-hover:w-3/4 transition-all duration-700"></span>
          </a>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30 animate-bounce-slow font-serif text-xs tracking-widest text-[#8B6E4E]">
          Scroll to Discover
        </div>
      </section>

      {/* 2. CULTURAL INTRODUCTION: Meaning before Content */}
      <section className="py-32 px-4 relative bg-stone-950">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent mx-auto"></div>
          
          <h2 className="space-y-6">
            <span className="block font-serif text-2xl md:text-4xl lg:text-5xl text-stone-200 leading-tight">
              <span>វប្បធម៌​រលត់​ ជាតិ​រលាយ</span>
              <span className="block mt-8 whitespace-nowrap">វប្បធម៌​ពណ្ណរាយ​ ជាតិ​​​ថ្កើង​ថ្កាន</span>
            </span>
            <span className="block font-sans text-stone-500 text-[10px] md:text-xs tracking-[0.3em] font-light uppercase w-full mx-auto leading-relaxed pt-8">
              <span className="block whitespace-nowrap">"If culture perishes, the nation dissolves."</span>
              <span className="block mt-4 whitespace-nowrap">"If culture flourishes, the nation prospers."</span>
            </span>
          </h2>

          <div className="w-px h-24 bg-gradient-to-b from-amber-500/50 via-transparent to-transparent mx-auto"></div>
        </div>
      </section>

      {/* 3. FEATURED CULTURAL STORY: The Hook (Dynamic) */}
      <section className="py-24 bg-stone-950 relative">
        {/* Section Header */}
        <div className="w-full lg:w-[60%] mx-auto px-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-800 to-stone-800"></div>
            <span className="text-stone-600 text-[10px] uppercase tracking-[0.3em]">Curator's Pick</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-stone-800 to-stone-800"></div>
          </div>
        </div>

        <div className="w-full lg:w-[60%] mx-auto px-6">
          <div className="relative border border-stone-800/50 bg-gradient-to-br from-stone-900 to-stone-950 grid grid-cols-1 lg:grid-cols-2 min-h-[550px] overflow-hidden group rounded-lg shadow-2xl">
            {featuredItem ? (
              <>
                {/* Image Side */}
                <div className="relative h-72 lg:h-full overflow-hidden">
                  <Link to={`/item/${featuredItem.id}`} className="block w-full h-full">
                     <ImageWithFallback
                        src={featuredItem.images?.[0] || featuredItem.cover_image}
                        alt={featuredItem.title_en}
                        className="w-full h-full object-cover opacity-50 grayscale-[30%] group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent to-stone-950/50"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent lg:hidden"></div>
                  </Link>
                  {/* Corner accent */}
                  <div className="absolute top-6 left-6 w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-px bg-amber-600/60"></div>
                    <div className="absolute top-0 left-0 h-full w-px bg-amber-600/60"></div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="relative flex flex-col justify-center p-10 lg:p-14">
                     {/* Decorative corner */}
                     <div className="absolute top-6 right-6 w-8 h-8 hidden lg:block">
                       <div className="absolute top-0 right-0 w-full h-px bg-stone-700"></div>
                       <div className="absolute top-0 right-0 h-full w-px bg-stone-700"></div>
                     </div>
                     
                     <div>
                        <div className="flex items-center gap-3 mb-6">
                          <span className="w-8 h-px bg-amber-600"></span>
                          <span className="font-sans text-amber-500 text-[10px] font-bold tracking-[0.25em] uppercase">
                            Featured This Month
                          </span>
                        </div>
                        <h3 className="font-serif text-3xl lg:text-4xl text-stone-100 leading-tight mb-4 group-hover:text-amber-400 transition-colors duration-500">
                          {featuredItem.title_en}
                        </h3>
                        <p className="text-stone-500 text-sm mb-6 font-light" style={{ fontFamily: "'Battambang', serif" }}>
                          {featuredItem.title_km || 'ប្រាសាទ និង ស្ថាបត្យកម្ម'}
                        </p>
                     </div>
                     
                     <p className="text-stone-400 text-base leading-relaxed mb-8 line-clamp-3 font-light">
                       {featuredItem.summary_en || featuredItem.description_en}
                     </p>

                     <div className="flex items-center gap-6 pt-4 border-t border-stone-800/50">
                        <Link to={`/item/${featuredItem.id}`} className="inline-flex items-center gap-3 text-amber-500 hover:text-amber-400 transition-colors group/btn">
                           <span className="uppercase tracking-[0.2em] text-[11px] font-semibold">Explore Story</span>
                           <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                     </div>
                     
                     {/* Decorative bottom corner */}
                     <div className="absolute bottom-6 right-6 w-8 h-8 hidden lg:block">
                       <div className="absolute bottom-0 right-0 w-full h-px bg-stone-700"></div>
                       <div className="absolute bottom-0 right-0 h-full w-px bg-stone-700"></div>
                     </div>
                </div>
              </>
            ) : (
            // Placeholder/Fallback if no feature item found yet
            <>
              <div className="relative h-64 lg:h-full overflow-hidden bg-stone-800 flex items-center justify-center">
                 <span className="text-stone-600 font-serif italic">Feature Coming Soon</span>
              </div>
              <div className="relative flex flex-col justify-center p-12 lg:p-16 border-l border-stone-800">
                   <div>
                      <span className="font-sans text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        Featured
                      </span>
                      <h3 className="font-serif text-4xl lg:text-5xl text-stone-100 leading-none mb-6">
                        Stories of Heritage
                      </h3>
                      <div className="w-16 h-1 bg-amber-700 mb-8"></div>
                   </div>
                   <p className="font-serif text-stone-400 text-lg leading-relaxed mb-8">
                     Our curators are selecting a special story from the archives. Check back soon to discover the hidden gems of Khmer civilization.
                   </p>
              </div>
            </>
          )}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE TIMELINE: Horizontal Scroll - COMMENTED OUT until images are ready
      <section className="py-32 bg-stone-950 overflow-hidden">
        <div className="w-full lg:w-[60%] mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end">
          <div>
            <span className="text-stone-500 text-xs font-sans tracking-[0.3em] uppercase block mb-3">Chronology</span>
            <h3 className="text-3xl md:text-4xl font-serif text-stone-200">The Eras of Empire</h3>
          </div>
          <div className="hidden md:flex gap-4 text-stone-600">
             <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
             <ArrowRight size={16} />
          </div>
        </div>

        <div className="w-full lg:w-[60%] mx-auto px-6 overflow-x-auto pb-12 hide-scrollbar">
           <div className="flex gap-8 min-w-full w-max justify-center">
            {[
              { year: '1st - 8th Century', title: 'Pre-Angkor', desc: 'Funan & Chenla Kingdoms', img: '' },
              { year: '802 AD - 1431', title: 'Angkor Era', desc: 'The Golden Age of Khmer Empire', img: '' },
              { year: '1431 - 1863', title: 'Post-Angkor', desc: 'Dark Ages & Movement of Capitals', img: '' },
              { year: '1953 - Present', title: 'New Era', desc: 'Independence & Modern Revival', img: '' }
            ].map((era, i) => (
              <div key={i} className="flex-none w-[80vw] md:w-[280px] snap-center group cursor-pointer relative aspect-[3/4] overflow-hidden rounded-sm border border-stone-800 hover:border-amber-700/50 transition-colors">
                 <ImageWithFallback src={era.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105 grayscale" alt={era.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 p-8">
                    <span className="block text-amber-500 text-xs font-mono mb-2">{era.year}</span>
                    <h4 className="font-serif text-3xl text-stone-100 mb-2">{era.title}</h4>
                    <p className="text-stone-400 text-sm font-sans font-light tracking-wide">{era.desc}</p>
                 </div>
              </div>
            ))}
           </div>
        </div>
      </section>
      */}

      {/* 5. LIVING TRADITIONS */}
      <section className="py-32 bg-stone-950 relative overflow-hidden">
         
         <div className="w-full lg:w-[60%] mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
               <span className="text-amber-600 text-[10px] font-sans tracking-[0.4em] uppercase block mb-4">Heritage & Performance</span>
               <h3 className="font-serif text-4xl md:text-5xl text-stone-200 mb-6">Living Traditions</h3>
               <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent mx-auto mb-6"></div>
               <p className="text-stone-500 max-w-xl mx-auto font-light leading-relaxed font-serif italic">
                  "Culture is not just stone; it is movement, sound, and spirit."
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                  { title: 'Robam Apsara', titleKh: 'របាំអប្សរា', sub: 'Classical Dance', desc: 'Ancient celestial dance passed down through generations', icon: '༺' },
                  { title: 'Sbek Thom', titleKh: 'ស្បែកធំ', sub: 'Shadow Theatre', desc: 'Sacred leather puppet performances of epic tales', icon: '༻' },
                  { title: 'Pleng Pinpeat', titleKh: 'ភ្លេងពិណពាទ្យ', sub: 'Royal Court Music', desc: 'Traditional ensemble music of the Khmer court', icon: '❖' },
               ].map((item, i) => (
                  <div key={i} className="relative bg-gradient-to-b from-stone-950 to-stone-900 p-10 text-center border border-stone-800/50 hover:border-amber-700/40 transition-all duration-700 group cursor-pointer rounded-sm overflow-hidden">
                     {/* Hover glow effect */}
                     <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                     
                     {/* Top decorative line */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent transition-all duration-700"></div>
                     
                     <div className="relative z-10">
                        <span className="text-3xl mb-4 block text-amber-700/40 group-hover:text-amber-500/60 transition-colors duration-500 font-serif">{item.icon}</span>
                        <span className="text-stone-600 text-lg font-serif block mb-2 group-hover:text-stone-500 transition-colors">{item.titleKh}</span>
                        <h4 className="font-serif text-2xl text-stone-200 mb-2 group-hover:text-amber-400 transition-colors duration-500">{item.title}</h4>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-700/70 mb-4">{item.sub}</p>
                        <p className="text-stone-500 text-sm font-light leading-relaxed group-hover:text-stone-400 transition-colors">{item.desc}</p>
                     </div>
                     
                     {/* Bottom decorative line */}
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/3 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent transition-all duration-700 delay-100"></div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. CULTURAL ARCHIVES (Redesigned Collections) */}
      <section id="categories" className="py-32 bg-stone-950 relative overflow-hidden">
        
        <div className="w-full lg:w-[70%] mx-auto px-6 relative z-10">
           <div className="flex flex-col items-center mb-24">
              <span className="font-sans text-amber-600 text-[10px] uppercase tracking-[0.4em] mb-4">The Repository</span>
              <h3 className="font-serif text-4xl md:text-5xl text-stone-100 text-center mb-4">Cultural Archives</h3>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent"></div>
              <p className="text-stone-500 text-center mt-6 max-w-lg font-light">Explore the treasures of Khmer civilization through our curated collections</p>
           </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.slice(0, 6).map((cat, index) => (
                <Link
                  to={`/category/${cat.slug}`}
                  key={cat.id}
                  className="group relative h-[400px] overflow-hidden rounded-lg border border-stone-800/50 hover:border-amber-700/50 transition-all duration-500 bg-stone-900"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <ImageWithFallback
                      src={cat.cover_image}
                      alt={cat.title_en}
                      className="w-full h-full object-cover opacity-40 grayscale-[50%] group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30"></div>
                  </div>

                  {/* Simple top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Content Layer */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                    {/* Category label */}
                    <span className="font-sans text-amber-500 text-[10px] font-semibold tracking-[0.25em] uppercase mb-3">
                      {cat.title_en}
                    </span>
                    
                    {/* Khmer title */}
                    <h4 className="font-serif text-3xl text-stone-100 leading-tight mb-4 group-hover:text-amber-400 transition-colors duration-500">
                      {cat.title_km}
                    </h4>
                    
                    {/* Action link */}
                    <div className="flex items-center gap-2 text-stone-500 group-hover:text-amber-500 transition-colors duration-500">
                      <span className="text-xs uppercase tracking-wider">Explore</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. QUOTE & FINAL REFLECTION */}
      <section className="py-32 md:py-40 relative flex items-center justify-center overflow-hidden bg-stone-950">
          {/* Top fade gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-stone-950 to-transparent z-10"></div>
          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 to-transparent z-10"></div>
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          
          <div className="text-center relative z-10 px-6 max-w-3xl mx-auto">
             {/* Decorative top element */}
             <div className="flex justify-center mb-8">
               <span className="text-amber-600/50 text-2xl">༺</span>
             </div>
             
             {/* Khmer Quote */}
             <h3 className="text-2xl md:text-3xl lg:text-4xl text-amber-500/90 leading-loose mb-6 font-medium" style={{ fontFamily: "'Battambang', 'Noto Serif Khmer', serif" }}>
               ជាតិដែលគ្មានវប្បធម៌ ដូចជាដើមឈើគ្មានឫស
             </h3>
             
             {/* English translation */}
             <p className="text-stone-400 text-base md:text-lg font-serif italic mb-10 font-light">
               "A nation without culture is a tree without roots"
             </p>
             
             {/* Attribution */}
             <div className="flex items-center justify-center gap-4">
               <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-700/50"></span>
               <span className="text-stone-500 uppercase tracking-[0.3em] text-[10px] font-medium">Khmer Proverb</span>
               <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-700/50"></span>
             </div>
             
             {/* Decorative bottom element */}
             <div className="flex justify-center mt-8">
               <span className="text-amber-600/50 text-2xl">༻</span>
             </div>
          </div>
      </section>

      {/* 8. EXIT CTA */}
      <section className="py-32 bg-stone-950 text-center">
         <h2 className="font-serif text-stone-100 text-3xl mb-12">Ready to explore deep?</h2>
         <a
            href="#"
            onClick={handleExploreClick}
            className="inline-block border border-amber-600/30 text-amber-500 px-12 py-5 uppercase tracking-[0.25em] text-xs font-bold hover:bg-amber-900/10 hover:border-amber-600 hover:text-amber-400 transition-all duration-500"
         >
            Enter The Archives
         </a>
      </section>    </div>
  );
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (slug) {
        try {
          const catData = await api.getCategoryBySlug(slug);
          const itemData = await api.getItemsByCategory(slug);
          if (catData) setCategory(catData);
          setItems(itemData);
        } catch (error) {
          console.error("Error fetching category details", error);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!category) return <div className="text-center py-20 text-stone-500">Category not found.</div>;

  return (
    <div className="animate-fade-in min-h-screen">
      {/* Category Header */}
      <div className="bg-stone-900 pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <ImageWithFallback src={category.cover_image} className="w-full h-full object-cover blur-sm" alt="bg" />
        </div>
        <div className="absolute inset-0 bg-stone-950/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10 pt-12">
          {/* Khmer Title Main */}
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-stone-100 drop-shadow-lg leading-relaxed">{category.title_km}</h1>
          {/* English Title Sub */}
          <h2 className="font-sans text-xl md:text-2xl text-amber-500 mb-8 drop-shadow-md uppercase tracking-widest">{category.title_en}</h2>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed font-serif">{category.description_km}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Timeline Spine / Vertical Guide */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-900/40 to-transparent -translate-x-1/2"></div>

        <div className="grid gap-16 relative z-10">
          {items.length === 0 && (
            <p className="text-center text-stone-500 italic">No items found in this collection yet.</p>
          )}
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <div
                className={`flex flex-col md:flex-row gap-12 md:gap-20 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="w-full md:w-1/2 aspect-[4/3] overflow-hidden rounded-lg shadow-2xl border border-stone-800 group relative">
                  <Link to={`/item/${item.id}`}>
                    <ImageWithFallback
                      src={item.images[0]}
                      alt={item.title_en}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors"></div>
                  </Link>
                </div>
                <div className="w-full md:w-1/2 space-y-8">
                  <Link to={`/item/${item.id}`} className="block group">
                    {/* Khmer Item Title - Powerful & Metallic */}
                    <h3 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-3 drop-shadow-2xl">
                      <span className="bg-clip-text text-transparent bg-gradient-to-br from-stone-100 via-stone-300 to-stone-500 group-hover:from-amber-300 group-hover:via-amber-500 group-hover:to-amber-700 transition-all duration-700">
                        {item.title_km}
                      </span>
                    </h3>

                    {/* English Item Subtitle - Elegant & Precise */}
                    <h4 className="flex items-center gap-3">
                      <span className="h-px w-8 bg-amber-600/60"></span>
                      <span className="text-sm font-sans text-amber-500/90 uppercase tracking-[0.3em] font-semibold">{item.title_en}</span>
                    </h4>
                  </Link>

                  {/* Summary Block - Clean & Spaced */}
                  <div className="space-y-4 border-l-2 border-stone-800 pl-6 py-1 group-hover:border-amber-800/50 transition-colors duration-500">
                    {/* Khmer Summary */}
                    <p className="text-stone-300/90 leading-loose text-xl font-serif tracking-wide">
                      {item.summary_km}
                    </p>
                    {/* English Summary */}
                    <p className="text-stone-500 font-sans text-sm font-light leading-relaxed tracking-wide opacity-80">
                      {item.summary_en}
                    </p>
                  </div>

                  <Link
                    to={`/item/${item.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-stone-800 rounded-sm hover:border-amber-600/50 hover:bg-amber-900/10 transition-all duration-500 group/btn"
                  >
                    <span className="text-amber-500 font-sans text-xs font-bold tracking-[0.25em] uppercase group-hover/btn:text-amber-400">Read Story</span>
                    <ArrowRight size={14} className="text-amber-600 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Divider Line (not after last item) */}
              {index < items.length - 1 && (
                <div className="relative py-16 w-full flex justify-center items-center opacity-60">
                  {/* Left Line (visible on Odd items where Text is on Left) */}
                  <div className={`hidden md:block absolute left-0 w-1/2 h-px bg-gradient-to-l from-amber-700/60 to-transparent ${index % 2 === 0 ? 'invisible' : ''}`}></div>

                  {/* Right Line (visible on Even items where Text is on Right) */}
                  <div className={`hidden md:block absolute right-0 w-1/2 h-px bg-gradient-to-r from-amber-700/60 to-transparent ${index % 2 !== 0 ? 'invisible' : ''}`}></div>

                  {/* Mobile Line (Centered short line) */}
                  <div className="md:hidden w-32 h-px bg-gradient-to-r from-transparent via-amber-800/60 to-transparent absolute"></div>

                  {/* Center Anchor Dot */}
                  <div className="w-2 h-2 rounded-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.6)] relative z-10"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      if (id) {
        try {
          const data = await api.getItemDetail(id);
          if (data) {
            setItem(data);
            const catData = await api.getCategoryBySlug(data.category_slug);
            if (catData) setCategory(catData);
          }
        } catch (error) {
          console.error("Error fetching item", error);
        }
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!item) return <div className="text-center py-40 text-stone-500 font-serif">Record not found in archive.</div>;

  return (
    <div className="animate-fade-in min-h-screen pb-40 bg-stone-950">

      {/* 1. HERO SECTION: Monumental & Cinematic */}
      <div className="relative h-[90vh] flex items-end">
        {/* Background Image with Cinematic Fade */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={item.images[0]}
            alt={item.title_en}
            className="w-full h-full object-cover"
          />
          {/* Deep overlay for text readability */}
          <div className="absolute inset-0 bg-stone-950/30 mix-blend-multiply"></div>
          {/* Gradient Fade at bottom - Seamless transition to content */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 md:pb-32">
          {/* Back Navigation - Reduced prominence */}
          {/* Back Navigation - Standardized */}
          <Link to={`/category/${item.category_slug}`} className="absolute -top-20 left-6 md:left-0 inline-flex items-center text-stone-400 hover:text-amber-500 transition-colors text-xs font-medium uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
            <ChevronLeft size={14} className="mr-1" /> Archives
          </Link>

          {/* Titles */}
          <div className="animate-fade-in-up">
            {/* Khmer Title - Monumental */}
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-stone-100 mb-6 drop-shadow-2xl leading-tight opacity-95">
              {item.title_km}
            </h1>

            {/* Decorative Line */}
            <div className="w-24 h-1 bg-amber-600 mb-6 opacity-80"></div>

            {/* English Title - Secondary, Quiet */}
            <h2 className="font-sans text-xl md:text-2xl text-stone-400 font-light tracking-[0.15em] opacity-80 uppercase">
              {item.title_en}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. NARRATIVE CONTENT LAYOUT: Story & Metadata */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* LEFT: Story Section (Narrative) */}
          <div className="lg:col-span-8 animate-fade-in-up delay-200">
            {/* Summary / Introduction */}
            <div className="mb-16">
              <p className="font-serif text-2xl md:text-3xl leading-relaxed text-stone-200 indent-12 italic border-l-2 border-amber-900/50 pl-8 py-2">
                "{item.summary_en}"
              </p>
            </div>

            {/* Audio Narrator - Integrated gently */}
            {/* Audio Narrator - Integrated gently */}
            {item.audio && <AudioPlayer src={item.audio} />}

            {/* Main Narrative Text - Breathing Room */}
            <div className="prose prose-invert prose-xl max-w-none">
              {/* Khmer Content - Primary Story */}
              <div className="font-serif text-xl md:text-2xl leading-loose text-stone-300 whitespace-pre-wrap mb-12 text-justify">
                {item.content_km}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-12 opacity-30">
                <div className="h-px bg-amber-500 w-full"></div>
                <span className="text-amber-500/50 text-xs uppercase tracking-widest min-w-max">English Translation</span>
                <div className="h-px bg-amber-500 w-full"></div>
              </div>

              {/* English Content - Secondary */}
              <div className="font-sans text-lg leading-relaxed text-stone-400/90 whitespace-pre-wrap font-light">
                {item.content_en}
              </div>
            </div>

            {/* 5. CULTURAL DETAIL SECTIONS (New "Dividers" for structure) */}
            <div className="mt-24 space-y-24">
              {/* Section: Architectural Detail */}
              <div className="border-t border-amber-900/30 pt-10">
                <h3 className="font-serif text-3xl text-stone-200 mb-6">Architectural Significance</h3>
                <p className="text-stone-400 font-light leading-relaxed max-w-2xl">
                  Observe the intricate carvings and structural balance. Every stone placement holds a specific meaning,
                  reflecting the cosmological beliefs of the era.
                  <span className="block mt-4 text-xs uppercase tracking-widest text-amber-700/70">Analysis by Cultural Archive Team</span>
                </p>
              </div>
            </div>

            {/* NEW: Location & Exploration Section - Only if Category enables it */}
            {category?.has_map_feature && (item.location_coordinates || item.photo_spots) && (
              <div className="mt-24 pt-12 border-t border-stone-800">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <span className="text-amber-500 font-sans text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Exploration Guide</span>
                    <h3 className="font-serif text-3xl text-stone-200">Maps & Highlights</h3>
                  </div>
                </div>

                {/* 1. Maps Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                  {/* Geographic Map */}
                  {item.location_coordinates && (
                    <div className="bg-stone-900 rounded-lg overflow-hidden border border-stone-800 shadow-xl group">
                      <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
                        <h4 className="text-stone-300 font-sans text-sm font-medium tracking-wide flex items-center gap-2">
                          Location Map
                        </h4>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${item.location_coordinates.lat},${item.location_coordinates.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-500 hover:text-amber-400 text-xs font-sans uppercase tracking-widest border border-amber-900/50 px-3 py-1 rounded-sm hover:bg-amber-900/20 transition-all"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                      <div className="md:aspect-[4/3] aspect-square w-full bg-stone-800 relative">
                        {/* Using OpenStreetMap Embed */}
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.location_coordinates.lng - 0.01}%2C${item.location_coordinates.lat - 0.01}%2C${item.location_coordinates.lng + 0.01}%2C${item.location_coordinates.lat + 0.01}&layer=mapnik&marker=${item.location_coordinates.lat}%2C${item.location_coordinates.lng}`}
                          style={{ filter: 'grayscale(0.8) invert(0.9) contrast(1.2)' }} // Dark mode map hack
                          title="Location Map"
                        ></iframe>
                        <div className="absolute inset-0 pointer-events-none border-4 border-stone-900/10 shadow-inner"></div>
                      </div>
                    </div>
                  )}

                  {/* Temple Layout / Plan */}
                  {item.map_image_url && (
                    <div className="bg-stone-900 rounded-lg overflow-hidden border border-stone-800 shadow-xl group">
                      <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
                        <h4 className="text-stone-300 font-sans text-sm font-medium tracking-wide">
                          Structure Plan
                        </h4>
                        <span className="text-stone-600 text-xs uppercase tracking-wider">Internal Layout</span>
                      </div>
                      <div className="md:aspect-[4/3] aspect-square w-full bg-stone-950 relative overflow-hidden">
                        <ImageWithFallback
                          src={item.map_image_url}
                          alt="Temple Plan"
                          className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Photo Spots */}
                {item.photo_spots && item.photo_spots.length > 0 && (
                  <div>
                    <h4 className="font-serif text-xl text-stone-300 mb-6 flex items-center gap-3">
                      <Camera size={20} className="text-amber-600" />
                      Sanctuary Photo Spots
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {item.photo_spots.map((spot, idx) => (
                        <div key={idx} className="group bg-stone-950 border border-stone-800 hover:border-amber-900/50 rounded-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.05)]">
                          <div className="aspect-video overflow-hidden relative">
                            <ImageWithFallback
                              src={spot.image_url}
                              alt={spot.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors"></div>
                          </div>
                          <div className="p-5">
                            <h5 className="text-stone-200 font-serif text-lg mb-2 group-hover:text-amber-500 transition-colors">{spot.title}</h5>
                            <p className="text-stone-500 text-sm leading-relaxed">{spot.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Gallery Grid - Integrated at bottom of story */}
            {item.images.length > 1 && (
              <div className="mt-24 pt-12 border-t border-stone-800">
                <h3 className="font-serif text-2xl text-stone-200 mb-10">Visual Archive</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {item.images.slice(1).map((img, idx) => (
                    <div key={idx} className="group aspect-[4/3] overflow-hidden grayscale-[30%] hover:grayscale-0 transition-all duration-700 border border-stone-900">
                      <ImageWithFallback
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Cultural Metadata Panel ("The Plaque") */}
          <div className="lg:col-span-4 relative mt-12 lg:mt-0">
            <div className="sticky top-24">
              <div className="bg-stone-900/40 backdrop-blur-sm border border-stone-800/60 p-8 shadow-2xl relative overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-700/50 to-transparent"></div>

                <h4 className="font-serif text-stone-100 text-xl mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  Archive Record
                </h4>

                <dl className="space-y-6 text-sm font-sans">
                  <div className="group">
                    <dt className="text-stone-500 uppercase tracking-[0.2em] text-[10px] mb-1 group-hover:text-amber-600 transition-colors">Category</dt>
                    <dd className="text-stone-200 font-medium tracking-wide border-b border-stone-800 pb-2 capitalize">{item.category_slug.replace('-', ' ')}</dd>
                  </div>
                  <div className="group">
                    <dt className="text-stone-500 uppercase tracking-[0.2em] text-[10px] mb-1 group-hover:text-amber-600 transition-colors">Date Archived</dt>
                    <dd className="text-stone-200 font-medium tracking-wide border-b border-stone-800 pb-2 font-mono text-xs opacity-70">
                      {new Date(item.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </dd>
                  </div>
                  {/* Static Enhancement Data */}
                  <div className="group">
                    <dt className="text-stone-500 uppercase tracking-[0.2em] text-[10px] mb-1 group-hover:text-amber-600 transition-colors">Era / Period</dt>
                    <dd className="text-stone-200 font-medium tracking-wide border-b border-stone-800 pb-2">Angkorian (Late 12th Century)</dd>
                  </div>
                  <div className="group">
                    <dt className="text-stone-500 uppercase tracking-[0.2em] text-[10px] mb-1 group-hover:text-amber-600 transition-colors">Location</dt>
                    <dd className="text-stone-200 font-medium tracking-wide border-b border-stone-800 pb-2">Siem Reap, Cambodia</dd>
                  </div>
                </dl>

                <div className="mt-10 pt-6 border-t border-stone-800/50">
                  <p className="text-stone-600 text-[10px] uppercase tracking-widest leading-relaxed text-center">
                    Preserved by Khmer Culture Archive<br />
                    Digital Collection ID: {item.id.substring(0, 8)}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div >
  );
};

// --- App Container ---

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-900 selection:text-amber-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <AudioToggle />
      </div>
    </HashRouter>
  );
};

export default App;