import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, Navigation, Share2, X, Edit2 } from 'lucide-react';
import { CurrentUser, Comment, Vendor } from '../types';
import VendorRateForm from './VendorRateForm';
import VendorCommentsList from './VendorCommentsList';
import VendorEditModal from './VendorEditModal';
import { useLanguage } from '../i18n/context';
import { getDescriptionForLanguage } from '../utils/vendorDescriptions';

interface Props {
  vendor: Vendor | null;
  onClose: () => void;
  onShare: () => void;
  currentUser: CurrentUser | null;
  authHeaders: () => Record<string, string>;
  hasMap?: boolean;
  onSetPinLocation?: (vendor: Vendor) => void;
  onVendorUpdated?: (vendor: Vendor) => void;
}

export default function VendorBottomSheet({ vendor, onClose, onShare, currentUser, authHeaders, hasMap, onSetPinLocation, onVendorUpdated }: Props) {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vendor) {
      setIsExpanded(false);
      fetchComments();
    }
  }, [vendor]);

  const fetchComments = () => {
    if (!vendor) return;
    fetch(`/api/vendors/${vendor.id}/comments`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setComments(data) : setComments([]))
      .catch(() => setComments([]));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 50 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const isOwner = currentUser?.role === 'foodvendor' && vendor?.owner_username === currentUser?.username;
  const canEdit = currentUser?.role === 'admin' || isOwner;
  const imageList = Array.isArray(vendor?.images) ? vendor.images : [];
  const description = vendor ? getDescriptionForLanguage(vendor.description_translations, language) : null;

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
                    <span className="ml-1 font-semibold">{vendor.rating || 0}</span>
                  </div>
                  <span className="text-gray-400 text-sm">({vendor.reviews || 0})</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 text-sm capitalize">{vendor.type}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-sm">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-start">
                {canEdit && (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 py-4">
              <button className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-transform">
                <Navigation className="w-5 h-5" />
                {t.getDirections}
              </button>
              <button
                onClick={onShare}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Share2 className="w-5 h-5" />
                {t.share}
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto px-6 pb-8"
              onScroll={handleScroll}
            >
              {/* Vendor Images */}
              {imageList.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 pt-2 snap-x" style={{ scrollbarWidth: 'none' }}>
                  {imageList.map((img: string, idx: number) => (
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
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t.about}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {description || t.defaultDescription}
                </p>
              </div>

              {/* Rate Form */}
              {currentUser && (
                <div className="py-4 border-t border-gray-100">
                  <VendorRateForm
                    vendorId={vendor.id}
                    authHeaders={authHeaders}
                    onSubmitted={fetchComments}
                  />
                </div>
              )}

              <div className="py-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.reviews}</h3>
                <VendorCommentsList
                  comments={comments}
                  currentUser={currentUser}
                  vendorId={vendor.id}
                  authHeaders={authHeaders}
                  onDeleted={fetchComments}
                />
              </div>

              <div className="h-20" />
            </div>
          </motion.div>

          {canEdit && (
            <VendorEditModal
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              vendor={vendor}
              streetId={vendor.street_id}
              authHeaders={authHeaders}
              onUpdated={(updatedVendor) => {
                onVendorUpdated?.(updatedVendor);
                setIsEditOpen(false);
              }}
              hasMap={hasMap}
              currentUser={currentUser}
              onSetPinLocation={onSetPinLocation ? () => onSetPinLocation(vendor) : undefined}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
