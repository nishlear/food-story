import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Type, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  textSize: number;
  setTextSize: (v: number) => void;
}

export default function SettingsModal({ isOpen, onClose, audioEnabled, setAudioEnabled, textSize, setTextSize }: Props) {
  return (
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
              <h3 className="text-xl font-bold text-gray-900">Settings</h3>
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
                    <p className="font-medium text-gray-900">Narration Audio</p>
                    <p className="text-sm text-gray-500">Auto-play when nearby</p>
                  </div>
                </div>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${audioEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${audioEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Text Size Slider */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Type className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Text Size</p>
                    <p className="text-sm text-gray-500">Adjust readability</p>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
