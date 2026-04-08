import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { CurrentUser, Vendor } from './types';
import { useLanguage } from './i18n/context';
import { useTTS } from './hooks/useTTS';
import LoginScreen from './components/LoginScreen';
import LocationSelection from './components/LocationSelection';
import MapInterface from './components/MapInterface';
import SettingsModal from './components/SettingsModal';
import VendorBottomSheet from './components/VendorBottomSheet';
import AddLocationModal from './components/AddLocationModal';
import EditLocationModal from './components/EditLocationModal';
import DeleteLocationModal from './components/DeleteLocationModal';
import AddVendorModal from './components/AddVendorModal';
import AdminScreen from './components/AdminScreen';
import { motion } from 'motion/react';

type Screen = 'login' | 'location' | 'map' | 'admin';

export default function App() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const [locations, setLocations] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [deletingLocation, setDeletingLocation] = useState<any>(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [newVendorCoords, setNewVendorCoords] = useState<{ x: number; y: number; lat?: number; lon?: number } | null>(null);

  const [pinPlacementMode, setPinPlacementMode] = useState(false);
  const [pinPlacementVendor, setPinPlacementVendor] = useState<Vendor | null>(null);
  const [candidatePin, setCandidatePin] = useState<{ lat: number; lon: number } | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('food-story-audio') === 'true';
  });
  const [narrationCooldown, setNarrationCooldown] = useState<number>(() => {
    const stored = localStorage.getItem('food-story-cooldown');
    return stored ? Number(stored) : 60;
  });
  const [textSize, setTextSize] = useState(16);
  const [ttsRate, setTtsRate] = useState<number>(() => {
    const stored = localStorage.getItem('food-story-tts-rate');
    return stored ? Number(stored) : 1.0;
  });
  const [showGpsWarning, setShowGpsWarning] = useState(false);
  const tts = useTTS();

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(currentUser ? { 'X-Role-Token': currentUser.token } : {}),
  });

  useEffect(() => {
    if (currentScreen === 'location') {
      fetch('/api/streets', { headers: authHeaders() })
        .then(res => res.json())
        .then(data => setLocations(data))
        .catch(err => console.error('Failed to fetch streets:', err));
    }
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('food-story-audio', String(audioEnabled));
  }, [audioEnabled]);

  useEffect(() => {
    localStorage.setItem('food-story-cooldown', String(narrationCooldown));
  }, [narrationCooldown]);

  useEffect(() => {
    localStorage.setItem('food-story-tts-rate', String(ttsRate));
  }, [ttsRate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    setCurrentScreen('location');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
    setSelectedLocation(null);
    setVendors([]);
  };

  const handleAddLocation = async (newLoc: any) => {
    try {
      await fetch('/api/streets', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newLoc),
      });
      setLocations([newLoc, ...locations]);
      showToast(t.streetAdded);
    } catch {
      showToast(t.failedAddStreet);
    }
  };

  const handleUpdateLocation = async (id: string, data: any) => {
    try {
      await fetch(`/api/streets/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      setLocations(locations.map(loc => loc.id === id ? { ...loc, ...data } : loc));
      showToast(t.streetUpdated);
    } catch {
      showToast(t.failedUpdateStreet);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      await fetch(`/api/streets/${id}`, { method: 'DELETE', headers: authHeaders() });
      setLocations(locations.filter(loc => loc.id !== id));
      setDeletingLocation(null);
      showToast(t.streetDeleted);
    } catch {
      showToast(t.failedDeleteStreet);
    }
  };

  const handleSelectLocation = async (loc: any) => {
    setSelectedLocation(loc);
    setCurrentScreen('map');
    try {
      const res = await fetch(`/api/streets/${loc.id}/vendors`, { headers: authHeaders() });
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const handleAddVendorClick = () => {
    setIsAddingVendor(!isAddingVendor);
    if (!isAddingVendor) {
      showToast(t.tapToPlaceVendor);
    }
  };

  const handleMapClick = (coords: { x: number; y: number; lat?: number; lon?: number }) => {
    setNewVendorCoords(coords);
    setIsAddVendorModalOpen(true);
  };

  const handleExitPinPlacement = () => {
    setPinPlacementMode(false);
    setPinPlacementVendor(null);
    setCandidatePin(null);
  };

  const handleSetPinLocation = (vendor: Vendor) => {
    setSelectedVendor(null);           // close bottom sheet
    setPinPlacementVendor(vendor);
    setPinPlacementMode(true);
    showToast(t.tapMapToPlacePin);
  };

  const handlePinPlacementTap = (lat: number, lon: number) => {
    setCandidatePin({ lat, lon });
  };

  const handleConfirmPin = async () => {
    if (!candidatePin || !pinPlacementVendor || !selectedLocation) return;
    try {
      await fetch(`/api/streets/${selectedLocation.id}/vendors/${pinPlacementVendor.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          ...pinPlacementVendor,
          lat: candidatePin.lat,
          lon: candidatePin.lon,
        }),
      });
      const res = await fetch(`/api/streets/${selectedLocation.id}/vendors`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setVendors(data);
      showToast(t.pinSaved);
    } catch {
      showToast(t.failedSavePin);
    } finally {
      setPinPlacementMode(false);
      setPinPlacementVendor(null);
      setCandidatePin(null);
    }
  };

  const handleCancelPin = () => {
    setCandidatePin(null);
    // Keep pinPlacementMode=true so admin can re-tap
  };

  const handleAddVendor = async (newVendor: any) => {
    try {
      await fetch(`/api/streets/${selectedLocation.id}/vendors`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newVendor),
      });
      const res = await fetch(`/api/streets/${selectedLocation.id}/vendors`, { headers: authHeaders() });
      const data = await res.json();
      setVendors(data);
      setIsAddingVendor(false);
      const toastMsg = currentUser?.role === 'foodvendor'
        ? t.vendorRequestSubmitted
        : t.vendorAdded;
      showToast(toastMsg);
    } catch {
      showToast(t.failedAddVendor);
    }
  };

  const handleVendorUpdated = (updatedVendor: Vendor) => {
    setVendors((prev) => prev.map((vendor) => (
      vendor.id === updatedVendor.id ? updatedVendor : vendor
    )));
    setSelectedVendor(updatedVendor);
    showToast(t.vendorUpdated);
  };

  const vendorModalMode = currentUser?.role === 'foodvendor' ? 'request' : 'add';

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans"
      style={{ fontSize: `${textSize}px` }}
    >
      <AnimatePresence mode="wait">
        {currentScreen === 'login' && (
          <LoginScreen onLogin={handleLogin} />
        )}
        {currentScreen === 'location' && (
          <LocationSelection
            locations={locations}
            onSelect={handleSelectLocation}
            onAddClick={() => setIsAddLocationOpen(true)}
            onEditClick={(loc) => setEditingLocation(loc)}
            onDeleteClick={(loc) => setDeletingLocation(loc)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onGoToAdmin={() => setCurrentScreen('admin')}
          />
        )}
        {currentScreen === 'map' && (
          <MapInterface
            location={selectedLocation}
            vendors={vendors}
            onBack={() => {
              setCurrentScreen('location');
              setSelectedVendor(null);
              setIsAddingVendor(false);
              handleExitPinPlacement();
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectVendor={setSelectedVendor}
            selectedVendor={selectedVendor}
            isAddingVendor={isAddingVendor}
            onAddVendorClick={handleAddVendorClick}
            onMapClick={handleMapClick}
            currentUser={currentUser}
            pinPlacementMode={pinPlacementMode}
            onPinPlacementTap={handlePinPlacementTap}
            candidatePin={candidatePin}
            onConfirmPin={handleConfirmPin}
            onCancelPin={handleCancelPin}
            pinPlacementVendorName={pinPlacementVendor?.name}
            audioEnabled={audioEnabled}
            narrationCooldown={narrationCooldown}
            ttsRate={ttsRate}
            tts={tts}
            onGpsAccuracyWarning={() => setShowGpsWarning(true)}
          />
        )}
        {currentScreen === 'admin' && (
          <AdminScreen
            currentUser={currentUser}
            onBack={() => setCurrentScreen('location')}
            authHeaders={authHeaders}
          />
        )}
      </AnimatePresence>

      <AddLocationModal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onAdd={handleAddLocation}
      />

      <EditLocationModal
        isOpen={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        onUpdate={handleUpdateLocation}
        location={editingLocation}
      />

      <DeleteLocationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onConfirm={handleDeleteLocation}
        location={deletingLocation}
      />

      <AddVendorModal
        isOpen={isAddVendorModalOpen}
        onClose={() => {
          setIsAddVendorModalOpen(false);
          setIsAddingVendor(false);
        }}
        onAdd={handleAddVendor}
        coordinates={newVendorCoords}
        mode={vendorModalMode}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        narrationCooldown={narrationCooldown}
        setNarrationCooldown={setNarrationCooldown}
        ttsRate={ttsRate}
        setTtsRate={setTtsRate}
        textSize={textSize}
        setTextSize={setTextSize}
        currentUser={currentUser}
        authHeaders={authHeaders}
      />

      <VendorBottomSheet
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onShare={() => showToast(t.linkCopied)}
        currentUser={currentUser}
        authHeaders={authHeaders}
        hasMap={!!(selectedLocation?.map_image_path &&
                   selectedLocation?.lat_nw != null &&
                   selectedLocation?.lon_nw != null &&
                   selectedLocation?.lat_se != null &&
                   selectedLocation?.lon_se != null)}
        onSetPinLocation={handleSetPinLocation}
        onVendorUpdated={handleVendorUpdated}
        tts={tts}
        ttsRate={ttsRate}
      />

      {/* GPS Low Accuracy Warning */}
      {showGpsWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t.gpsLowAccuracyTitle}</h3>
            <p className="text-gray-600 mb-4">{t.gpsLowAccuracyMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setAudioEnabled(false); setShowGpsWarning(false); }}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold"
              >
                {t.disable}
              </button>
              <button
                onClick={() => setShowGpsWarning(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-semibold"
              >
                {t.keepEnabled}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="absolute bottom-6 left-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
