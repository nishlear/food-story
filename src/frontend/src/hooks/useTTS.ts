import { useState, useCallback, useEffect, useRef } from 'react';
import { Language } from '../i18n/types';

export interface UseTTSReturn {
  isPlaying: boolean;
  currentVendorId: string | null;
  play: (text: string, language: Language, vendorId: string, rate?: number) => void;
  stop: () => void;
}

function getVoiceForLanguage(language: Language): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === language) ??
    voices.find((v) => v.lang.startsWith(language + '-')) ??
    voices.find((v) => v.lang.startsWith(language)) ??
    null
  );
}

function speakFallback(
  text: string,
  language: Language,
  rate: number,
  onEnd: () => void,
) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = rate;
  const voice = getVoiceForLanguage(language);
  if (voice) utterance.voice = voice;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pre-load voices for fallback
    window.speechSynthesis.getVoices();
    const onVoicesChanged = () => { window.speechSynthesis.getVoices(); };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentVendorId(null);
  }, []);

  const play = useCallback((text: string, language: Language, vendorId: string, rate = 1.0) => {
    // Stop any current playback
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis.cancel();

    setIsPlaying(true);
    setCurrentVendorId(vendorId);

    const onEnd = () => { setIsPlaying(false); setCurrentVendorId(null); };

    // Try pre-generated Edge TTS audio file first
    const audioUrl = `/audio/${vendorId}_${language}.mp3`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    audioRef.current = audio;

    audio.onended = onEnd;
    audio.onerror = () => {
      // File not found — fall back to Web Speech API
      speakFallback(text, language, rate, onEnd);
    };

    audio.play().catch(() => {
      speakFallback(text, language, rate, onEnd);
    });
  }, []);

  return { isPlaying, currentVendorId, play, stop };
}
