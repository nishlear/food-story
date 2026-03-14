import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, Navigation, Share2, X } from 'lucide-react';

interface Props {
  vendor: any;
  onClose: () => void;
  onShare: () => void;
}

export default function VendorBottomSheet({ vendor, onClose, onShare }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vendor) setIsExpanded(false);
  }, [vendor]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 50 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <AnimatePresence>
      {vendor && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 z-30"
          />
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: isExpanded ? '0%' : '50%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 flex flex-col"
            style={{ height: '90%' }}
          >
            {/* Drag Handle */}
            <div
              className="w-full pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Sticky Header */}
            <div className="px-6 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">{vendor.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-orange-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-semibold">{vendor.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">({vendor.reviews})</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 text-sm capitalize">{vendor.type}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-sm">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 flex-shrink-0 self-start">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 py-4">
              <button className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-transform">
                <Navigation className="w-5 h-5" />
                Get Directions
              </button>
              <button
                onClick={onShare}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto px-6 pb-8"
              onScroll={handleScroll}
            >
              {/* Vendor Images */}
              {vendor.images && vendor.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 pt-2 snap-x" style={{ scrollbarWidth: 'none' }}>
                  {vendor.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${vendor.name} ${idx + 1}`}
                      className="w-56 h-36 object-cover rounded-2xl snap-center flex-shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}

              <div className="py-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">
                  A legendary spot known for its authentic flavors and secret family recipes passed down through generations. The aroma alone is enough to draw a crowd from blocks away.
                </p>
              </div>

              <div className="py-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Comments</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">FoodieExplorer{i}</span>
                        <div className="flex text-orange-400">
                          <Star className="w-3 h-3 fill-current" />
                          <Star className="w-3 h-3 fill-current" />
                          <Star className="w-3 h-3 fill-current" />
                          <Star className="w-3 h-3 fill-current" />
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Absolutely incredible! The best {vendor.type} I've had in the city. Worth the wait in line.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-20" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
