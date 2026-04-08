import { useState, useCallback, useEffect } from 'react';
import { Language } from '../i18n/types';

export interface UseTTSReturn {
  isPlaying: boolean;
  currentVendorId: string | null;
  play: (text: string, language: Language, vendorId: string) => void;
  stop: () => void;
}

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState<string | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentVendorId(null);
  }, []);

  const play = useCallback((text: string, language: Language, vendorId: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onend = () => { setIsPlaying(false); setCurrentVendorId(null); };
    utterance.onerror = () => { setIsPlaying(false); setCurrentVendorId(null); };

    setIsPlaying(true);
    setCurrentVendorId(vendorId);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  return { isPlaying, currentVendorId, play, stop };
}
