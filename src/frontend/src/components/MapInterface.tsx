import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, ChevronLeft, Settings, Globe, Plus } from 'lucide-react';
import { CurrentUser } from '../types';

interface Props {
  location: any;
  vendors: any[];
  onBack: () => void;
  onOpenSettings: () => void;
  onSelectVendor: (vendor: any) => void;
  selectedVendor: any;
  isAddingVendor: boolean;
  onAddVendorClick: () => void;
  onMapClick: (coords: { x: number; y: number }) => void;
  currentUser: CurrentUser | null;
}

export default function MapInterface({ location, vendors, onBack, onOpenSettings, onSelectVendor, selectedVendor, isAddingVendor, onAddVendorClick, onMapClick, currentUser }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isAddingVendor || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onMapClick({ x, y });
  };

  const canAddVendor = currentUser?.role === 'admin' || currentUser?.role === 'foodvendor';

  return (
    <motion.div
      ref={mapRef}
      onClick={handleMapClick}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`w-full h-full relative bg-[#e5e3df] overflow-hidden ${isAddingVendor ? 'cursor-crosshair' : ''}`}
    >
      {/* Custom Map Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Map Roads Mockup */}
      <div className="absolute top-1/4 left-0 right-0 h-12 bg-white/40 transform -skew-y-6 pointer-events-none" />
      <div className="absolute top-0 bottom-0 left-1/3 w-16 bg-white/40 transform skew-x-12 pointer-events-none" />
      <div className="absolute top-1/2 left-0 right-0 h-8 bg-white/30 transform skew-y-3 pointer-events-none" />

      {/* User Location (Blue Dot) */}
      <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
      </div>

      {/* Vendors */}
      {vendors.map((vendor: any) => (
        <button
          key={vendor.id}
          onClick={() => onSelectVendor(vendor)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${selectedVendor?.id === vendor.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
          style={{ top: `${vendor.y}%`, left: `${vendor.x}%` }}
        >
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 ${selectedVendor?.id === vendor.id ? 'bg-orange-500 border-white text-white' : 'bg-white border-orange-500 text-orange-500'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            {selectedVendor?.id === vendor.id && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {vendor.name}
              </div>
            )}
          </div>
        </button>
      ))}

      {/* FABs */}
      <div className="absolute left-4 top-4 z-30">
        <button
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute right-4 top-4 z-30 flex flex-col gap-3">
        <button
          onClick={onOpenSettings}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
        <button
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-6 h-6" />
        </button>
        {canAddVendor && (
          <button
            onClick={onAddVendorClick}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${isAddingVendor ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Location Label */}
      <div className="absolute left-4 bottom-4 z-0 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/50">
          <p className="text-sm font-medium text-gray-800">{location?.name}</p>
        </div>
      </div>
    </motion.div>
  );
}
