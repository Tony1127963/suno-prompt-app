/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { generateSunoPrompt, recommendSettings, generateAlbumArt, VocalIntensity, AudioProduction, VocalExtras, VocalGender, StructureType, VocalDensity } from './services/gemini';
import { countSyllables } from './utils/syllableCounter';
import { Theme, THEMES } from './constants';
import { Sparkles, Copy, Check, Music, Mic2, Loader2, Mic, SlidersHorizontal, ExternalLink, ListOrdered, Settings2, Users, Wand2, Globe, AlignLeft, ChevronRight, X, Palette, Download, Hash, Search, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';

export default function App() {
  const [prompt, setPrompt] = useState(() => localStorage.getItem('suno-prompt') || '');
  const [mode, setMode] = useState<'generate' | 'refine'>(() => (localStorage.getItem('suno-mode') as 'generate' | 'refine') || 'generate');
  const [userLyrics, setUserLyrics] = useState(() => localStorage.getItem('suno-user-lyrics') || '');
  const [isInstrumental, setIsInstrumental] = useState(() => {
    const saved = localStorage.getItem('suno-is-instrumental');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [vocalIntensity, setVocalIntensity] = useState<VocalIntensity>(() => (localStorage.getItem('suno-vocal-intensity') as VocalIntensity) || 'auto');
  const [audioProduction, setAudioProduction] = useState<AudioProduction>(() => (localStorage.getItem('suno-audio-production') as AudioProduction) || 'auto');
  const [vocalExtras, setVocalExtras] = useState<VocalExtras>(() => (localStorage.getItem('suno-vocal-extras') as VocalExtras) || 'auto');
  const [vocalGender, setVocalGender] = useState<VocalGender>(() => (localStorage.getItem('suno-vocal-gender') as VocalGender) || 'auto');
  const [vocalDensity, setVocalDensity] = useState<VocalDensity>(() => (localStorage.getItem('suno-vocal-density') as VocalDensity) || 'auto');
  const [languageOverride, setLanguageOverride] = useState<string>(() => localStorage.getItem('suno-language-override') || 'auto');
  const [structureType, setStructureType] = useState<StructureType>(() => (localStorage.getItem('suno-structure-type') as StructureType) || 'auto');
  const [studioGear, setStudioGear] = useState<string>(() => localStorage.getItem('suno-studio-gear') || 'auto');
  const [isLoading, setIsLoading] = useState(false);
  const [showSyllables, setShowSyllables] = useState(true);
  const [albumArt, setAlbumArt] = useState<string | null>(() => {
    const saved = localStorage.getItem('suno-album-art');
    return saved ? saved : null;
  });
  const [shouldGenerateAlbumArt, setShouldGenerateAlbumArt] = useState(() => {
    const saved = localStorage.getItem('suno-should-generate-art');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; styleBox: string; lyricsBox: string } | null>(() => {
    const saved = localStorage.getItem('suno-result');
    return saved ? JSON.parse(saved) : null;
  });
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(() => {
    const saved = localStorage.getItem('suno-auto-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [loadingStep, setLoadingStep] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [appliedSettings, setAppliedSettings] = useState<{
    vocalIntensity?: string;
    audioProduction?: string;
    vocalExtras?: string;
    vocalGender?: string;
    vocalDensity?: string;
    language?: string;
    structureType?: string;
    studioGear?: string;
    isInstrumental?: boolean;
  } | null>(null);
  const [history, setHistory] = useState<{ id: string; timestamp: number; prompt: string; mode: 'generate' | 'refine'; userLyrics?: string; albumArt?: string | null; result: { title: string; styleBox: string; lyricsBox: string } }[]>(() => {
    const saved = localStorage.getItem('suno-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('suno-theme');
    const defaultTheme = THEMES[0];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all new properties exist
        return { ...defaultTheme, ...parsed };
      } catch (e) {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });
  const dragControls = useDragControls();

  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterMode, setHistoryFilterMode] = useState<'all' | 'generate' | 'refine'>('all');
  const [historySortOrder, setHistorySortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        const searchLower = historySearch.toLowerCase();
        const matchesSearch = 
          item.prompt.toLowerCase().includes(searchLower) || 
          item.result.title.toLowerCase().includes(searchLower) ||
          (item.userLyrics && item.userLyrics.toLowerCase().includes(searchLower));
        const matchesMode = historyFilterMode === 'all' || item.mode === historyFilterMode;
        return matchesSearch && matchesMode;
      })
      .sort((a, b) => {
        return historySortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
      });
  }, [history, historySearch, historyFilterMode, historySortOrder]);

  useEffect(() => {
    localStorage.setItem('suno-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('suno-vocal-intensity', vocalIntensity);
      localStorage.setItem('suno-audio-production', audioProduction);
      localStorage.setItem('suno-vocal-extras', vocalExtras);
      localStorage.setItem('suno-vocal-gender', vocalGender);
      localStorage.setItem('suno-vocal-density', vocalDensity);
      localStorage.setItem('suno-language-override', languageOverride);
      localStorage.setItem('suno-structure-type', structureType);
      localStorage.setItem('suno-studio-gear', studioGear);
      localStorage.setItem('suno-auto-mode', JSON.stringify(isAutoMode));
      localStorage.setItem('suno-is-instrumental', JSON.stringify(isInstrumental));
      localStorage.setItem('suno-prompt', prompt);
      localStorage.setItem('suno-mode', mode);
      localStorage.setItem('suno-user-lyrics', userLyrics);
      localStorage.setItem('suno-history', JSON.stringify(history));
      localStorage.setItem('suno-should-generate-art', JSON.stringify(shouldGenerateAlbumArt));
      if (result) {
        localStorage.setItem('suno-result', JSON.stringify(result));
      } else {
        localStorage.removeItem('suno-result');
      }
      if (albumArt) {
        localStorage.setItem('suno-album-art', albumArt);
      } else {
        localStorage.removeItem('suno-album-art');
      }
    } catch (e) {
      console.warn('Failed to save to localStorage, possibly quota exceeded:', e);
      // If quota exceeded, try to save history without album art to save space
      try {
        const historyWithoutArt = history.map(h => ({ ...h, albumArt: null }));
        localStorage.setItem('suno-history', JSON.stringify(historyWithoutArt));
      } catch (e2) {
        console.error('Still failed to save history:', e2);
      }
    }
  }, [vocalIntensity, audioProduction, vocalExtras, vocalGender, vocalDensity, languageOverride, structureType, studioGear, isAutoMode, isInstrumental, prompt, result, mode, userLyrics, history, albumArt, shouldGenerateAlbumArt]);

  useEffect(() => {
    if (isSettingsOpen || isThemeOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSettingsOpen, isThemeOpen]);

  const resetToAuto = () => {
    setVocalIntensity('auto');
    setAudioProduction('auto');
    setVocalExtras('auto');
    setVocalGender('auto');
    setVocalDensity('auto');
    setLanguageOverride('auto');
    setStructureType('auto');
    setStudioGear('auto');
    setIsInstrumental(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (mode === 'refine' && !userLyrics.trim()) {
      setError("Pro vylepšení textu musíte zadat původní text.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      let finalVocal = vocalIntensity;
      let finalProd = audioProduction;
      let finalExtras = vocalExtras;
      let finalGender = vocalGender;
      let finalDensity = vocalDensity;
      let finalInstrumental = isInstrumental;
      let finalLanguage = languageOverride;
      let finalStructure: StructureType = structureType;
      let finalGear = studioGear;

      if (isAutoMode) {
        setLoadingStep('Analyzuji interpreta a styl (včetně jazyka a struktury)...');
        const rec = await recommendSettings(prompt);
        if (vocalIntensity === 'auto' && rec.vocalIntensity) { finalVocal = rec.vocalIntensity; }
        if (audioProduction === 'auto' && rec.audioProduction) { finalProd = rec.audioProduction; }
        if (vocalExtras === 'auto' && rec.vocalExtras) { finalExtras = rec.vocalExtras; }
        if (vocalGender === 'auto' && rec.vocalGender) { finalGender = rec.vocalGender; }
        if (vocalDensity === 'auto' && rec.vocalDensity) { finalDensity = rec.vocalDensity; }
        
        // We no longer override finalInstrumental here because it's a direct user toggle in the UI.
        // Overriding it causes the user's explicit choice to be ignored if the AI guesses wrong.
        
        if (languageOverride === 'auto' && rec.language) { finalLanguage = rec.language; }
        if (structureType === 'auto' && rec.structureType) { finalStructure = rec.structureType; }
        if (studioGear === 'auto' && rec.studioGear) { finalGear = rec.studioGear; }
      }

      setLoadingStep(mode === 'generate' ? 'Generuji profesionální prompt...' : 'Vylepšuji váš text...');
      const res = await generateSunoPrompt(
        mode === 'refine' ? `${prompt}\n\nORIGINÁLNÍ TEXT K VYLEPŠENÍ:\n${userLyrics}` : prompt,
        finalInstrumental,
        finalVocal,
        finalProd,
        finalExtras,
        finalGender,
        finalLanguage,
        finalStructure,
        finalDensity,
        finalGear,
        mode
      );
      setResult(res);
      setAppliedSettings({
        vocalIntensity: finalVocal,
        audioProduction: finalProd,
        vocalExtras: finalExtras,
        vocalGender: finalGender,
        vocalDensity: finalDensity,
        language: finalLanguage,
        structureType: finalStructure,
        studioGear: finalGear,
        isInstrumental: finalInstrumental
      });
      
      setLoadingStep('Generuji obal alba...');
      let art = null;
      if (shouldGenerateAlbumArt) {
        try {
          art = await generateAlbumArt(res.title, res.styleBox);
        } catch (artError: any) {
          console.error("Failed to generate album art:", artError);
          setError(`Píseň byla vygenerována, ale obal alba selhal: ${artError.message}`);
        }
      }
      setAlbumArt(art);
      
      // Add to history
      const historyItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        prompt,
        mode,
        userLyrics: mode === 'refine' ? userLyrics : undefined,
        albumArt: art,
        result: res
      };
      setHistory(prev => {
        const newHistory = [historyItem, ...prev].slice(0, 50);
        // Only keep albumArt for the 3 most recent items to save localStorage space
        return newHistory.map((item, index) => 
          index < 3 ? item : { ...item, albumArt: null }
        );
      });
    } catch (err: any) {
      console.error("Failed to generate prompt:", err);
      setError(err.message || "Nepodařilo se vygenerovat prompt. Zkuste to prosím znovu.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const copyToClipboard = async (text: string, type: 'title' | 'style' | 'lyrics' | 'all') => {
    await navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else if (type === 'style') {
      setCopiedStyle(true);
      setTimeout(() => setCopiedStyle(false), 2000);
    } else if (type === 'lyrics') {
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    } else if (type === 'all') {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen theme-bg text-zinc-50 ${theme.fontFamily === 'mono' ? 'font-mono' : 'font-sans'} selection:bg-white/20 relative transition-colors duration-500`}>
      <style>{`
        :root {
          --primary: ${theme.primary};
          --secondary: ${theme.secondary};
          --bg: ${theme.background};
          --glass-color: ${theme.glassColor || '#18181b'};
          --glass: color-mix(in srgb, var(--glass-color), transparent ${Math.round((1 - theme.glassOpacity) * 100)}%);
          --blur: blur(${theme.blur}px);
          --radius: ${theme.radius}rem;
          --glow: ${theme.glow};
          --panel-bg: rgba(255, 255, 255, ${theme.panelOpacity});
          --panel-blur: blur(${theme.panelBlur}px);
          --border-opacity: ${theme.borderOpacity};
          --shadow-opacity: ${theme.shadowIntensity * 0.4};
          --shadow-size: ${theme.shadowIntensity * 30}px;
        }
        .theme-bg { background-color: var(--bg); }
        .theme-primary-text { color: var(--primary); }
        .theme-primary-bg { background-color: var(--primary); }
        .theme-glass { 
          background-color: var(--glass); 
          backdrop-filter: var(--blur); 
          -webkit-backdrop-filter: var(--blur);
          border-radius: var(--radius); 
          border: 1px solid rgba(255, 255, 255, var(--border-opacity));
          box-shadow: 0 var(--shadow-size) calc(var(--shadow-size) * 1.5) 0 rgba(0, 0, 0, var(--shadow-opacity));
          will-change: backdrop-filter;
        }
        .theme-glass-inner {
          border-radius: calc(var(--radius) * 0.75);
          background-color: var(--panel-bg);
          backdrop-filter: var(--panel-blur);
          -webkit-backdrop-filter: var(--panel-blur);
          border: 1px solid rgba(255, 255, 255, var(--border-opacity));
        }
        .theme-glow-1 {
          background-color: var(--primary);
          opacity: var(--glow);
        }
        .theme-glow-2 {
          background-color: var(--secondary);
          opacity: var(--glow);
        }
      `}</style>

      {/* Atmospheric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: result ? '-60%' : '-50%',
            y: result ? '-60%' : '-50%',
            scale: result ? 1.2 : 1
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 100 }}
          className="absolute top-0 left-1/2 w-[800px] h-[600px] theme-glow-1 blur-[120px] rounded-full will-change-transform transform-gpu" 
        />
        <motion.div 
          animate={{
            x: result ? '20%' : '33%',
            y: result ? '20%' : '33%',
            scale: result ? 1.1 : 1
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 100 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] theme-glow-2 blur-[120px] rounded-full will-change-transform transform-gpu" 
        />
      </div>
      
      <motion.div 
        layout
        className={`max-w-4xl mx-auto px-2 md:px-4 relative z-10 flex flex-col ${!result ? 'min-h-[92dvh] justify-center py-4' : 'min-h-screen py-4 md:py-12'}`}
      >
        <div className="absolute top-2 right-2 md:top-8 md:right-8 flex gap-2 z-50">
          <button 
            onClick={() => setIsHistoryOpen(true)} 
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
            title="Historie"
          >
            <ListOrdered className="w-5 h-5 text-zinc-400 group-hover:text-white transition-all duration-300" />
          </button>
          <button 
            onClick={() => setIsThemeOpen(true)} 
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
            title="Vzhled a Motivy"
          >
            <Palette className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:rotate-12 transition-all duration-300" />
          </button>
        </div>

        <motion.header 
          layout
          className={`text-center ${!result ? 'mb-6 md:mb-12' : 'mb-4 md:mb-8 pt-4 md:pt-0'}`}
        >
          <div className="inline-flex items-center justify-center p-2.5 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] rounded-2xl mb-3 ring-1 ring-[color-mix(in_srgb,var(--primary)_20%,transparent)] shadow-lg shadow-[color-mix(in_srgb,var(--primary)_10%,transparent)] transition-colors duration-500">
            <Music className="w-6 h-6 theme-primary-text transition-colors duration-500" />
          </div>
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight mb-1 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
            Suno Prompt Engineer
          </h1>
          <p className="text-zinc-500 text-sm md:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
            Transform your ideas into technical Suno v5.5 prompts.
          </p>
        </motion.header>

        <motion.main 
          layout
          className={`space-y-4 md:space-y-8 ${!result ? 'max-w-2xl mx-auto w-full' : ''}`}
        >
          <div className="theme-glass border border-white/5 p-5 md:p-8 shadow-2xl transition-colors duration-500 rounded-[2.5rem] md:rounded-[var(--radius)]">
            <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
              <motion.div 
                className="ios-segmented flex-1 relative bg-black/20 p-1.5 rounded-2xl flex touch-pan-y select-none"
                onPanEnd={(e, info) => {
                  const threshold = 20;
                  if (info.offset.x > threshold && !isInstrumental) {
                    setIsInstrumental(true);
                  } else if (info.offset.x < -threshold && isInstrumental) {
                    setIsInstrumental(false);
                  }
                }}
              >
                <button
                  onClick={() => setIsInstrumental(false)}
                  className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold min-h-[44px] ios-segmented-item ${!isInstrumental ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {!isInstrumental && (
                    <motion.div 
                      layoutId="segmented-active" 
                      className="ios-segmented-active will-change-transform transform-gpu"
                      transition={{ type: 'spring', bounce: 0.15, stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Mic className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Se zpěvem</span>
                </button>
                <button
                  onClick={() => setIsInstrumental(true)}
                  className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold min-h-[44px] ios-segmented-item ${isInstrumental ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {isInstrumental && (
                    <motion.div 
                      layoutId="segmented-active" 
                      className="ios-segmented-active will-change-transform transform-gpu"
                      transition={{ type: 'spring', bounce: 0.15, stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Music className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Instrumental</span>
                </button>
              </motion.div>

              <motion.div 
                className="ios-segmented flex-1 relative bg-black/20 p-1.5 rounded-2xl flex touch-pan-y select-none"
                onPanEnd={(e, info) => {
                  const threshold = 20;
                  if (info.offset.x > threshold && mode === 'generate') {
                    setMode('refine');
                  } else if (info.offset.x < -threshold && mode === 'refine') {
                    setMode('generate');
                  }
                }}
              >
                <button
                  onClick={() => setMode('generate')}
                  className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold min-h-[44px] ios-segmented-item ${mode === 'generate' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {mode === 'generate' && (
                    <motion.div 
                      layoutId="mode-segmented-active" 
                      className="ios-segmented-active will-change-transform transform-gpu"
                      transition={{ type: 'spring', bounce: 0.15, stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Wand2 className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Generovat</span>
                </button>
                <button
                  onClick={() => setMode('refine')}
                  className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold min-h-[44px] ios-segmented-item ${mode === 'refine' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {mode === 'refine' && (
                    <motion.div 
                      layoutId="mode-segmented-active" 
                      className="ios-segmented-active will-change-transform transform-gpu"
                      transition={{ type: 'spring', bounce: 0.15, stiffness: 400, damping: 30 }}
                    />
                  )}
                  <AlignLeft className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Vylepšit</span>
                </button>
              </motion.div>
            </div>

            <AnimatePresence>
              {mode === 'refine' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="userLyrics" className="block text-[15px] font-medium text-zinc-400 mb-3 flex items-center gap-2 px-1">
                    <AlignLeft className="w-4 h-4 theme-primary-text transition-colors duration-500" />
                    Vložte svůj text k vylepšení
                  </label>
                  <textarea
                    id="userLyrics"
                    value={userLyrics}
                    onChange={(e) => setUserLyrics(e.target.value)}
                    placeholder="Vložte sem své texty, které chcete vylepšit o Suno v5.5 tagy..."
                    className="w-full h-48 bg-black/30 border border-white/10 theme-glass-inner p-5 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)] focus:border-[color-mix(in_srgb,var(--primary)_50%,transparent)] transition-colors duration-500 resize-none text-[17px] shadow-inner leading-relaxed"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <label htmlFor="prompt" className="block text-[15px] font-medium text-zinc-400 mb-3 flex items-center gap-2 px-1">
              <Mic2 className="w-4 h-4 theme-primary-text transition-colors duration-500" />
              {mode === 'generate' ? 'Popište svou představu o písničce' : 'Popište styl a náladu vylepšení'}
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isInstrumental ? "např. Epický orchestrální soundtrack pro sci-fi bitvu..." : "např. Písnička ve stylu Queen o pečení dortu..."}
              className="w-full h-32 md:h-40 bg-black/30 border border-white/10 theme-glass-inner p-5 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_50%,transparent)] focus:border-[color-mix(in_srgb,var(--primary)_50%,transparent)] transition-colors duration-500 resize-none text-[17px] shadow-inner leading-relaxed"
            />
            
            <div className="mt-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.04] transition-colors duration-300 active:bg-white/[0.08] min-h-[56px]"
                onClick={() => setIsAutoMode(!isAutoMode)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-colors duration-500 ${isAutoMode ? 'bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] theme-primary-text' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-medium text-zinc-100 tracking-tight">Auto režim</h3>
                    <p className="text-[13px] text-zinc-500">AI sama nastaví vše potřebné</p>
                  </div>
                </div>
                <motion.button
                  layout
                  role="switch"
                  aria-checked={isAutoMode}
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-300 focus:outline-none ${isAutoMode ? 'theme-primary-bg' : 'bg-zinc-700'}`}
                >
                  <motion.span 
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`inline-block h-[27px] w-[27px] rounded-full bg-white shadow-sm ${isAutoMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} 
                  />
                </motion.button>
              </div>

              <div className="h-[1px] bg-white/[0.05] ml-16" />

              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.04] transition-colors duration-300 active:bg-white/[0.08] min-h-[56px]"
                onClick={() => setIsSettingsOpen(true)}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 bg-zinc-800 rounded-xl text-zinc-400 transition-colors duration-500"
                  >
                    <Settings2 className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-[17px] font-medium text-zinc-100 tracking-tight">Pokročilé nastavení</h3>
                    <p className="text-[13px] text-zinc-500">Jazyk, zpěvák, styl mixu...</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-end gap-4">
              {error && (
                <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-[15px]">
                  {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`w-full inline-flex items-center justify-center theme-primary-bg text-white px-4 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed active:scale-[0.98] active:opacity-80 shadow-lg shadow-[color-mix(in_srgb,var(--primary)_30%,transparent)] h-[60px] relative overflow-hidden group ${!isLoading && !prompt.trim() ? 'opacity-40' : ''}`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                
                {/* Shimmer Effect during loading */}
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
                
                {isLoading ? (
                  <div className="relative z-10 flex items-center justify-center gap-3 w-full">
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    <span className="text-[14px] leading-tight font-medium text-center whitespace-normal line-clamp-2 drop-shadow-md">
                      {loadingStep || 'Pracuji...'}
                    </span>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <span className="text-[17px] font-semibold tracking-tight">
                      Vygenerovat Prompt
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.98 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      type: 'spring',
                      damping: 25,
                      stiffness: 200,
                      staggerChildren: 0.1
                    }
                  },
                  exit: { opacity: 0, y: -20, scale: 0.98 }
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid gap-6 md:grid-cols-12 will-change-transform transform-gpu"
              >
                {/* AI Choices Summary */}
                {appliedSettings && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="md:col-span-12 p-4 rounded-2xl backdrop-blur-xl shadow-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} ${theme.aiPanelOpacity * 100}%, transparent)`,
                      borderColor: `color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`,
                      borderWidth: '1px',
                      boxShadow: `0 10px 15px -3px color-mix(in srgb, ${theme.aiPanelColor} 5%, transparent)`
                    }}
                  >
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: theme.aiPanelColor }}>
                      <Sparkles className="w-4 h-4" />
                      AI pro tento song zvolila:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {appliedSettings.vocalIntensity && appliedSettings.vocalIntensity !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Zpěv:</span> 
                          <span className="font-medium">{appliedSettings.vocalIntensity}</span>
                        </span>
                      )}
                      {appliedSettings.vocalGender && appliedSettings.vocalGender !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Hlas:</span> 
                          <span className="font-medium">{appliedSettings.vocalGender}</span>
                        </span>
                      )}
                      {appliedSettings.vocalExtras && appliedSettings.vocalExtras !== 'auto' && appliedSettings.vocalExtras !== 'none' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Efekty zpěvu:</span> 
                          <span className="font-medium">{appliedSettings.vocalExtras}</span>
                        </span>
                      )}
                      {appliedSettings.vocalDensity && appliedSettings.vocalDensity !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Množství zpěvu:</span> 
                          <span className="font-medium">{appliedSettings.vocalDensity}</span>
                        </span>
                      )}
                      {appliedSettings.language && appliedSettings.language !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Jazyk:</span> 
                          <span className="font-medium">{appliedSettings.language}</span>
                        </span>
                      )}
                      {appliedSettings.audioProduction && appliedSettings.audioProduction !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Produkce:</span> 
                          <span className="font-medium">{appliedSettings.audioProduction}</span>
                        </span>
                      )}
                      {appliedSettings.structureType && appliedSettings.structureType !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Struktura:</span> 
                          <span className="font-medium">{appliedSettings.structureType}</span>
                        </span>
                      )}
                      {appliedSettings.studioGear && appliedSettings.studioGear !== 'auto' && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="mr-1" style={{ color: `color-mix(in srgb, ${theme.aiPanelColor} 70%, transparent)` }}>Vybavení:</span> 
                          <span className="font-medium">{appliedSettings.studioGear}</span>
                        </span>
                      )}
                      {appliedSettings.isInstrumental && (
                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ backgroundColor: `color-mix(in srgb, ${theme.aiPanelColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${theme.aiPanelColor} 20%, transparent)`, color: `color-mix(in srgb, ${theme.aiPanelColor} 80%, white)` }}>
                          <span className="font-medium">Instrumentální</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Title Box */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="md:col-span-12 theme-glass border border-white/5 p-4 md:p-6 shadow-2xl transition-colors duration-500 flex items-center justify-between rounded-2xl backdrop-blur-xl"
                >
                  <div>
                    <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-0.5">Song Title</h3>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{result.title}</h2>
                  </div>
                  <motion.button
                    onClick={() => copyToClipboard(result.title, 'title')}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 hover:bg-white/10 theme-glass-inner transition-colors text-zinc-400 hover:text-zinc-100 bg-black/20 border border-white/5 rounded-xl relative overflow-hidden"
                    title="Copy Title"
                  >
                    <AnimatePresence mode="wait">
                      {copiedTitle ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                          className="transform-gpu will-change-transform"
                        >
                          <Check className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="transform-gpu will-change-transform"
                        >
                          <Copy className="w-5 h-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

                {/* Style Box */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="md:col-span-4 space-y-6"
                >
                  {albumArt && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="theme-glass border border-white/5 p-2 shadow-2xl rounded-2xl overflow-hidden group relative aspect-square"
                    >
                      <img 
                        src={albumArt} 
                        alt="Album Art" 
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = albumArt;
                            link.download = `${result.title}.png`;
                            link.click();
                          }}
                          className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-6 h-6 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="theme-glass border border-white/5 p-4 md:p-6 shadow-2xl transition-all duration-500 h-fit rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Style of Music</h3>
                      <motion.button
                        onClick={() => copyToClipboard(result.styleBox, 'style')}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100 relative"
                        title="Copy Style"
                      >
                        <AnimatePresence mode="wait">
                          {copiedStyle ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 1.5, opacity: 0 }}
                              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                              className="transform-gpu will-change-transform"
                            >
                              <Check className="w-4 h-4 text-emerald-400" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                              className="transform-gpu will-change-transform"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                    <div className="bg-zinc-950/50 border border-white/5 theme-glass-inner p-3 md:p-4 transition-all duration-500 rounded-xl">
                      <p className="text-zinc-200 font-mono text-[13px] md:text-sm leading-relaxed">
                        {result.styleBox}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Max 1000 chars</span>
                      <span className={result.styleBox.length > 1000 ? 'text-red-400' : 'text-emerald-400'}>
                        {result.styleBox.length}/1000
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Lyrics Box */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="md:col-span-8 theme-glass border border-white/5 p-4 md:p-6 shadow-2xl transition-all duration-500 rounded-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Lyrics</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowSyllables(!showSyllables)}
                        className={`p-1.5 rounded-lg transition-colors ${showSyllables ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-800 text-zinc-400'}`}
                        title={showSyllables ? "Hide Syllables" : "Show Syllables"}
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(result.lyricsBox, 'lyrics')}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100 relative"
                        title="Copy Lyrics"
                      >
                      <AnimatePresence mode="wait">
                        {copiedLyrics ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                            className="transform-gpu will-change-transform"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="transform-gpu will-change-transform"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-950/50 border border-white/5 theme-glass-inner p-4 md:p-6 overflow-x-auto transition-all duration-500 rounded-xl">
                    <div className="space-y-1">
                      {result.lyricsBox.split('\n').map((line, idx) => {
                        const isTag = line.trim().startsWith('[') && line.trim().endsWith(']');
                        const syllableCount = isTag ? 0 : countSyllables(line);
                        
                        return (
                          <div key={idx} className="flex items-center gap-4 group/line">
                            <pre className={`flex-1 font-mono text-[13px] md:text-sm leading-relaxed whitespace-pre-wrap ${isTag ? 'text-zinc-500 italic' : 'text-zinc-200'}`}>
                              {line || ' '}
                            </pre>
                            {showSyllables && !isTag && line.trim() && (
                              <div className="flex flex-col items-end gap-0.5 opacity-0 group-hover/line:opacity-100 transition-opacity">
                                <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded">
                                  {syllableCount}
                                </span>
                                <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${syllableCount > 12 ? 'bg-amber-500/50' : 'bg-emerald-500/50'}`}
                                    style={{ width: `${Math.min(100, (syllableCount / 16) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="md:col-span-12 flex flex-col sm:flex-row gap-3 mt-1"
                >
                  <button
                    onClick={() => copyToClipboard(`TITLE:\n${result.title}\n\nSTYLE:\n${result.styleBox}\n\nLYRICS:\n${result.lyricsBox}`, 'all')}
                    className="flex-1 py-3.5 px-6 theme-glass-inner flex items-center justify-center gap-2 transition-all duration-500 font-medium bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/5 shadow-lg backdrop-blur-sm rounded-2xl text-[15px] active:scale-[0.98]"
                  >
                    <AnimatePresence mode="wait">
                      {copiedAll ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                          className="flex items-center gap-2 transform-gpu will-change-transform"
                        >
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span>Zkopírováno!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-2 transform-gpu will-change-transform"
                        >
                          <ListOrdered className="w-5 h-5" />
                          <span>Kopírovat vše</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  <a
                    href="https://suno.com/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-6 theme-glass-inner flex items-center justify-center gap-2 transition-all duration-500 font-medium theme-primary-bg text-white hover:brightness-110 shadow-lg shadow-[color-mix(in_srgb,var(--primary)_20%,transparent)] backdrop-blur-sm rounded-2xl text-[15px] active:scale-[0.98]"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Otevřít Suno
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </motion.div>
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 will-change-opacity"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#1c1c1e] border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-bottom border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ListOrdered className="w-6 h-6 theme-primary-text" />
                  <h2 className="text-xl font-bold text-white tracking-tight">Historie</h2>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)} 
                  className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="px-4 pb-4 space-y-3 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Hledat v historii..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <select
                      value={historyFilterMode}
                      onChange={(e) => setHistoryFilterMode(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                    >
                      <option value="all">Všechny režimy</option>
                      <option value="generate">Generování</option>
                      <option value="refine">Vylepšení</option>
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <select
                      value={historySortOrder}
                      onChange={(e) => setHistorySortOrder(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                    >
                      <option value="newest">Od nejnovějších</option>
                      <option value="oldest">Od nejstarších</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 opacity-50">
                    <Search className="w-12 h-12" />
                    <p>{history.length === 0 ? 'Zatím žádná historie' : 'Žádné výsledky hledání'}</p>
                  </div>
                ) : (
                  filteredHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 hover:bg-white/[0.08] transition-colors group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.mode === 'generate' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              {item.mode === 'generate' ? 'Generování' : 'Vylepšení'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(item.timestamp).toLocaleString('cs-CZ')}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-200 line-clamp-1">{item.result.title}</h3>
                        </div>
                        <button 
                          onClick={() => {
                            setHistory(prev => prev.filter(h => h.id !== item.id));
                          }}
                          className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 italic">"{item.prompt}"</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setResult(item.result);
                            setPrompt(item.prompt);
                            setMode(item.mode);
                            setAlbumArt(item.albumArt || null);
                            if (item.userLyrics) {
                              setUserLyrics(item.userLyrics);
                            }
                            setIsHistoryOpen(false);
                          }}
                          className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all active:scale-95"
                        >
                          Použít znovu
                        </button>
                        <button
                          onClick={() => {
                            copyToClipboard(`TITLE:\n${item.result.title}\n\nSTYLE:\n${item.result.styleBox}\n\nLYRICS:\n${item.result.lyricsBox}`, 'all');
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all active:scale-95"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {history.length > 0 && (
                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      if (confirm('Opravdu chcete smazat celou historii?')) {
                        setHistory([]);
                      }
                    }}
                    className="w-full py-3 text-zinc-500 hover:text-red-400 text-sm font-medium transition-colors"
                  >
                    Smazat vše
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 will-change-opacity"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ 
                type: 'spring',
                damping: 30,
                stiffness: 300,
                mass: 0.8,
                restDelta: 0.001
              }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.05}
              onDragEnd={(e, info) => {
                if (info.offset.y > 60 || info.velocity.y > 300) setIsSettingsOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-full sm:max-w-lg bg-[#1c1c1e] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] z-50 flex flex-col shadow-2xl will-change-transform transform-gpu"
              style={{ 
                maxHeight: '92vh'
              }}
            >
              <div 
                className="pt-3 pb-3 px-4 flex flex-col items-center shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-[6px] bg-white/30 rounded-full mb-3" />
                <div className="w-full flex justify-between items-center px-2">
                  <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Pokročilé nastavení</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={resetToAuto}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md transition-colors"
                    >
                      Resetovat na Auto
                    </button>
                    <button 
                      onClick={() => setIsSettingsOpen(false)} 
                      className="p-1.5 bg-white/10 rounded-full text-zinc-400 hover:text-white active:scale-90 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div 
                className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+2.5rem)] touch-pan-y"
              >
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md divide-y divide-white/10">
                  
                  {/* Album Art Toggle */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 theme-primary-text" />
                      <span className="text-base text-zinc-100 tracking-tight">Generovat obal alba</span>
                    </div>
                    <button
                      onClick={() => setShouldGenerateAlbumArt(!shouldGenerateAlbumArt)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        shouldGenerateAlbumArt ? 'bg-[var(--primary)]' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          shouldGenerateAlbumArt ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language */}
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-3 mb-0">
                      <Globe className="w-5 h-5 theme-primary-text" />
                      <span className="text-base text-zinc-100 tracking-tight">Jazyk textu</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                      {[
                        { value: 'auto', label: 'Auto' },
                        { value: 'Czech', label: 'CZ' },
                        { value: 'Slovak', label: 'SK' },
                        { value: 'English', label: 'EN' },
                        { value: 'German', label: 'DE' },
                        { value: 'Spanish', label: 'ES' },
                        { value: 'French', label: 'FR' },
                        { value: 'Italian', label: 'IT' },
                        { value: 'Japanese', label: 'JP' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setLanguageOverride(option.value)}
                          className={`flex-1 min-w-[48px] py-1.5 px-1 rounded-lg text-[12px] font-bold transition-all min-h-[34px] uppercase ${
                            languageOverride === option.value
                              ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                              : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Structure */}
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-3 mb-0">
                      <ListOrdered className="w-5 h-5 theme-primary-text" />
                      <span className="text-base text-zinc-100 tracking-tight">Struktura písně</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                      {[
                        { value: 'auto', label: 'Auto' },
                        { value: 'standard', label: 'Pop/Rock' },
                        { value: 'edm', label: 'EDM' },
                        { value: 'rap', label: 'Rap' },
                        { value: 'classical', label: 'Klasika' },
                        { value: 'ambient', label: 'Ambient' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setStructureType(option.value as StructureType)}
                          className={`py-1.5 px-2 rounded-lg text-[13px] font-medium transition-all min-h-[36px] ${
                            structureType === option.value
                              ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                              : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mastering */}
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-3 mb-0">
                      <Settings2 className="w-5 h-5 theme-primary-text" />
                      <span className="text-base text-zinc-100 tracking-tight">Kvalita zvuku</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                      {[
                        { value: 'auto', label: 'Auto' },
                        { value: 'standard', label: 'Standard' },
                        { value: 'studio', label: 'Studio' },
                        { value: 'cinematic', label: 'Film' },
                        { value: 'live', label: 'Live' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAudioProduction(option.value as AudioProduction)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[13px] font-medium transition-all min-h-[36px] ${
                            audioProduction === option.value
                              ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                              : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Studio Rack */}
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-3 mb-0">
                      <Palette className="w-5 h-5 theme-primary-text" />
                      <span className="text-base text-zinc-100 tracking-tight">Studio Rack (Gear)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'Shure 520DX Green Bullet, Distorted Harmonica Mic', label: 'Green Bullet' },
                          { value: 'Fender Stratocaster, Vintage Tube Amp', label: 'Strat' },
                          { value: 'Gibson Les Paul, Marshall Stack', label: 'Les Paul' },
                          { value: 'Moog Sub 37, Analog Filter', label: 'Moog' },
                          { value: 'Vintage Ludwig Drums, Ribbon Mics', label: 'Vintage Drums' },
                          { value: '808 Drum Machine, Roland Juno-106', label: '80s Synth' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setStudioGear(option.value)}
                            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all min-h-[34px] uppercase ${
                              studioGear === option.value
                                ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={studioGear === 'auto' ? '' : studioGear}
                        onChange={(e) => setStudioGear(e.target.value || 'auto')}
                        placeholder="Vlastní vybavení (např. Yamaha DX7, Neve Console)..."
                        className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                      />
                    </div>
                  </div>

                  {!isInstrumental && (
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-3 mb-0">
                        <Users className="w-5 h-5 theme-primary-text" />
                        <span className="text-base text-zinc-100 tracking-tight">Vokální efekty</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'none', label: 'Nic' },
                          { value: 'choir', label: 'Sbor' },
                          { value: 'harmonies', label: 'Dvojhlas' },
                          { value: 'intimate', label: 'Blízko' },
                          { value: 'vocoder', label: 'Vocoder' },
                          { value: 'autotune', label: 'Tune' },
                          { value: 'megaphone', label: 'Mega' },
                          { value: 'humanized', label: 'Lidský' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setVocalExtras(option.value as VocalExtras)}
                            className={`py-1.5 px-2 rounded-lg text-[12px] font-medium transition-all min-h-[34px] ${
                              vocalExtras === option.value
                                ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!isInstrumental && (
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md divide-y divide-white/10">
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-3 mb-0">
                        <Users className="w-5 h-5 theme-primary-text" />
                        <span className="text-base text-zinc-100 tracking-tight">Kdo má zpívat?</span>
                      </div>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'male', label: 'Muž' },
                          { value: 'female', label: 'Žena' },
                          { value: 'both', label: 'Duet' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setVocalGender(option.value as VocalGender)}
                            className={`flex-1 py-1 px-2 rounded-lg text-sm font-medium transition-all min-h-[34px] ${
                              vocalGender === option.value
                                ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-3 mb-0">
                        <SlidersHorizontal className="w-5 h-5 theme-primary-text" />
                        <span className="text-base text-zinc-100 tracking-tight">Síla zpěvu</span>
                      </div>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'soft', label: 'Jemný' },
                          { value: 'normal', label: 'Běžný' },
                          { value: 'powerful', label: 'Silný' },
                          { value: 'operatic', label: 'Operní' },
                          { value: 'dynamic', label: 'Dynamický' },
                          { value: 'aggressive', label: 'Řev' },
                          { value: 'shouting_mc', label: 'MC Shouting' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setVocalIntensity(option.value as VocalIntensity)}
                            className={`flex-1 sm:min-w-[calc(33%-4px)] py-1 px-2 rounded-lg text-sm font-medium transition-all min-h-[34px] ${
                              vocalIntensity === option.value
                                ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-3 mb-0">
                        <AlignLeft className="w-5 h-5 theme-primary-text" />
                        <span className="text-base text-zinc-100 tracking-tight">Množství zpěvu</span>
                      </div>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                        {[
                          { value: 'auto', label: 'Auto' },
                          { value: 'dense', label: 'Hodně textu' },
                          { value: 'sparse', label: 'Málo textu' },
                          { value: 'chops', label: 'Útržky' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setVocalDensity(option.value as VocalDensity)}
                            className={`flex-1 sm:min-w-[calc(50%-4px)] py-1 px-2 rounded-lg text-sm font-medium transition-all min-h-[34px] ${
                              vocalDensity === option.value
                                ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <motion.button
                  onClick={() => setIsSettingsOpen(false)}
                  whileTap={{ scale: 0.95 }}
                  className="w-full theme-primary-bg hover:brightness-110 text-white font-semibold py-3 theme-glass-inner mt-4 transition-all duration-300 min-h-[48px] text-[17px] shadow-xl shadow-[color-mix(in_srgb,var(--primary)_20%,transparent)] rounded-xl"
                >
                  Hotovo
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThemeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsThemeOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 will-change-opacity"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ 
                type: 'spring',
                damping: 30,
                stiffness: 300,
                mass: 0.8,
                restDelta: 0.001
              }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.05}
              onDragEnd={(e, info) => {
                if (info.offset.y > 60 || info.velocity.y > 300) setIsThemeOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-full sm:max-w-lg bg-[#1c1c1e] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] z-50 flex flex-col shadow-2xl overflow-hidden will-change-transform transform-gpu"
              style={{ 
                maxHeight: '92vh'
              }}
            >
              <div 
                className="pt-2 pb-1 px-3 flex flex-col items-center shrink-0 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-9 h-[5px] bg-white/30 rounded-full mb-2" />
                <div className="w-full flex justify-between items-center px-2">
                  <h2 className="text-base font-bold text-white tracking-tight">Vzhled a Motivy</h2>
                  <button 
                    onClick={() => setIsThemeOpen(false)} 
                    className="p-1 bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 space-y-5 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+2rem)] touch-pan-y">
                {/* Presets */}
                <div>
                  <label className="block text-[13px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4 theme-primary-text" />
                    Předvolby
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 snap-x no-scrollbar">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => setTheme(t)}
                        className={`snap-start shrink-0 py-1.5 px-3 rounded-xl text-sm font-semibold transition-all min-h-[36px] border flex items-center gap-2 active:scale-95 ${theme.name === t.name ? 'theme-primary-bg text-white border-transparent shadow-lg' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`}
                      >
                        <div className={`w-3 h-3 rounded-full ${theme.name === t.name ? 'bg-white' : ''}`} style={{ backgroundColor: theme.name === t.name ? undefined : t.primary }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-4">Barvy</label>
                  
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md divide-y divide-white/10">
                    <div className="flex items-center justify-between p-2 min-h-[36px]">
                      <span className="text-sm text-zinc-100 tracking-tight">Hlavní barva</span>
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <input 
                          type="color" 
                          value={theme.primary} 
                          onChange={(e) => setTheme({...theme, primary: e.target.value, name: 'Custom'})} 
                          className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-none" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 min-h-[36px]">
                      <span className="text-sm text-zinc-100 tracking-tight">Sekundární barva</span>
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <input 
                          type="color" 
                          value={theme.secondary} 
                          onChange={(e) => setTheme({...theme, secondary: e.target.value, name: 'Custom'})} 
                          className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-none" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 min-h-[36px]">
                      <span className="text-sm text-zinc-100 tracking-tight">Pozadí</span>
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <input 
                          type="color" 
                          value={theme.background} 
                          onChange={(e) => setTheme({...theme, background: e.target.value, name: 'Custom'})} 
                          className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-none" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-4">Efekty a tvary</label>
                  
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md divide-y divide-white/10">
                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Průhlednost skla</span>
                        <span className="text-zinc-500 font-mono">{Math.round(theme.glassOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={theme.glassOpacity} 
                        onChange={(e) => setTheme({...theme, glassOpacity: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Rozmazání (Blur)</span>
                        <span className="text-zinc-500 font-mono">{theme.blur}px</span>
                      </div>
                      <input 
                        type="range" min="0" max="64" step="1" 
                        value={theme.blur} 
                        onChange={(e) => setTheme({...theme, blur: parseInt(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Zaoblení rohů</span>
                        <span className="text-zinc-500 font-mono">{theme.radius}rem</span>
                      </div>
                      <input 
                        type="range" min="0" max="3" step="0.25" 
                        value={theme.radius} 
                        onChange={(e) => setTheme({...theme, radius: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Intenzita záře</span>
                        <span className="text-zinc-500 font-mono">{Math.round(theme.glow * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={theme.glow} 
                        onChange={(e) => setTheme({...theme, glow: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>
                  </div>
                </div>

                {/* Panel Settings */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-4">Nastavení panelů</label>
                  
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md divide-y divide-white/10">
                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Průhlednost panelů</span>
                        <span className="text-zinc-500 font-mono">{Math.round(theme.panelOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="0.3" step="0.01" 
                        value={theme.panelOpacity} 
                        onChange={(e) => setTheme({...theme, panelOpacity: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Rozmazání panelů</span>
                        <span className="text-zinc-500 font-mono">{theme.panelBlur}px</span>
                      </div>
                      <input 
                        type="range" min="0" max="40" step="1" 
                        value={theme.panelBlur} 
                        onChange={(e) => setTheme({...theme, panelBlur: parseInt(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Viditelnost ohraničení</span>
                        <span className="text-zinc-500 font-mono">{Math.round(theme.borderOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="0.5" step="0.01" 
                        value={theme.borderOpacity} 
                        onChange={(e) => setTheme({...theme, borderOpacity: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Intenzita stínů</span>
                        <span className="text-zinc-500 font-mono">{Math.round(theme.shadowIntensity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={theme.shadowIntensity} 
                        onChange={(e) => setTheme({...theme, shadowIntensity: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 min-h-[36px]">
                      <span className="text-sm text-zinc-100 tracking-tight">Písmo (Font)</span>
                      <div className="flex bg-black/20 rounded-lg p-0.5">
                        <button 
                          onClick={() => setTheme({...theme, fontFamily: 'sans', name: 'Custom'})}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${theme.fontFamily === 'sans' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Sans
                        </button>
                        <button 
                          onClick={() => setTheme({...theme, fontFamily: 'mono', name: 'Custom'})}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${theme.fontFamily === 'mono' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Mono
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Panel Settings */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-4 text-indigo-400">Nastavení AI panelu</label>
                  
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden shadow-sm backdrop-blur-md divide-y divide-white/10">
                    <div className="flex items-center justify-between p-2 min-h-[36px]">
                      <span className="text-sm text-zinc-100 tracking-tight">Barva AI panelu</span>
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-inner">
                        <input 
                          type="color" 
                          value={theme.aiPanelColor} 
                          onChange={(e) => setTheme({...theme, aiPanelColor: e.target.value, name: 'Custom'})} 
                          className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-none" 
                        />
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-100 tracking-tight">Průhlednost AI panelu</span>
                        <span className="text-zinc-500 font-mono">{Math.round(theme.aiPanelOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="0.5" step="0.01" 
                        value={theme.aiPanelOpacity} 
                        onChange={(e) => setTheme({...theme, aiPanelOpacity: parseFloat(e.target.value), name: 'Custom'})} 
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--primary)] drag-only-slider" 
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => setIsThemeOpen(false)}
                  whileTap={{ scale: 0.95 }}
                  className="w-full theme-primary-bg hover:brightness-110 text-white font-bold py-3 theme-glass-inner mt-1 transition-all duration-300 min-h-[42px] text-sm shadow-xl shadow-[color-mix(in_srgb,var(--primary)_20%,transparent)] rounded-xl"
                >
                  Hotovo
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
