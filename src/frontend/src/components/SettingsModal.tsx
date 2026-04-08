import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Type, X, Lock } from 'lucide-react';
import { CurrentUser } from '../types';
import ChangePasswordModal from './ChangePasswordModal';
import { useLanguage } from '../i18n/context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  narrationCooldown: number;
  setNarrationCooldown: (v: number) => void;
  textSize: number;
  setTextSize: (v: number) => void;
  currentUser: CurrentUser | null;
  authHeaders: () => Record<string, string>;
}

export default function SettingsModal({ isOpen, onClose, audioEnabled, setAudioEnabled, narrationCooldown, setNarrationCooldown, textSize, setTextSize, currentUser, authHeaders }: Props) {
  const { t } = useLanguage();
  const [isChangePwOpen, setIsChangePwOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">{t.settings}</h3>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Audio Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${audioEnabled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.narrationAudio}</p>
                      <p className="text-sm text-gray-500">{t.narrationAudioHint}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${audioEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${audioEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-1 ml-1">{t.gpsAccuracyWarning}</p>

                {audioEnabled && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{t.cooldownLabel}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{t.cooldownHint}</p>
                      </div>
                      <select
                        value={narrationCooldown}
                        onChange={(e) => setNarrationCooldown(Number(e.target.value))}
                        className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 text-sm border-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value={5}>{t.cooldown5min}</option>
                        <option value={10}>{t.cooldown10min}</option>
                        <option value={20}>{t.cooldown20min}</option>
                        <option value={30}>{t.cooldown30min}</option>
                        <option value={60}>{t.cooldown1hr}</option>
                        <option value={0}>{t.cooldownNever}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Text Size Slider */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Type className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.textSize}</p>
                      <p className="text-sm text-gray-500">{t.textSizeHint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-2">
                    <span className="text-xs font-medium text-gray-400">A</span>
                    <input
                      type="range"
                      min="14"
                      max="24"
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <span className="text-xl font-medium text-gray-600">A</span>
                  </div>
                </div>

                {/* Change Password */}
                {currentUser && (
                  <div>
                    <button
                      onClick={() => setIsChangePwOpen(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.changePassword}</p>
                        <p className="text-sm text-gray-500">{t.changePasswordHint}</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={isChangePwOpen}
        onClose={() => setIsChangePwOpen(false)}
        authHeaders={authHeaders}
      />
    </>
  );
}
