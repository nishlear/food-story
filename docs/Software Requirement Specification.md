## **SRS — Software Requirements Specification**

**Product:** Food Street Audio Guide (Mobile-first Web PoC)  
**Document Version:** 1.0 (PoC)  
**Intended Platform:** Mobile browsers (iOS Safari, Android Chrome); web app (optionally add-to-home-screen)

---

## **1\. Introduction**

### **1.1 Purpose**

This SRS defines the functional and non-functional requirements for a Proof-of-Concept web application that displays a custom food street map with vendor/area icons and provides multilingual audio narration triggered manually or automatically based on GPS dwell/proximity rules.

### **1.2 Scope**

* Multi-food-street selection → custom map \+ icon overlays.  
* GPS-only (browser Geolocation) location features with explicit consent.  
* Manual narration always available; auto narration controlled by settings \+ dwell logic.  
* Multilingual UI content and multilingual narration with fallback behavior.  
* Data loaded from static JSON datasets per food street.

### **1.3 Definitions**

* **Food Street:** A curated walking area (dataset \+ custom map asset).  
* **Item:** A vendor or boundary area represented by an icon on the map.  
* **Auto Narration:** Audio that triggers after dwell time when eligible.  
* **Session:** From page load until tab/app is closed or refreshed (PoC definition).  
* **Boundary:** Geofence definition for vendor/area (polygon or center+radius or point+radius).

---

## **2\. Assumptions, Constraints, and Out-of-Scope**

### **2.1 Assumptions**

* SRS-A01: Default language exists per dataset (e.g., `defaultLanguage`).  
* SRS-A02: Location and settings are stored at least for session; cross-session persistence is optional (defined in requirements as an option).  
* SRS-A03: Google-derived fields may be cached/manual in JSON for PoC; live API retrieval is optional and requires permissions/quotas.  
* SRS-A04: Narration can be implemented via **pre-recorded audio**, **TTS**, or **hybrid**, without mandating a provider.

### **2.2 Constraints**

* SRS-C01: **GPS-only**; if permission denied: no tracking, no IP fallback.  
* SRS-C02: Web-only; may be added to home screen but remains web app.  
* SRS-C03: iOS autoplay restrictions may block auto audio until a user gesture unlocks audio playback.  
* SRS-C04: Custom map derived from Google imagery has legal/licensing risk; PoC must use a compliant approach (see NFR \+ Risks).

### **2.3 Out-of-Scope**

* Accounts/authentication, payment, ordering, reservations, UGC reviews, turn-by-turn navigation, background geofencing beyond browser capability.

---

## **3\. System Overview**

### **3.1 High-Level Architecture (Flexible)**

**Client (Web App / PWA-optional)**

* UI: street selection, map view, info panel, settings, language selector.  
* Data loader: fetch static JSON \+ map/icon assets.  
* Location module: browser Geolocation handling, accuracy gating, session-only storage.  
* Proximity/dwell engine: determines current boundary, dwell timer, triggers narration.  
* Narration module: audio playback orchestration; supports prerecorded/TTS/hybrid.  
* Translation module (optional): supports pre-authored translations and/or external translation.

**Optional Backend (Not required for PoC)**

* Could be added for: API key protection, caching translations/TTS, analytics aggregation.  
* If absent: all runs static-hosted; external services called directly from client (with security caveats).

**Data Store**

* Primary: static JSON files \+ assets hosted over HTTPS (CDN/static host).  
* Optional: session storage/local storage for settings/language (with privacy constraints).

---

## **4\. Functional Requirements (FR)**

Requirement IDs: **FR-001 …**  
“Shall” indicates mandatory for PoC unless explicitly marked optional.

### **4.1 Entry and Food Street Selection**

**FR-001 (Street List Display):** The system shall display a food street selection UI upon initial entry to the application.  
**FR-002 (Street Selection):** The system shall allow the user to select one food street from a list and transition to the selected street map experience.  
**FR-003 (Street Switching):** The system shall provide a “Change food street” control from the map experience that returns to the selection UI and allows switching streets.  
**FR-004 (Session Persistence):** The system shall remember the selected food street for the current session so that reload/navigation within the app retains the selection (unless user changes it).

### **4.2 Dataset Loading and Validation**

**FR-005 (Dataset Fetch):** The system shall load the selected food street dataset from a static JSON file at runtime.  
**FR-006 (Asset References):** The system shall load the referenced map image and icon assets as specified in the dataset.  
**FR-007 (Schema Validation):** The system shall validate the dataset against required fields on load and surface a user-friendly error state if validation fails.  
**FR-008 (Graceful Partial Data):** If non-critical optional fields (e.g., reviews samples) are missing, the system shall still render the map and show the remaining available information.

### **4.3 Custom Map Rendering and Icon Overlay**

**FR-009 (Map Display):** The system shall render a custom map image for the selected food street, scaled to the mobile viewport.  
**FR-010 (Icon Placement):** The system shall overlay interactive icons using dataset-provided coordinates and scaling rules.  
**FR-011 (Icon Types):** The system shall support item type `"vendor"` and `"area"` and render icons for both.  
**FR-012 (Tap Interaction):** The system shall allow users to tap an icon to select an item and open an info panel.  
**FR-013 (Selected State):** The system shall visually indicate the currently selected item on the map (e.g., highlight, pulse, or marker).

### **4.4 Info Panel Content**

**FR-014 (Info Panel Fields):** Upon item selection, the system shall display an info panel (e.g., bottom sheet) containing:

* Display name  
* Description (in current language, with fallback)  
* Google-derived fields (rating, price range/price level, review summary and/or sampled reviews) if available  
  **FR-015 (Explain Button):** The system shall display a prominent “Explain with audio” control for the currently selected item.  
  **FR-016 (Panel Update):** If the user selects a different icon, the info panel shall update to the newly selected item.

### **4.5 Location Permission and GPS-only Behavior**

**FR-017 (Permission Prompt Timing):** The system shall request GPS permission on first entry to the map experience or at another appropriate user-visible moment.  
**FR-018 (GPS Allowed Behavior):** If GPS permission is granted, the system shall:

* Start obtaining location updates  
* Display the user marker on the custom map (if mapping from geo to map is supported by dataset)  
* Enable location-based eligibility checks (subject to narration setting)  
  **FR-019 (GPS Denied Behavior):** If GPS permission is denied, the system shall:  
* Not obtain location updates  
* Not display the user marker  
* Not attempt any alternative location method (no IP fallback)  
* Continue allowing manual icon exploration and manual narration  
  **FR-020 (GPS Unavailable):** If the device/browser cannot provide GPS location, the system shall show a message and behave as GPS denied (manual-only).

### **4.6 Settings: Narrate Using Current Location**

**FR-021 (Settings UI):** The system shall provide a settings section containing a toggle: “Narrate using current location.”  
**FR-022 (Default Toggle State):** The system shall default the toggle to a defined value (PoC assumption: **Off** until user enables, to minimize surprise).  
**FR-023 (Toggle Enforcement):** When the toggle is Off, the system shall not trigger any auto narration based on proximity/entry/dwell, even if GPS is allowed.  
**FR-024 (Session Persistence):** The system shall persist the toggle state at least for the session.  
**FR-025 (Optional Cross-Session Persistence):** The system may persist the toggle state across sessions (e.g., local storage) if privacy constraints are met and clearly disclosed.

### **4.7 Language Selection and Multilingual Behavior**

**FR-026 (Language Control):** The system shall provide a language selection control accessible from the main map experience.  
**FR-027 (Supported Languages Config):** The system shall support a configurable list of supported languages (e.g., `supportedLanguages` in app config and/or dataset).  
**FR-028 (Text Update on Change):** When the user changes language, the currently displayed item description and other user-facing text shall update to the selected language (with fallback behavior).  
**FR-029 (Narration Language):** Manual and automatic narration shall use the currently selected language.  
**FR-030 (Language Change During Playback):** If the user changes language while narration is playing, the system shall stop the current narration and leave the user able to replay in the new language.  
**FR-031 (Fallback Text):** If a translation is unavailable, the system shall fall back to the dataset default language (or a defined fallback order) and indicate fallback subtly if needed (optional).

### **4.8 Narration (Manual \+ Automatic)**

**FR-032 (Manual Narration Trigger):** When the user taps “Explain with audio,” the system shall narrate the selected item in the current language.  
**FR-033 (Manual Available Without GPS):** Manual narration shall be available regardless of GPS permission outcome.  
**FR-034 (Auto Narration Eligibility):** Auto narration shall be eligible only when all conditions are met:

1. GPS permission granted  
2. “Narrate using current location” toggle enabled  
3. User is inside an item boundary  
4. Continuous dwell time ≥ configured dwell seconds  
5. Item not already narrated in current session  
   **FR-035 (No Repeat In-Session):** The system shall prevent repeating auto narration for the same item within the same session.  
   **FR-036 (Auto Narration and Selection):** When auto narration triggers, the system shall (a) select the item and (b) update the info panel to that item (unless a different item is actively being interacted with; see edge cases).  
   **FR-037 (Configurable Dwell Time):** Dwell time shall be configurable without changing core logic; default shall be between **8–10 seconds** (PoC default: 9s).  
   **FR-038 (Playback Controls):** The system shall provide basic audio controls: play/pause/stop (at least stop) and show playback state.

### **4.9 Proximity, Geofencing, and Mode Selection (Vendor vs Area)**

**FR-039 (Geo Boundary Types):** The system shall support:

* Vendor as point with radius (lat/lng \+ radius), OR  
* Area as polygon boundary, OR  
* Area as center point \+ radius  
  **FR-040 (Accuracy Threshold):** The system shall compare current GPS accuracy against a configurable threshold to decide whether to attempt per-vendor detection or fall back to area mode (if dataset provides both).  
  **FR-041 (Distance/Containment):** The system shall determine “inside boundary” by:  
* Point+radius: distance ≤ radius  
* Polygon: point-in-polygon containment  
  **FR-042 (Configurable Proximity Radius):** The system shall support configurable radius values (global default and per-item override).  
  **FR-043 (Configurable Update Rate):** The system shall use a configurable location polling/watch strategy to balance responsiveness and battery use (PoC default: watchPosition with reasonable options).

### **4.10 Session Memory and State Handling**

**FR-044 (Narrated Set):** The system shall maintain an in-session set of item IDs that have been auto-narrated and use it to enforce no-repeat logic.  
**FR-045 (State Reset):** The narrated set shall reset when the session ends (refresh/close), unless optional persistence is enabled explicitly (not required).

### **4.11 Error Handling and User Messages**

**FR-046 (Network/Load Failure):** If the dataset or assets fail to load, the system shall show a clear error state with retry and/or change street options.  
**FR-047 (GPS Errors):** If GPS errors occur (timeout, unavailable), the system shall show a message and continue in manual mode.  
**FR-048 (Narration Failure):** If narration cannot play (autoplay restriction, missing audio, TTS failure), the system shall show a user-friendly message and allow retry.  
**FR-049 (Translation Failure):** If translation cannot be obtained, the system shall fall back to default language and allow retry or continue.  
**FR-050 (Data Missing Fields):** If Google-derived fields are absent, the system shall hide those UI elements rather than showing broken placeholders.

---

## **5\. Non-Functional Requirements (NFR)**

Requirement IDs: **NFR-001 …**

### **5.1 Performance and Responsiveness**

**NFR-001:** The map experience shall maintain smooth interaction on modern mobile devices (target: responsive panning/zooming with minimal UI jank).  
**NFR-002:** Initial load time for a selected street (JSON \+ map \+ icons) should be optimized for mobile networks; large assets should be compressible and cacheable.  
**NFR-003:** Location and proximity evaluation should be efficient (avoid expensive computations at high frequency; use throttling/debouncing as needed).

### **5.2 Privacy**

**NFR-004:** The system shall request user consent for GPS via browser permission prompt and provide an in-app explanation of why location is requested.  
**NFR-005:** The system shall not store precise GPS locations persistently by default (session-only use).  
**NFR-006:** If external translation/narration services are used, the system shall disclose what text is transmitted and avoid sending precise location data.

### **5.3 Security**

**NFR-007:** The application shall be served over HTTPS.  
**NFR-008:** API keys (if any) shall not be exposed in client code unless acceptable for PoC; preferred options include a lightweight backend proxy or restricted keys (domain/IP restrictions where supported).  
**NFR-009:** The system should implement basic rate limiting / request throttling for external service calls (client-side and/or backend).

### **5.4 Accessibility**

**NFR-010:** Text shall be readable on mobile devices (sufficient font size/contrast per common mobile guidelines).  
**NFR-011:** Interactive controls shall be usable with screen readers (semantic labels for icons, buttons, language selector, settings toggle).  
**NFR-012:** Audio controls shall be accessible and provide clear state (playing/paused/stopped).

### **5.5 Reliability and Graceful Degradation**

**NFR-013:** The system shall degrade gracefully when GPS is denied/unavailable: manual exploration remains fully functional.  
**NFR-014:** The system shall degrade gracefully when GPS accuracy is poor by switching to area mode (if available) or suppressing auto narration with a user message.  
**NFR-015:** The system shall handle interruptions (incoming call, tab backgrounding) without corrupting session state; narration should stop/pause gracefully where the browser enforces it.

### **5.6 Compatibility (Mobile Browser Constraints)**

**NFR-016:** The system shall work on iOS Safari and Android Chrome within typical PWA/browser constraints (audio autoplay restrictions, background location limitations).  
**NFR-017:** The system shall not rely on IP geolocation or background services not supported by mobile browsers.

### **5.7 Legal/Licensing**

**NFR-018:** The custom map imagery approach shall be compliant with licensing/terms. If Google imagery is involved, the PoC shall prefer a schematic/team-created map or properly licensed alternatives.  
**NFR-019:** Google-derived review/rating/price data usage shall comply with Google’s applicable terms; live retrieval requires official APIs/permissions and must not be implemented via scraping.

---

## **6\. Data Requirements**

### **6.1 Dataset Organization**

* One JSON file per food street (e.g., `aquafina-foodstreet.json`)  
* Map image per food street (e.g., `aquafina-map.jpg/png/svg`)  
* Icon assets per item/type

### **6.2 JSON Schema Specification (PoC)**

Below is a **normative** schema-style definition (field names, types, constraints). Implementation may use JSON Schema formally, but is not required as long as validation meets FR-007.

#### **6.2.1 Top-Level Object: `FoodStreetDataset`**

* `schemaVersion` *(string, required)*: e.g., `"1.0"`  
* `street` *(object, required)*:  
  * `id` *(string, required)*: unique street identifier (slug recommended)  
  * `name` *(object or string, required)*:  
    * Option A (multilingual): language map `{ "en": "…", "vi": "…" }`  
    * Option B (single): `"Aquafina Food Street"`  
  * `city` *(object|string, optional)* (same multilingual option as `name`)  
  * `defaultLanguage` *(string, required)*: e.g., `"en"`  
  * `supportedLanguages` *(array, optional)*: if absent, app-level config applies  
* `map` *(object, required)*:  
  * `imageAsset` *(string, required)*: relative or absolute URL  
  * `aspectRatio` *(number, optional)*: width/height to aid layout  
  * `coordinateSystem` *(object, required)*:  
    * `type` *(string, required)*: `"normalized"` or `"pixel"`  
    * If `"normalized"`:  
      * coordinates in \[0..1\]  
    * If `"pixel"`:  
      * `widthPx` *(number, required)* and `heightPx` *(number, required)* for scaling  
  * `geoReference` *(object, optional but recommended if showing user dot)*:  
    * Defines mapping from lat/lng to map x/y.  
    * Acceptable PoC options (choose one per dataset):  
      * **Option 1: Two-point affine reference**  
        * `type`: `"twoPoint"`  
        * `topLeft`: `{ lat, lng, x, y }`  
        * `bottomRight`: `{ lat, lng, x, y }`  
      * **Option 2: Four-corner reference**  
        * `type`: `"fourCorner"` with four geo points mapped to four image points  
      * **Option 3: None**  
        * user dot disabled; proximity still works in geo space only  
* `items` *(array, required; min 1\)*:  
  * Each item adheres to `Item` schema below  
* `config` *(object, optional)*:  
  * `dwellSecondsDefault` *(number, optional; default 9\)*  
  * `proximityRadiusMetersDefault` *(number, optional; e.g., 15\)*  
  * `gpsAccuracyThresholdMeters` *(number, optional; e.g., 25\)*  
  * `modeSelection` *(object, optional)*:  
    * `preferVendorWhenAccuracyLeq` *(number)*  
    * `fallbackToArea` *(boolean)*

#### **6.2.2 Object: `Item`**

Required fields:

* `id` *(string, required)*: unique within dataset  
* `type` *(string, required)*: `"vendor"` or `"area"`  
* `displayName` *(object|string, required)*: multilingual map or single string  
* `iconAsset` *(string, required)*  
* `mapPoint` *(object, required)*:  
  * `x` *(number, required)*  
  * `y` *(number, required)*  
  * Constraints:  
    * normalized: 0 ≤ x,y ≤ 1  
    * pixel: 0 ≤ x ≤ widthPx and 0 ≤ y ≤ heightPx  
* `description` *(object, required)*:  
  * `text` *(object|string, required)*: multilingual map or single string  
  * `lastUpdated` *(string, optional)* ISO date  
* `google` *(object, optional)*:  
  * `placeId` *(string, optional)*  
  * `rating` *(number, optional; 0..5)*  
  * `priceLevel` *(integer, optional; e.g., 0..4)* OR `priceRangeText` *(string, optional; e.g., "$$")*  
  * `reviewSummary` *(object|string, optional)* (multilingual allowed)  
  * `sampleReviews` *(array, optional; max recommended 5\)*:  
    * `{ author?: string, rating?: number, text: object|string }`  
  * `dataSource` *(string, optional)*: e.g., `"cached" | "manual" | "googleApi"`  
    Geo fields (required for location features):  
* `geo` *(object, required)*:  
  * `boundaryType` *(string, required)*: `"pointRadius"` | `"polygon"` | `"centerRadius"`  
  * If `pointRadius`:  
    * `lat` *(number, required)*  
    * `lng` *(number, required)*  
    * `radiusMeters` *(number, optional; overrides default)*  
  * If `centerRadius`:  
    * `center`: `{ lat, lng }` *(required)*  
    * `radiusMeters` *(required)*  
  * If `polygon`:  
    * `polygon` *(array\<{lat:number,lng:number}\>, required; min 3\)*  
      Optional:  
* `audio` *(object, optional)*:  
  * For prerecorded approach: `files` as language map  
    * `files`: `{ "en": "audio/vendor1-en.mp3", "vi": "audio/vendor1-vi.mp3" }`  
  * For TTS approach: `ttsText` as language map or reference to description  
    * `ttsText`: `{ "en": "...", "vi": "..." }`  
  * `strategy` *(string, optional)*: `"prerecorded" | "tts" | "hybrid"`  
* `tags` *(array, optional)*

### **6.3 Example Dataset (Illustrative)**

{  
  "schemaVersion": "1.0",  
  "street": {  
    "id": "aquafina-foodstreet",  
    "name": { "en": "Aquafina Food Street", "vi": "Phố Ẩm Thực Aquafina" },  
    "city": { "en": "Ho Chi Minh City", "vi": "TP. Hồ Chí Minh" },  
    "defaultLanguage": "en",  
    "supportedLanguages": \["en", "vi", "zh"\]  
  },  
  "map": {  
    "imageAsset": "assets/maps/aquafina-map.png",  
    "coordinateSystem": { "type": "normalized" },  
    "geoReference": {  
      "type": "twoPoint",  
      "topLeft": { "lat": 10.7761, "lng": 106.7009, "x": 0.0, "y": 0.0 },  
      "bottomRight": { "lat": 10.7748, "lng": 106.7030, "x": 1.0, "y": 1.0 }  
    }  
  },  
  "config": {  
    "dwellSecondsDefault": 9,  
    "proximityRadiusMetersDefault": 15,  
    "gpsAccuracyThresholdMeters": 25,  
    "modeSelection": { "preferVendorWhenAccuracyLeq": 25, "fallbackToArea": true }  
  },  
  "items": \[  
    {  
      "id": "vnd-001",  
      "type": "vendor",  
      "displayName": { "en": "Bún Bò Corner", "vi": "Bún Bò Góc Phố" },  
      "iconAsset": "assets/icons/noodles.png",  
      "mapPoint": { "x": 0.42, "y": 0.63 },  
      "description": {  
        "text": {  
          "en": "Known for rich broth and fresh herbs.",  
          "vi": "Nổi tiếng với nước dùng đậm đà và rau thơm tươi."  
        }  
      },  
      "google": {  
        "placeId": "PLACE\_ID\_OPTIONAL",  
        "rating": 4.4,  
        "priceRangeText": "$$",  
        "reviewSummary": { "en": "Popular at night; fast service.", "vi": "Đông vào buổi tối; phục vụ nhanh." },  
        "dataSource": "cached"  
      },  
      "geo": {  
        "boundaryType": "pointRadius",  
        "lat": 10.7754,  
        "lng": 106.7019,  
        "radiusMeters": 12  
      },  
      "audio": {  
        "strategy": "hybrid",  
        "files": { "vi": "assets/audio/vnd-001-vi.mp3" },  
        "ttsText": { "en": "This spot is known for rich broth and fresh herbs." }  
      }  
    },  
    {  
      "id": "area-01",  
      "type": "area",  
      "displayName": { "en": "Night Snacks Zone", "vi": "Khu Ăn Vặt Buổi Tối" },  
      "iconAsset": "assets/icons/area.png",  
      "mapPoint": { "x": 0.70, "y": 0.35 },  
      "description": { "text": { "en": "A cluster of snack carts after 7pm.", "vi": "Cụm xe đẩy ăn vặt sau 19:00." } },  
      "geo": {  
        "boundaryType": "centerRadius",  
        "center": { "lat": 10.7758, "lng": 106.7025 },  
        "radiusMeters": 35  
      }  
    }  
  \]  
}

---

## **7\. External Interface Requirements**

### **7.1 Browser APIs**

**EI-001 (Geolocation):** Use the browser Geolocation API for GPS location (`getCurrentPosition` / `watchPosition`) with user permission.  
**EI-002 (Permissions):** Use the browser permissions model as available to infer/handle granted/denied states (implementation-dependent).  
**EI-003 (Audio Playback):** Use HTML5 audio APIs for playback control and state events.  
**EI-004 (Storage):** Use session storage for session persistence; optional local storage for cross-session settings (if enabled).

### **7.2 Optional External Services (Not Mandated)**

**EI-005 (Google Data):** If implemented, Google rating/reviews/price range retrieval shall use official Google APIs with proper permissions, quotas, and terms; otherwise dataset must provide cached/manual fields.  
**EI-006 (Translation Service):** If used, translation requests shall send only the text required for translation and exclude precise location; handle quota/latency/failure gracefully.  
**EI-007 (Narration Service/TTS):** If TTS is used, send only narration text and language; handle failures with fallback (e.g., show text, allow manual replay).

---

## **8\. UI Requirements**

### **8.1 Key Screens / Components**

**UI-001 Street Selection Screen**

* List of food streets (search optional)  
* Select → loads map  
* Basic loading/error state

**UI-002 Map Screen**

* Custom map image (pan/zoom optional but recommended)  
* Icon overlays  
* “Change food street” button  
* Language selector control  
* Settings access (inline or modal)  
* GPS permission prompt messaging (pre-permission explanation recommended)  
* User marker (only when GPS allowed and map geoReference supports mapping)

**UI-003 Info Panel (Bottom Sheet/Panel)**

* Item name  
* Google rating/price/reviews summary/sample (if present)  
* Description text (current language)  
* “Explain with audio” button  
* Audio state indicator (playing/paused/stopped)  
* Error messaging area for narration failures

**UI-004 Settings Panel**

* Toggle: “Narrate using current location”  
* Optional: display current dwell time / accuracy info (read-only for PoC)  
* Privacy note: location usage session-only

### **8.2 UI State Requirements**

**UI-STATE-001 Loading:** Show spinner/skeleton while dataset/assets load.  
**UI-STATE-002 GPS Denied:** Show “GPS not enabled” message; hide user marker; keep manual exploration.  
**UI-STATE-003 GPS Allowed:** Show user marker; show accuracy indicator optionally.  
**UI-STATE-004 Poor Accuracy:** Show non-blocking message; switch to area mode or suppress auto narration per config.  
**UI-STATE-005 Narration Playing:** Show stop/pause control and playing state.  
**UI-STATE-006 Error:** Provide actionable retry and/or change street.

---

## **9\. Location, Proximity, and Dwell Algorithm Specification (PoC)**

### **9.1 Inputs**

* Location updates: `{lat, lng, accuracyMeters, timestamp}`  
* Config:  
  * `dwellSeconds` (default 9\)  
  * `proximityRadiusMetersDefault` (e.g., 15\)  
  * `gpsAccuracyThresholdMeters` (e.g., 25\)  
  * Mode selection rules (vendor vs area)  
* Item boundaries from dataset (`geo`)

### **9.2 Mode Selection (Vendor vs Area)**

**Algorithm (high-level):**

1. If GPS not allowed → skip.  
2. If accuracyMeters ≤ threshold:  
   * Prefer evaluating **vendor items** if present; else evaluate areas.  
3. If accuracyMeters \> threshold:  
   * Evaluate **area items** if present and fallback allowed; else suppress auto narration and notify user (“GPS accuracy too low for auto narration”).

### **9.3 Inside-Boundary Evaluation**

* **Point+radius / Center+radius:** compute distance between user and center; inside if `distanceMeters ≤ radiusMeters`.  
* **Polygon:** use point-in-polygon check (geodesic approximation acceptable for PoC at small scale).

### **9.4 Dwell Detection (Continuous)**

Maintain an “active candidate item” state:

* `currentCandidateId`  
* `enteredAtTimestamp`  
* `lastInsideTimestamp`  
* `alreadyNarratedSet`

**Logic on each location update:**

1. Determine `insideItemId` (single best match):  
   * If multiple matches, select the smallest boundary (or highest priority) to reduce ambiguity.  
2. If `insideItemId` changes:  
   * Reset dwell timer (`enteredAtTimestamp = now`, set candidate).  
3. If still inside same item:  
   * If `now - enteredAtTimestamp ≥ dwellSeconds` AND item not in `alreadyNarratedSet` AND narration toggle enabled:  
     * Trigger auto narration once  
     * Add item to `alreadyNarratedSet`  
4. If user leaves all boundaries:  
   * Clear `currentCandidateId`

### **9.5 Anti-Jitter (PoC Recommended)**

* Apply a small “exit hysteresis”:  
  * Require the user to be outside boundary for `exitConfirmMs` (e.g., 1000–2000 ms) before clearing candidate, to avoid GPS noise.  
* Throttle boundary checks to a reasonable interval (e.g., 500–1000 ms), even if GPS updates faster.

### **9.6 Session No-Repeat**

* Store narrated IDs in memory for the session.  
* Auto narration checks `alreadyNarratedSet.has(itemId)`.

---

## **10\. Acceptance Criteria (Testable) for Key Requirements**

These are **system acceptance** tests aligned to FR/NFR.

### **10.1 Street Selection**

* **AC-001:** On first load, user sees list of food streets and must select one to access map.  
* **AC-002:** Selecting a street loads corresponding map image and icons from its JSON.  
* **AC-003:** “Change food street” returns user to selection and resets map content to the newly selected street.

### **10.2 GPS Permission and Behavior**

* **AC-004:** If user denies GPS permission, app shows map without user marker and does not attempt any other location method.  
* **AC-005:** If user grants GPS permission, app displays user marker (when geoReference exists) and starts proximity evaluation.  
* **AC-006:** If GPS becomes unavailable mid-session, app falls back to manual-only and informs the user.

### **10.3 Settings Toggle**

* **AC-007:** With toggle Off, auto narration never triggers even if GPS allowed and user dwells in boundary.  
* **AC-008:** With toggle On and GPS allowed, user dwelling ≥ dwellSeconds triggers auto narration once per item per session.

### **10.4 Proximity \+ Dwell**

* **AC-009:** Auto narration triggers only after continuous dwell ≥ configured dwell time (default 8–10 seconds).  
* **AC-010:** Leaving the boundary before dwell time completes prevents auto narration.  
* **AC-011:** Re-entering an already narrated item in the same session does not trigger auto narration again.

### **10.5 Manual Narration**

* **AC-012:** Tapping “Explain with audio” plays narration for currently selected item regardless of GPS permission.  
* **AC-013:** If narration fails to start (e.g., autoplay restriction), user sees a clear message and can retry via user gesture.

### **10.6 Multilingual**

* **AC-014:** Changing language updates currently visible item description immediately (with fallback if missing).  
* **AC-015:** Manual narration uses selected language after switching.  
* **AC-016:** If language is changed during playback, current narration stops and user can replay in the new language.

### **10.7 Error Handling**

* **AC-017:** Missing JSON or asset load failure shows an error state with Retry and Change Street options.  
* **AC-018:** Missing Google-derived fields do not break UI; fields are hidden or shown as “not available” gracefully.  
* **AC-019:** Translation failure falls back to default language and does not block map usage.

---

## **11\. Edge Cases and Error States**

**EC-001 Poor GPS Accuracy:** Indicate low accuracy; switch to area mode or suppress auto narration per config.  
**EC-002 Rapid Boundary Flapping:** Use hysteresis and dwell reset logic to avoid repeated triggers.  
**EC-003 Multiple Boundaries Match:** Choose best match via priority rule (e.g., smallest radius/area or explicit `priority` optional field).  
**EC-004 Audio Autoplay Blocked:** Show “Tap to enable audio” prompt; require user gesture before auto narration attempts.  
**EC-005 User Interacting with Different Item When Auto Triggers:** If user has an info panel open for another item, either:

* Option A: Do not interrupt; queue a non-intrusive prompt “You are near X — tap to hear” (recommended for UX), or  
* Option B: Auto-switch selection and play (allowed for PoC but may feel intrusive).  
  (Implementer choice; must be consistent and documented in app behavior.)  
  **EC-006 Language Missing for an Item:** Fallback to default language and optionally show a small indicator (e.g., “Showing English”).  
  **EC-007 Dataset Has No geoReference:** User marker cannot be placed on map; proximity logic still works in geo space; app should hide marker and continue narration logic (if desired) or disable marker-only.

---

## **12\. Logging and Analytics Plan (PoC-Minimal)**

**LOG-001:** Log key events (client-side) with timestamps:

* Street selected / changed  
* GPS permission granted/denied  
* GPS accuracy samples (coarse; do not log raw lat/lng unless explicitly approved—PoC default: do not)  
* Item selected (icon tap)  
* Manual narration requested / success / failure reason  
* Auto narration eligibility checks and trigger events  
* Language changed  
* Dataset load success/failure and validation errors  
  **LOG-002:** Logs may be stored in-memory and optionally exported (e.g., download JSON) for PoC evaluation.  
  **LOG-003:** If external analytics is used, do not send precise location; keep events anonymous and session-scoped.

---

## **13\. Deployment Assumptions**

**DEP-001:** Hosted as a static site over HTTPS (CDN/static hosting acceptable).  
**DEP-002:** JSON datasets and assets served from same origin or CORS-enabled endpoints.  
**DEP-003:** If external services are used (translation/TTS/Google APIs), deployment must address API key protection (preferred via backend proxy or restricted keys).  
**DEP-004:** Version datasets with `schemaVersion`; enable rollback by hosting multiple versions.

---

## **14\. Traceability Notes**

* BRD BR-001 ↔ FR-001..FR-004  
* BRD BR-002 ↔ FR-009..FR-013  
* BRD BR-007 ↔ FR-034..FR-043, Section 9  
* BRD BR-008 ↔ FR-026..FR-031  
* NFRs enforce PoC constraints (privacy, iOS restrictions, licensing).

---

next step: build demo in figma