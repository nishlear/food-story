import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, ChevronLeft, Settings, Globe, Plus, Minus, LocateFixed, LocateOff, Loader } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { projectVendorToPercent, percentToLatLon } from '../utils/geoProjection';
import { CurrentUser } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';

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
  // Pin placement props
  pinPlacementMode?: boolean;
  onPinPlacementTap?: (lat: number, lon: number) => void;
  candidatePin?: { lat: number; lon: number } | null;
  onConfirmPin?: () => void;
  onCancelPin?: () => void;
  pinPlacementVendorName?: string;
}

export default function MapInterface({ location, vendors, onBack, onOpenSettings, onSelectVendor, selectedVendor, isAddingVendor, onAddVendorClick, onMapClick, currentUser, pinPlacementMode = false, onPinPlacementTap, candidatePin = null, onConfirmPin, onCancelPin, pinPlacementVendorName }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [highlightedVendor, setHighlightedVendor] = useState<any>(null);
  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { position: gpsPosition, status: gpsStatus, request: requestGps } = useGeolocation();
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  // Observe the inner image container — stable full-screen size inside TransformComponent
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute the rendered image rect (object-contain math) for correct pin placement
  const pinOverlayRect = (() => {
    if (!imgNaturalSize || !containerSize) return null;
    const scale = Math.min(containerSize.w / imgNaturalSize.w, containerSize.h / imgNaturalSize.h);
    const w = imgNaturalSize.w * scale;
    const h = imgNaturalSize.h * scale;
    return {
      left: (containerSize.w - w) / 2,
      top: (containerSize.h - h) / 2,
      width: w,
      height: h,
    };
  })();

  useEffect(() => {
    return () => {
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, []);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isAddingVendor || !mapRef.current || hasMap) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onMapClick({ x, y });
  };

  const canAddVendor = currentUser?.role === 'admin' || currentUser?.role === 'foodvendor';

  const hasMap = !!(
    location?.map_image_path &&
    location?.lat_nw != null &&
    location?.lon_nw != null &&
    location?.lat_se != null &&
    location?.lon_se != null
  );

  const mapUrl = hasMap
    ? `/${location.map_image_path}${location.map_updated_at ? `?t=${encodeURIComponent(location.map_updated_at)}` : ''}`
    : '';

  const pinnedVendors = hasMap
    ? vendors.filter((v: any) => v.lat != null && v.lon != null)
    : [];

  const handlePinTap = (vendor: any) => {
    if (highlightedVendor?.id === vendor.id) {
      // Second tap on same pin — open bottom sheet immediately
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
      setHighlightedVendor(null);
      onSelectVendor(vendor);
    } else {
      // First tap — highlight pin, start auto-open timer
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
      setHighlightedVendor(vendor);
      autoOpenTimerRef.current = setTimeout(() => {
        onSelectVendor(vendor);
        setHighlightedVendor(null);
        autoOpenTimerRef.current = null;
      }, 300);
    }
  };

  const handlePinOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    if (!location?.lat_nw) return;
    const { lat, lon } = percentToLatLon(
      location.lat_nw, location.lon_nw,
      location.lat_se, location.lon_se,
      xPct, yPct
    );
    onPinPlacementTap?.(lat, lon);
  };

  return (
    <motion.div
      ref={mapRef}
      onClick={handleMapClick}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`w-full h-full relative bg-[#e5e3df] overflow-hidden ${isAddingVendor && !hasMap ? 'cursor-crosshair' : ''}`}
    >
      {hasMap ? (
        <>
          {/* Loading skeleton */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
          )}
          {/* Error state */}
          {imgError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 z-0">
              Map failed to load. Refresh to retry.
            </div>
          )}
          <TransformWrapper
            minScale={1}
            maxScale={5}
            limitToBounds={true}
            panning={{ velocityDisabled: true }}
          >
            {({ zoomIn, zoomOut }) => (
              <>
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: '100%', height: '100%' }}
                >
                  <div ref={imgContainerRef} className="relative w-full h-full">
                    <img
                      src={mapUrl}
                      alt={`Map of ${location.name}`}
                      className={`w-full h-full object-contain ${imgLoaded ? '' : 'invisible'}`}
                      onLoad={(e) => {
                        setImgLoaded(true);
                        setImgNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
                      }}
                      onError={() => setImgError(true)}
                      draggable={false}
                    />
                    {/* Pin overlay — sized to match the actual rendered image area so pins land correctly */}
                    <div
                      className={`absolute ${pinPlacementMode ? 'cursor-crosshair' : ''}`}
                      style={pinOverlayRect
                        ? { left: pinOverlayRect.left, top: pinOverlayRect.top, width: pinOverlayRect.width, height: pinOverlayRect.height }
                        : { inset: 0 }}
                      onClick={pinPlacementMode ? handlePinOverlayClick : undefined}
                    >
                      {pinnedVendors.map((vendor: any) => {
                          const { x, y } = projectVendorToPercent(
                            location.lat_nw, location.lon_nw,
                            location.lat_se, location.lon_se,
                            vendor.lat, vendor.lon
                          );
                          const isHighlighted = highlightedVendor?.id === vendor.id;
                          return (
                            <button
                              key={vendor.id}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handlePinTap(vendor); }}
                              aria-label={vendor.name}
                              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${isHighlighted ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}
                              style={{ top: `${y}%`, left: `${x}%` }}
                            >
                              <div className="relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 ${isHighlighted ? 'bg-orange-500 border-white text-white' : 'bg-white border-orange-500 text-orange-500'}`}>
                                  <MapPin className="w-5 h-5" />
                                </div>
                                {isHighlighted && (
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                                    {vendor.name}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}

                      {/* GPS blue dot */}
                      {gpsPosition && (() => {
                        const { x, y } = projectVendorToPercent(
                          location.lat_nw, location.lon_nw,
                          location.lat_se, location.lon_se,
                          gpsPosition.lat, gpsPosition.lon
                        );
                        if (x < 0 || x > 100 || y < 0 || y > 100) return null;
                        return (
                          <div
                            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                            style={{ top: `${y}%`, left: `${x}%` }}
                          >
                            <div className="relative flex items-center justify-center">
                              <div className="absolute w-10 h-10 rounded-full bg-blue-400 opacity-30 animate-ping" />
                              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Candidate pin — shown when admin has tapped to place */}
                      {candidatePin && (() => {
                        const { x, y } = projectVendorToPercent(
                          location.lat_nw, location.lon_nw,
                          location.lat_se, location.lon_se,
                          candidatePin.lat, candidatePin.lon
                        );
                        return (
                          <div
                            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ top: `${y}%`, left: `${x}%` }}
                            data-testid="candidate-pin"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-md text-white">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-50" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </TransformComponent>

                {/* Instruction banner — shown when in pin placement mode with no candidate yet */}
                {pinPlacementMode && !candidatePin && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/50 text-sm text-gray-700 whitespace-nowrap">
                      Tap the map to place pin{pinPlacementVendorName ? ` for ${pinPlacementVendorName}` : ''}
                    </div>
                  </div>
                )}

                {/* Confirmation overlay — shown when candidate pin is set */}
                {candidatePin && (
                  <div className="absolute bottom-16 left-4 right-4 z-40">
                    <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-3">
                      <p className="font-semibold text-gray-900 text-center">Place pin here?</p>
                      {pinPlacementVendorName && (
                        <p className="text-sm text-gray-500 text-center">{pinPlacementVendorName}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={onCancelPin}
                          className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onConfirmPin}
                          className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top-right FAB column — settings & globe */}
                <div className="absolute right-4 top-4 z-30 flex flex-col gap-3">
                  <button
                    onClick={onOpenSettings}
                    aria-label="Settings"
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  <button
                    aria-label="Language"
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Globe className="w-6 h-6" />
                  </button>
                  {canAddVendor && (
                    <button
                      onClick={undefined}
                      disabled={true}
                      aria-label="Add vendor"
                      className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors opacity-50 cursor-not-allowed bg-white text-gray-700"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Bottom-right FAB column — GPS + zoom buttons */}
                <div className="absolute right-4 bottom-16 z-30 flex flex-col gap-3">
                  <button
                    onClick={gpsStatus === 'idle' || gpsStatus === 'denied' || gpsStatus === 'unavailable' ? requestGps : undefined}
                    aria-label="My location"
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${gpsStatus === 'granted' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {gpsStatus === 'pending' ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : gpsStatus === 'denied' || gpsStatus === 'unavailable' ? (
                      <LocateOff className="w-5 h-5" />
                    ) : (
                      <LocateFixed className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => zoomIn()}
                    aria-label="Zoom in"
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    aria-label="Zoom out"
                    className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </TransformWrapper>
        </>
      ) : (
        <>
          {/* === EXISTING MOCK MAP CODE (no-map fallback) — UNCHANGED === */}

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

          {/* Right FAB column (no-map branch) */}
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
        </>
      )}

      {/* Left FAB — back button (applies to both branches) */}
      <div className="absolute left-4 top-4 z-30">
        <button
          onClick={onBack}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Location Label (applies to both branches) */}
      <div className="absolute left-4 bottom-4 z-30 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/50">
          <p className="text-sm font-medium text-gray-800">{location?.name}</p>
        </div>
      </div>
    </motion.div>
  );
}
