import { useEffect, useRef } from 'react';
import { Language } from '../i18n/types';
import { GeoPosition } from './useGeolocation';
import { UseTTSReturn } from './useTTS';
import { haversine } from '../utils/haversine';

interface Vendor {
  id: string;
  name: string;
  description?: string | null;
  lat?: number | null;
  lon?: number | null;
}

interface ProximityNarrationOptions {
  vendors: Vendor[];
  userPosition: GeoPosition | null;
  audioEnabled: boolean;
  cooldownMinutes: number; // 0 = never auto-trigger
  language: Language;
  tts: UseTTSReturn;
  translations: { transitionPhrase: string };
  onGpsAccuracyWarning?: () => void;
}

export function useProximityNarration(options: ProximityNarrationOptions): void {
  const {
    vendors,
    userPosition,
    audioEnabled,
    cooldownMinutes,
    language,
    tts,
    translations,
    onGpsAccuracyWarning,
  } = options;

  const cooldownMap = useRef<Map<string, number>>(new Map());
  const dwellStart = useRef<{ vendorId: string; time: number } | null>(null);
  const lastTriggeredVendorId = useRef<string | null>(null);
  const gpsWarningShown = useRef(false);

  // Keep latest option refs so interval closure doesn't go stale
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const interval = setInterval(() => {
      const {
        vendors,
        userPosition,
        audioEnabled,
        cooldownMinutes,
        language,
        tts,
        translations,
        onGpsAccuracyWarning,
      } = optionsRef.current;

      if (!audioEnabled || cooldownMinutes === 0 || !userPosition) return;

      if (userPosition.accuracy > 40) {
        if (!gpsWarningShown.current) {
          gpsWarningShown.current = true;
          onGpsAccuracyWarning?.();
        }
        return;
      }

      const vendorsWithCoords = vendors.filter(
        (v) => v.lat != null && v.lon != null
      );

      const vendorDistances = vendorsWithCoords.map((v) => ({
        vendor: v,
        distance: haversine(userPosition.lat, userPosition.lon, v.lat!, v.lon!),
      }));

      const singleThreshold = userPosition.accuracy > 20 ? 40 : 15;
      const multiThreshold = userPosition.accuracy > 20 ? 20 : 5;

      const nearbyVendors = vendorDistances.filter(
        (vd) => vd.distance <= singleThreshold
      );

      if (nearbyVendors.length === 0) {
        dwellStart.current = null;
        return;
      }

      let candidate: Vendor | null = null;

      if (nearbyVendors.length === 1) {
        candidate = nearbyVendors[0].vendor;
      } else {
        const closeVendors = nearbyVendors.filter(
          (vd) => vd.distance <= multiThreshold
        );
        if (closeVendors.length === 1) {
          candidate = closeVendors[0].vendor;
        } else {
          dwellStart.current = null;
          return;
        }
      }

      // Check cooldown
      const lastTrigger = cooldownMap.current.get(candidate.id);
      if (lastTrigger && Date.now() - lastTrigger < cooldownMinutes * 60 * 1000) {
        return;
      }

      // Check dwell time (5 seconds)
      if (!dwellStart.current || dwellStart.current.vendorId !== candidate.id) {
        dwellStart.current = { vendorId: candidate.id, time: Date.now() };
        return;
      }

      if (Date.now() - dwellStart.current.time < 5000) return;

      // TRIGGER
      const prevVendorId = lastTriggeredVendorId.current;
      if (tts.isPlaying && prevVendorId && prevVendorId !== candidate.id) {
        // Transition narration via Web Speech API
        tts.stop();
        const fromVendor = vendors.find((v) => v.id === prevVendorId);
        const toVendor = candidate;

        if (!fromVendor) {
          tts.play(toVendor.description || toVendor.name, language, toVendor.id);
        } else {
          const phrase = translations.transitionPhrase
            .replace('{from}', fromVendor.name)
            .replace('{to}', toVendor.name);

          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.lang = language;
          utterance.onend = () => tts.play(toVendor.description || toVendor.name, language, toVendor.id);
          utterance.onerror = () => tts.play(toVendor.description || toVendor.name, language, toVendor.id);

          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      } else {
        tts.play(candidate.description || candidate.name, language, candidate.id);
      }

      cooldownMap.current.set(candidate.id, Date.now());
      lastTriggeredVendorId.current = candidate.id;
      dwellStart.current = null;
    }, 2000);

    return () => clearInterval(interval);
  }, []); // empty deps — uses optionsRef for always-fresh values
}
