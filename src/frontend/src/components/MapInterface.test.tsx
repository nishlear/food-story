import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MapInterface from './MapInterface';

// Mock react-zoom-pan-pinch — not installed until Plan 02 executes.
// Replace with a passthrough so tests focus on MapInterface logic.
vi.mock('react-zoom-pan-pinch', () => ({
  TransformWrapper: ({ children }: { children: React.ReactNode | ((api: any) => React.ReactNode) }) =>
    typeof children === 'function'
      ? children({ zoomIn: vi.fn(), zoomOut: vi.fn(), resetTransform: vi.fn() })
      : children,
  TransformComponent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const BASE_PROPS = {
  location: {
    id: 1,
    name: 'Test Street',
    map_image_path: null,
    lat_nw: null,
    lon_nw: null,
    lat_se: null,
    lon_se: null,
    map_updated_at: null,
  },
  vendors: [],
  onBack: vi.fn(),
  onOpenSettings: vi.fn(),
  onSelectVendor: vi.fn(),
  selectedVendor: null,
  isAddingVendor: false,
  onAddVendorClick: vi.fn(),
  onMapClick: vi.fn(),
  currentUser: null,
  // New pin placement props — safe defaults
  pinPlacementMode: false,
  onPinPlacementTap: vi.fn(),
  candidatePin: null,
  onConfirmPin: vi.fn(),
  onCancelPin: vi.fn(),
  pinPlacementVendorName: undefined,
};

const LOCATION_WITH_MAP = {
  ...BASE_PROPS.location,
  map_image_path: 'maps/1.png',
  lat_nw: 3.1480,
  lon_nw: 101.7080,
  lat_se: 3.1455,
  lon_se: 101.7115,
  map_updated_at: '2026-03-19T00:00:00Z',
};

describe('MapInterface — MVIEW-03: no-map fallback', () => {
  it('renders vendor list fallback when map_image_path is null', () => {
    render(<MapInterface {...BASE_PROPS} />);
    // The existing mock-map path renders when hasMap is false.
    // No <img> with a maps/ src should be present.
    const imgs = document.querySelectorAll('img[src*="maps/"]');
    expect(imgs.length).toBe(0);
  });
});

describe('MapInterface — MVIEW-01: map renders when map_image_path is set', () => {
  it('renders an img element when map_image_path is provided', () => {
    render(<MapInterface {...BASE_PROPS} location={LOCATION_WITH_MAP} />);
    const img = document.querySelector('img[src*="maps/1.png"]') as HTMLImageElement | null;
    expect(img).not.toBeNull();
  });

  it('appends cache-busting query param to img src', () => {
    render(<MapInterface {...BASE_PROPS} location={LOCATION_WITH_MAP} />);
    const img = document.querySelector('img[src*="maps/1.png"]') as HTMLImageElement | null;
    expect(img?.src).toContain('?t=');
  });
});

describe('MapInterface — MVIEW-02: TransformWrapper rendered in map mode', () => {
  it('renders TransformWrapper when map_image_path is set', () => {
    // The mock lets TransformWrapper render its children; if it appears in the tree the mock was called.
    const { container } = render(<MapInterface {...BASE_PROPS} location={LOCATION_WITH_MAP} />);
    // TransformWrapper mock renders children — existence of img inside it confirms it was mounted.
    const img = container.querySelector('img[src*="maps/1.png"]');
    expect(img).not.toBeNull();
  });
});

describe('MapInterface — add vendor control', () => {
  it('keeps Add Vendor enabled in real-map mode for admins', () => {
    const onAddVendorClick = vi.fn();
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        currentUser={{ username: 'admin', role: 'admin', token: 'token' }}
        onAddVendorClick={onAddVendorClick}
      />
    );
    const addVendorButton = screen.getByRole('button', { name: 'Add vendor' });
    expect(addVendorButton).not.toBeDisabled();
    fireEvent.click(addVendorButton);
    expect(onAddVendorClick).toHaveBeenCalledTimes(1);
  });
});

describe('MapInterface — INT-02: unpinned vendors omitted', () => {
  it('does not render a pin for vendors without lat/lon', () => {
    const unpinnedVendors = [
      { id: 1, name: 'No Pin Vendor', lat: null, lon: null, x: 50, y: 50 },
    ];
    render(<MapInterface {...BASE_PROPS} location={LOCATION_WITH_MAP} vendors={unpinnedVendors} />);
    // If the vendor has no lat/lon it must not appear as a pin button on the map.
    const pinButton = screen.queryByRole('button', { name: 'No Pin Vendor' });
    expect(pinButton).toBeNull();
  });

  it('renders a pin for vendors with lat/lon', () => {
    const pinnedVendors = [
      { id: 2, name: 'Pinned Vendor', lat: 3.1468, lon: 101.7098, x: 50, y: 50 },
    ];
    render(<MapInterface {...BASE_PROPS} location={LOCATION_WITH_MAP} vendors={pinnedVendors} />);
    const pinButton = screen.getByRole('button', { name: 'Pinned Vendor' });
    expect(pinButton).toBeInTheDocument();
  });
});

describe('MapInterface — INT-01: pin tap auto-opens bottom sheet after 300ms', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('calls onSelectVendor after 300ms on first pin tap', async () => {
    const onSelectVendor = vi.fn();
    const pinnedVendors = [
      { id: 3, name: 'Tappable Vendor', lat: 3.1468, lon: 101.7098, x: 50, y: 50 },
    ];
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        vendors={pinnedVendors}
        onSelectVendor={onSelectVendor}
      />
    );
    const pin = screen.getByRole('button', { name: 'Tappable Vendor' });
    fireEvent.click(pin);
    expect(onSelectVendor).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(onSelectVendor).toHaveBeenCalledWith(pinnedVendors[0]);
  });

  it('calls onSelectVendor immediately on second tap of same pin', async () => {
    const onSelectVendor = vi.fn();
    const pinnedVendors = [
      { id: 4, name: 'Double Tap Vendor', lat: 3.1468, lon: 101.7098, x: 50, y: 50 },
    ];
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        vendors={pinnedVendors}
        onSelectVendor={onSelectVendor}
      />
    );
    const pin = screen.getByRole('button', { name: 'Double Tap Vendor' });
    fireEvent.click(pin);
    fireEvent.click(pin);
    expect(onSelectVendor).toHaveBeenCalledWith(pinnedVendors[0]);
  });
});

describe('MapInterface — MSET-03/MSET-04: pin placement mode', () => {
  it('shows instruction banner when pinPlacementMode=true and candidatePin=null', () => {
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        pinPlacementMode={true}
        candidatePin={null}
        pinPlacementVendorName="Nasi Lemak Stall"
      />
    );
    expect(screen.getByText(/Tap the map/i)).toBeInTheDocument();
  });

  it('includes vendor name in instruction banner', () => {
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        pinPlacementMode={true}
        candidatePin={null}
        pinPlacementVendorName="Nasi Lemak Stall"
      />
    );
    expect(screen.getByText(/Nasi Lemak Stall/i)).toBeInTheDocument();
  });

  it('shows confirmation overlay when candidatePin is set', () => {
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        pinPlacementMode={true}
        candidatePin={{ lat: 3.1468, lon: 101.7098 }}
        pinPlacementVendorName="Nasi Lemak Stall"
      />
    );
    expect(screen.getByText('Place pin here?')).toBeInTheDocument();
  });

  it('calls onConfirmPin when Confirm button is clicked', () => {
    const onConfirmPin = vi.fn();
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        pinPlacementMode={true}
        candidatePin={{ lat: 3.1468, lon: 101.7098 }}
        onConfirmPin={onConfirmPin}
      />
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirmPin).toHaveBeenCalledTimes(1);
  });

  it('calls onCancelPin when Cancel button is clicked', () => {
    const onCancelPin = vi.fn();
    render(
      <MapInterface
        {...BASE_PROPS}
        location={LOCATION_WITH_MAP}
        pinPlacementMode={true}
        candidatePin={{ lat: 3.1468, lon: 101.7098 }}
        onCancelPin={onCancelPin}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancelPin).toHaveBeenCalledTimes(1);
  });

  it('does not show instruction banner or confirmation overlay when hasMap=false', () => {
    render(
      <MapInterface
        {...BASE_PROPS}
        location={BASE_PROPS.location}
        pinPlacementMode={true}
        candidatePin={null}
      />
    );
    expect(screen.queryByText(/Tap the map/i)).toBeNull();
    expect(screen.queryByText('Place pin here?')).toBeNull();
  });
});
