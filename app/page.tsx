'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import FlipClock from '../components/FlipClock';
import { getMediaFiles } from './actions';

const ModelViewer = dynamic(() => import('../components/ModelViewer'), { ssr: false });

export default function Home() {
  const [models, setModels] = useState<{name: string, url: string}[]>([]);
  const [musicTracks, setMusicTracks] = useState<{name: string, url: string}[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isScrolling = useRef(false);
  const [showButton, setShowButton] = useState(true);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [volume, setVolume] = useState(30);
  
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isRepeat, setIsRepeat] = useState(false);
  const musicPlayerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMusicPlayerOpen && musicPlayerContainerRef.current && !musicPlayerContainerRef.current.contains(event.target as Node)) {
        setIsMusicPlayerOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMusicPlayerOpen]);

  useEffect(() => {
    getMediaFiles().then(data => {
      setModels(data.models);
      setMusicTracks(data.musicTracks);
      if (data.musicTracks.length > 0) {
        setCurrentSongIndex(Math.floor(Math.random() * data.musicTracks.length));
      }
    });
  }, []);

  useEffect(() => {
    if (musicAudioRef.current) musicAudioRef.current.volume = volume / 100;
  }, [volume]);

  const playRandomSong = () => {
    if (musicTracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * musicTracks.length);
    setCurrentSongIndex(randomIndex);
    setIsPlayingMusic(true);
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentSongIndex === -1) {
      playRandomSong();
      return;
    }
    if (isPlayingMusic) {
      musicAudioRef.current?.pause();
      setIsPlayingMusic(false);
    } else {
      musicAudioRef.current?.play().catch(console.error);
      setIsPlayingMusic(true);
    }
  };

  const playNextSong = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (musicTracks.length === 0) return;
    if (isShuffle) {
      playRandomSong();
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % musicTracks.length);
      setIsPlayingMusic(true);
    }
  };

  const playPrevSong = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (musicTracks.length === 0) return;
    if (isShuffle) {
      playRandomSong();
    } else {
      setCurrentSongIndex((prev) => (prev - 1 + musicTracks.length) % musicTracks.length);
      setIsPlayingMusic(true);
    }
  };

  const handleSongEnded = () => {
    if (isRepeat) {
      if (musicAudioRef.current) {
        musicAudioRef.current.currentTime = 0;
        musicAudioRef.current.play().catch(console.error);
      }
    } else {
      playNextSong();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (musicAudioRef.current) {
      musicAudioRef.current.currentTime = time;
    }
  };

  useEffect(() => {
    if (currentSongIndex !== -1 && musicAudioRef.current) {
      if (isPlayingMusic) {
        musicAudioRef.current.play().catch(console.error);
      }
    }
  }, [currentSongIndex, isPlayingMusic]);

  const filteredModels = models.map((m, idx) => ({ ...m, originalIndex: idx }))
    .filter(model => model.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY < 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartEngine = () => {
    if (isScrolling.current) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(e => console.error("Audio playback failed", e));

    // Default fallback duration, but will use audio.duration if loaded
    let durationMs = 5000;
    if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
      durationMs = audio.duration * 1000;
    }

    isScrolling.current = true;

    const startY = window.scrollY;
    const endY = window.innerHeight * 3; // Scroll exactly 300vh to finish the 400vh hero section
    const startTime = performance.now();

    const easeInOutSine = (t: number) => {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    };

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const ease = easeInOutSine(progress);

      window.scrollTo(0, startY + (endY - startY) * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        isScrolling.current = false;
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <main className="w-full overflow-x-hidden">
      {/* 400vh Hero Container */}
      <div className="min-h-[400vh] bg-transparent text-white font-sans relative selection:bg-white/20">
        <audio ref={audioRef} src="/engine-audio.mp4" preload="auto" />
        <ScrollCanvas />

        {/* Sticky UI Wrapper */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">

          {/* Top Navbar */}
          <header className="flex justify-between items-center p-6 md:px-12 w-full relative z-50">
            <div className="w-12"></div>
            <div className="text-lg md:text-xl font-light tracking-[0.3em] uppercase flex-1 text-center ml-8 md:ml-0">
              AURA
            </div>
            <div className="flex items-center gap-6 text-[10px] font-light tracking-[0.2em] text-gray-500">
              <span className="hover:text-white transition-colors cursor-pointer uppercase hidden sm:block">EN</span>
            </div>
          </header>

          {/* Left Sidebar Navigation */}
          <nav className="hidden lg:flex flex-col gap-12 absolute left-12 top-1/2 -translate-y-1/2 z-50 text-[9px] font-light tracking-[0.3em] text-gray-500 uppercase">
            <a href="#" className="hover:text-white transition-colors">Engine</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Our Reviews</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col items-center justify-center relative w-full px-4 py-8 md:py-16">

            {/* Oversized Brand Text (Background) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] md:text-[24vw] font-extralight tracking-[0.1em] select-none pointer-events-none whitespace-nowrap z-0 opacity-5"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255, 255, 255, 0.5)',
              }}
            >
              AURA
            </div>

            {/* Bottom Left Title */}
            <div className={`absolute bottom-6 left-6 md:bottom-12 md:left-12 z-50 pointer-events-none transition-all duration-700 ease-in-out ${showButton ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'}`}>
              <h2 
                className="text-[12vw] md:text-[10vw] font-black tracking-tighter leading-none text-white/30 mix-blend-overlay"
                style={{
                  textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.6)',
                }}
              >
                RED BULL
              </h2>
            </div>

          </main>



          {/* Start Engine Button (Bottom Right) */}
          <button
            onClick={handleStartEngine}
            className={`absolute bottom-6 right-6 md:bottom-12 md:right-12 z-50 px-8 py-3 md:px-10 md:py-4 rounded-full border border-white/20 hover:bg-white hover:text-black text-white text-[9px] md:text-[10px] font-light tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-md ${showButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            Start Engine
          </button>

        </div> {/* End Sticky UI Wrapper */}
      </div> {/* End 400vh Hero Container */}

      {/* Infinite Logo Carousels */}
      <section className="relative z-50 pt-48 pb-24 bg-gradient-to-b from-transparent via-black to-black overflow-hidden">
        <div className="w-full relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          {/* Row 1: Right to Left */}
          <div className="flex w-max animate-marquee opacity-40 hover:opacity-80 transition-opacity duration-500">
            {[...Array(2)].map((_, i) => (
              <div key={`row1-${i}`} className="flex items-center gap-16 md:gap-32 px-8 md:px-16">
                {['MERCEDES-AMG', 'FERRARI', 'RED BULL RACING', 'MCLAREN', 'ASTON MARTIN', 'FORMULA 1'].map((logo, j) => (
                  <span key={j} className="text-2xl md:text-5xl font-extralight tracking-[0.2em] whitespace-nowrap text-white">
                    {logo}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Row 2: Left to Right */}
          <div className="flex w-max animate-marquee-reverse opacity-40 hover:opacity-80 transition-opacity duration-500 mt-12 md:mt-20">
            {[...Array(2)].map((_, i) => (
              <div key={`row2-${i}`} className="flex items-center gap-16 md:gap-32 px-8 md:px-16">
                {['PIRELLI', 'ROLEX', 'AWS', 'HONDA', 'PETRONAS', 'ARAMCO'].map((logo, j) => (
                  <span key={j} className="text-2xl md:text-5xl font-extralight tracking-[0.2em] whitespace-nowrap text-white">
                    {logo}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="relative z-50 bg-black w-full">
        <div className="py-24 px-6 md:px-12 lg:px-24 text-white max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 md:gap-6">

          {/* 1. Top Left Square */}
          <div className="col-span-1 row-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center backdrop-blur-sm group hover:bg-white/10 transition-colors">
            <div className="text-3xl font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-br from-white to-[#E6D4FF]">AURA</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">Core Engine</div>
          </div>

          {/* 2. Top Middle Wide */}
          <div className="col-span-1 md:col-span-2 row-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center backdrop-blur-sm group hover:bg-white/10 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6D4FF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-20 w-full h-full flex items-center justify-center">
              <FlipClock />
            </div>
          </div>

          {/* 3. Top Right Tall */}
          <div className="col-span-1 row-span-1 md:row-span-2 bg-black border border-white/10 rounded-3xl p-0 flex flex-col justify-end group hover:border-white/20 transition-colors relative overflow-hidden min-h-[300px]">
            <div className="absolute inset-0 z-0 opacity-60 grayscale mix-blend-luminosity group-hover:opacity-100 group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700">
              <img src="/bento-bg-1.png" alt="Theme Background" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 4. Middle Left Square */}
          <div className="col-span-1 row-span-1 bg-black border border-white/10 rounded-3xl p-0 flex flex-col items-center justify-center group hover:border-white/20 transition-colors relative overflow-hidden min-h-[250px]">
            <div className="absolute inset-0 z-0 opacity-60 grayscale mix-blend-luminosity group-hover:opacity-100 group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700">
              <img src="/bento-bg-3.jpg" alt="Theme Background" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 5. Middle Center Square */}
          <div className="col-span-1 row-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center backdrop-blur-sm group hover:bg-white/10 transition-colors">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" alt="F1 Logo" className="w-24 h-auto object-contain filter invert opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* 6. Middle Right Tall */}
          <div className="col-span-1 row-span-1 md:row-span-2 bg-black border border-white/10 rounded-3xl p-0 flex flex-col justify-between group hover:border-white/20 transition-colors relative overflow-hidden min-h-[300px]">
            <div className="absolute inset-0 z-0 opacity-60 grayscale mix-blend-luminosity group-hover:opacity-100 group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700">
              <img src="/bento-bg-2.png" alt="Theme Background" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 7. Bottom Left Wide */}
          <div className="col-span-1 md:col-span-2 row-span-1 bg-black border border-[#E6D4FF]/10 rounded-3xl p-0 flex flex-col justify-center items-center backdrop-blur-sm group hover:border-[#E6D4FF]/20 transition-colors relative overflow-hidden min-h-[250px]">
             <div className="absolute inset-0 z-0 flex items-center justify-center -rotate-90 scale-[1.3] md:scale-[1.5]">
               <img src="/anime%20girl.png" alt="Anime Character" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-2xl" />
             </div>
          </div>

          {/* 8. Bottom Right Square */}
          <div className="col-span-1 row-span-1 bg-[#E6D4FF]/10 border border-[#E6D4FF]/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center backdrop-blur-sm group hover:bg-[#E6D4FF]/20 transition-colors relative overflow-hidden">
            <div className="w-24 h-24 relative flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(230,212,255,0.5)]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                <circle 
                  cx="50" cy="50" r="44" 
                  stroke="#E6D4FF" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeLinecap="round"
                  style={{ 
                    strokeDasharray: 276, 
                    strokeDashoffset: 276 - (276 * volume / 100),
                    transition: 'stroke-dashoffset 0.1s ease-out' 
                  }}
                />
              </svg>
              <div className="bg-[#1a1a1a] px-3 py-1 rounded-full text-[10px] font-medium border border-white/10 relative z-10 pointer-events-none">{volume}%</div>
              
              {/* Invisible interactive range input */}
              <input 
                type="range" 
                min="0" max="100" 
                value={volume} 
                onChange={(e) => {
                  setVolume(parseInt(e.target.value));
                  if (musicAudioRef.current && musicAudioRef.current.paused) {
                    setIsPlayingMusic(true);
                    musicAudioRef.current.play().catch(()=>{});
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                aria-label="Volume Control"
              />
            </div>
            <div className="mt-6 text-[9px] text-[#E6D4FF] uppercase tracking-widest flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              Master Volume
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* 3D Model Creator Dashboard */}
      <section className="relative z-50 py-24 px-4 md:px-8 bg-black w-full">
        <div className="max-w-[1400px] mx-auto bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-8 shadow-2xl overflow-hidden relative">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/icon.jpg" alt="Aura Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-light tracking-[0.2em] text-white">AURA<span className="text-gray-500">MODELER</span></span>
            </div>
            
            <div className="flex-1 w-full max-w-xl relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search models..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm font-light text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-colors" 
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <button
                        key={model.originalIndex}
                        onClick={() => {
                          setActiveModelIndex(model.originalIndex);
                          setSearchQuery(model.name);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-6 py-4 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                      >
                        {model.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-500">No models found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end relative" ref={musicPlayerContainerRef}>
              <div 
                className="flex items-center gap-3 px-2 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
              >
                <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center transition-all duration-700 ${isPlayingMusic ? 'ring-2 ring-[#E6D4FF]/50 shadow-[0_0_10px_rgba(230,212,255,0.5)]' : ''}`}>
                  <img src="/headphone-icon.jpg" alt="Music" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Glassmorphic Music Player Card */}
              <div 
                className={`absolute top-full right-0 mt-4 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl transition-all duration-500 origin-top-right ${isMusicPlayerOpen ? 'opacity-100 scale-100 translate-y-0 z-50' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none z-[-1]'}`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-white font-medium text-lg truncate">{currentSongIndex !== -1 && musicTracks[currentSongIndex] ? musicTracks[currentSongIndex].name : 'Select Track'}</h3>
                  <p className="text-white/60 text-xs mt-1">Bensound - Free Music</p>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6 group">
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    step="0.1"
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer outline-none overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[rgba(230,212,255,1)_0px_0px_10px_2px]"
                    style={{
                      background: `linear-gradient(to right, #E6D4FF ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-white/60 mt-2 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between">
                  <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 transition-colors ${isShuffle ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                  </button>
                  
                  <button onClick={playPrevSong} className="p-2 text-white/80 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line></svg>
                  </button>
                  
                  <button onClick={() => togglePlayPause()} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {isPlayingMusic ? 
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> : 
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    }
                  </button>
                  
                  <button onClick={playNextSong} className="p-2 text-white/80 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></line></svg>
                  </button>
                  
                  <button onClick={() => setIsRepeat(!isRepeat)} className={`p-2 transition-colors ${isRepeat ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar now acts as primary navigation alongside side cards */}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] mt-8">
            
            {/* Left Column (Main Model Viewer) */}
            <div className="lg:col-span-9 bg-[#111] rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col min-h-[500px]">
              {models.length > 0 && models[activeModelIndex] && (
                <>
                  <ModelViewer modelUrl={models[activeModelIndex].url} />
                  <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <span className="text-2xl font-light text-white drop-shadow-md">{models[activeModelIndex].name}</span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 drop-shadow-md">Active Model</p>
                  </div>
                </>
              )}
            </div>

            {/* Side Columns for Inactive Models */}
            {(() => {
              const inactive = models.map((m, i) => ({ ...m, originalIndex: i })).filter(m => m.originalIndex !== activeModelIndex);
              
              const stackGradients = [
                'from-[#E6D4FF]/10 to-transparent',
                'from-white/10 to-transparent',
                'from-[#E6D4FF]/15 to-transparent',
                'from-white/5 to-transparent'
              ];

              return (
                <div className="lg:col-span-3 relative h-full min-h-[500px] flex items-center justify-center pl-4">
                  <div className="relative w-full max-w-[280px] h-[360px]">
                    {inactive.map((model, index) => (
                      <div 
                        key={model.originalIndex}
                        className="absolute top-0 left-0 w-full transition-all duration-500 ease-in-out cursor-pointer group"
                        style={{
                          transform: `translate(${index * 12}px, ${index * 12}px) scale(${1 - index * 0.05})`,
                          zIndex: 10 - index,
                          opacity: 1 - index * 0.15
                        }}
                        onClick={() => setActiveModelIndex(model.originalIndex)}
                      >
                        <div className="bg-[#1a1a1a] rounded-3xl p-3 shadow-2xl flex flex-col border border-white/10 group-hover:border-white/30 transition-colors">
                          {/* Image/Gradient Area */}
                          <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${stackGradients[index % stackGradients.length]} relative overflow-hidden mb-4 opacity-90 group-hover:opacity-100 transition-opacity`}>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <img src="/model-card-bg.jpg" alt="Car preview" className="w-full h-full object-cover" />
                             </div>
                             
                             {/* Share button mock */}
                             <div className="absolute top-3 right-3 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-md z-10">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                             </div>
                          </div>
                          
                          {/* Info Area */}
                          <div className="flex justify-between items-center px-1 pb-1">
                            <div>
                               <h3 className="text-white font-medium text-sm leading-tight">{model.name}</h3>
                               <div className="flex items-center gap-1.5 mt-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                 <p className="text-[10px] text-gray-400">Available</p>
                               </div>
                            </div>
                            <button className="bg-white text-black px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1 hover:bg-gray-200 transition-colors">
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                               Select
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Hidden Audio Element for Music */}
      <audio 
        ref={musicAudioRef} 
        src={currentSongIndex !== -1 && musicTracks[currentSongIndex] ? musicTracks[currentSongIndex].url : undefined} 
        onEnded={handleSongEnded}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </main>
  );
}

const FRAME_COUNT = 150;

function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndex = useRef(1);
  const targetFrame = useRef(1);
  const requestRef = useRef<number>(0);
  const isReducedMotion = useRef(false);
  const isImagesLoaded = useRef(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;

    // Preload images
    let loadedCount = 0;

    const preload = () => {
      // Prevent double loading in dev mode
      if (imagesRef.current.length === FRAME_COUNT) return;

      const loadedImages: HTMLImageElement[] = [];
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new window.Image();
        const indexStr = i.toString().padStart(3, '0');
        img.src = `/frames/frame_${indexStr}.png`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 1) {
            // Render first frame as soon as it's loaded to avoid blank flash
            renderFrame(1, loadedImages);
          }
          if (loadedCount === FRAME_COUNT) {
            isImagesLoaded.current = true;
          }
        };
        loadedImages.push(img);
      }
      imagesRef.current = loadedImages;
    };

    preload();

    // Scroll listener
    const handleScroll = () => {
      // The hero section is exactly 400vh tall, so maximum scroll for the animation is 300vh
      const maxScroll = window.innerHeight * 3;
      const scrollFraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      const frame = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.floor(scrollFraction * FRAME_COUNT) + 1)
      );

      targetFrame.current = frame;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once to set initial target based on current scroll position
    handleScroll();

    // Animation loop
    const renderFrame = (index: number, imgList = imagesRef.current) => {
      if (!canvasRef.current || imgList.length === 0) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const currentImage = imgList[Math.floor(index) - 1];
      if (!currentImage || !currentImage.complete) return;

      // Handle resize / DPI
      const dpr = window.devicePixelRatio || 1;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Only resize if needed to prevent constant reallocation
      if (canvas.width !== windowWidth * dpr || canvas.height !== windowHeight * dpr) {
        canvas.width = windowWidth * dpr;
        canvas.height = windowHeight * dpr;
        canvas.style.width = `${windowWidth}px`;
        canvas.style.height = `${windowHeight}px`;
        ctx.scale(dpr, dpr);
      }

      // Draw image to cover canvas (object-fit: cover logic)
      const imgRatio = currentImage.width / currentImage.height;
      const canvasRatio = windowWidth / windowHeight;
      let drawWidth, drawHeight, x, y;

      if (canvasRatio > imgRatio) {
        drawWidth = windowWidth;
        drawHeight = windowWidth / imgRatio;
        x = 0;
        y = (windowHeight - drawHeight) / 2;
      } else {
        drawWidth = windowHeight * imgRatio;
        drawHeight = windowHeight;
        x = (windowWidth - drawWidth) / 2;
        y = 0;
      }

      // We use a dark color as background fill just in case
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, windowWidth, windowHeight);
      ctx.drawImage(currentImage, x, y, drawWidth, drawHeight);
    };

    const loop = () => {
      // Always loop, smoothly approach target
      if (isReducedMotion.current) {
        frameIndex.current = targetFrame.current;
      } else {
        // Lerp logic
        const diff = targetFrame.current - frameIndex.current;
        if (Math.abs(diff) > 0.05) {
          frameIndex.current += diff * 0.08;
        } else {
          frameIndex.current = targetFrame.current;
        }
      }

      // Only render if we have images
      if (imagesRef.current.length > 0) {
        renderFrame(frameIndex.current);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    // Start loop
    requestRef.current = requestAnimationFrame(loop);

    // Handle resize gracefully
    const handleResize = () => {
      if (imagesRef.current.length > 0) renderFrame(frameIndex.current);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-screen -z-10 bg-black pointer-events-none" />
  );
}

