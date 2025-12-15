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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleCollectionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById('categories');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      // Allow navigation to complete before scrolling
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
    <nav className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex flex-col items-start group">
            <span className="font-serif font-bold text-xl tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
              វប្បធម៌ខ្មែរ
            </span>
            <span className="font-sans text-xs text-stone-500 uppercase tracking-widest group-hover:text-stone-400 transition-colors">Khmer Culture Archive</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-stone-400 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            <span className="text-stone-700">|</span>
            <a
              href="#categories"
              onClick={handleCollectionsClick}
              className="text-stone-400 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
            >
              Collections
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-300 hover:text-amber-400 p-2 transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute w-full bg-stone-900 border-b border-stone-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-amber-400 rounded-md">Home</Link>
            <a
              href="#categories"
              onClick={handleCollectionsClick}
              className="block px-3 py-2 text-base font-medium text-stone-300 hover:bg-stone-800 hover:text-amber-400 rounded-md cursor-pointer"
            >
              Collections
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-stone-950 text-stone-400 py-12 mt-20 border-t border-stone-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <h3 className="font-serif text-stone-200 text-lg mb-2">Khmer Culture Archive</h3>
        <p className="text-sm text-stone-500 max-w-md">
          Preserving the soul of Cambodia through digital storytelling.
          Architecture designed for the future.
        </p>
      </div>
      <div className="flex items-center space-x-6 text-sm font-serif">
        <span>© 2024</span>
        <span className="text-stone-700">•</span>
        <Link to="/admin" className="hover:text-amber-500 transition-colors">Admin</Link>
        <span className="text-stone-700">•</span>
        <span>Made with Respect</span>
      </div>
    </div>
  </footer>
);

const AudioToggle: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState('https://www.cambodia-images.com/wp-content/uploads/2018/05/Angkor-sunset_1.jpg');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, settings] = await Promise.all([
          api.getCategories(),
          api.getSiteSettings()
        ]);
        setCategories(cats);
        if (settings['hero_image']) {
          setHeroImage(settings['hero_image']);
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
    // This pattern creates a rhythm:
    // Row 1: 7 cols | 5 cols
    // Row 2: 5 cols | 7 cols
    // Row 3: 6 cols | 6 cols
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
          <ImageWithFallback
            src={heroImage}
            alt="Hero Background"
            className="w-full h-full object-cover grayscale-[30%] animate-zoom-fade"
          />
          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

          {/* Deep Vignette & Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/20 to-stone-950"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/40 to-stone-950/90"></div>
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

      {/* Intro Text */}
      <section className="py-24 px-4 sm:px-6 max-w-3xl mx-auto text-center relative">
        <div className="w-16 h-1 bg-gradient-to-r from-amber-700 to-amber-500 mx-auto mb-10"></div>
        <h2 className="text-3xl font-serif text-stone-100 mb-8 tracking-wide">Heritage & Harmony</h2>
        <p className="text-stone-500 font-serif text-xs md:text-sm uppercase tracking-[0.2em] leading-loose max-w-2xl mx-auto">
          Cambodian culture is a rich tapestry woven with threads of Hindu and Buddhist traditions,
          royal ceremonies, and the indomitable spirit of its people. From the stone faces of Bayon
          to the delicate gestures of Apsara, every element tells a story of resilience and beauty.
        </p>
      </section>

      {/* Categories Grid (Royal Gallery Redesign) */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mb-32 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 border-b border-stone-800/60 pb-8">
          <div>
            <span className="font-sans text-stone-500 text-[10px] uppercase tracking-[0.25em] mb-4 block opacity-60">
              The Collections
            </span>
            <h3 className="font-serif text-4xl md:text-5xl text-stone-200 tracking-wide drop-shadow-lg">
              Royal Archives
            </h3>
          </div>
          <span className="font-sans text-[10px] text-stone-500 uppercase tracking-[0.25em] hidden md:block opacity-60 mt-4 md:mt-0">
            Select a hall to explore
          </span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {categories.map((cat) => (
              <Link
                to={`/category/${cat.slug}`}
                key={cat.id}
                className="group relative h-[500px] overflow-hidden rounded-sm border border-stone-800/50 hover:border-amber-700/50 transition-colors duration-700 bg-stone-900 shadow-2xl"
              >
                {/* 1. Background Image - Deep & Mysterious */}
                <div className="absolute inset-0 overflow-hidden">
                  <ImageWithFallback
                    src={cat.cover_image}
                    alt={cat.title_en}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                  />
                  {/* "The Awakening" Overlay - Reduced Darkness */}
                  <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-all duration-1000 mix-blend-multiply"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent opacity-90 transition-opacity duration-700"></div>
                </div>

                {/* 2. Content Layer - Monumental */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">

                  {/* Decorative Top Mark */}
                  <div className="absolute top-8 left-8 w-px h-12 bg-amber-500/30 group-hover:bg-amber-500/80 transition-colors duration-700"></div>

                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">

                    {/* English Label - Gold & Precise */}
                    <div className="mb-4 overflow-hidden">
                      <span className="inline-block font-sans text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase opacity-90 group-hover:opacity-100 transition-all duration-700">
                        {cat.title_en}
                      </span>
                    </div>

                    {/* Khmer Title - Luminous Stone */}
                    {/* Khmer Title - Luminous Stone */}
                    <h4 className="font-serif text-2xl md:text-3xl text-[#E6E1D8] font-bold leading-tight mb-6 drop-shadow-2xl opacity-100 transition-opacity duration-500 text-shadow-lg group-hover:text-amber-500/90 transition-colors">
                      {cat.title_km}
                    </h4>

                    {/* Hidden Narrative - Slides Up */}
                    <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-700 ease-in-out">
                      <div className="pt-4 border-t border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">
                        <p className="font-serif text-stone-300/80 text-sm leading-relaxed font-light line-clamp-3 italic">
                          "{cat.description_km || cat.description_en}"
                        </p>

                        {/* "Enter" Stamp Indicator */}
                        <div className="mt-6 flex items-center gap-3 text-amber-600/80">
                          <div className="h-px w-8 bg-current"></div>
                          <span className="text-[10px] uppercase tracking-widest font-sans">Enter Gallery</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
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
      <div className="bg-stone-900 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <ImageWithFallback src={category.cover_image} className="w-full h-full object-cover blur-sm" alt="bg" />
        </div>
        <div className="absolute inset-0 bg-stone-950/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10 pt-12">
          <Link to="/" className="absolute top-0 left-0 inline-flex items-center text-stone-400 hover:text-amber-500 transition-colors text-xs font-medium uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
            <ChevronLeft size={14} className="mr-1" /> Collections
          </Link>
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
            {item.audio && (
              <div className="mb-16 flex items-center gap-4 bg-stone-900/30 border border-stone-800/50 p-4 rounded-full w-max pr-8 hover:bg-stone-900/50 transition-colors cursor-pointer group">
                <button className="w-10 h-10 flex items-center justify-center bg-amber-700/20 text-amber-600 rounded-full group-hover:bg-amber-600 group-hover:text-stone-100 transition-all">
                  <Volume2 size={18} />
                </button>
                <span className="text-stone-500 text-xs uppercase tracking-widest font-medium group-hover:text-stone-300 transition-colors">Listen to the history</span>
              </div>
            )}

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