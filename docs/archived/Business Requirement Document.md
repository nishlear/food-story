## **BRD — Business Requirements Document**

**Product:** Food Street Audio Guide (Mobile-first Web PoC)  
**Document Version:** 1.0 (PoC)  
**Audience:** University project team (Product/BA/Engineering)  
**Scope:** Proof-of-Concept web application for iOS/Android browsers

---

## **1\. Executive Summary**

The Food Street Audio Guide is a mobile-first web application that helps visitors explore a selected “food street” by presenting a custom map with vendor/area icons and delivering narrated explanations. If users allow GPS permissions, the app can automatically narrate when users dwell at a vendor/area for a configurable time. Users can always tap icons to view details and manually trigger narration via “Explain with audio.” The app supports multilingual UI content and multilingual narration.

---

## **2\. Problem Statement**

Visitors on a food street often do not know the background, specialties, or significance of nearby vendors/areas. They need a simple, hands-free way to discover vendor/area information while walking, without installing a native app.

---

## **3\. Goals and Objectives**

### **3.1 Goals**

1. Provide an intuitive, mobile-first map experience for a selected food street.  
2. Enable audio narration for vendors/areas, both manually and automatically (when GPS allowed and setting enabled).  
3. Support multiple languages for on-screen content and narration.  
4. Demonstrate feasibility using static datasets (JSON) per food street.

### **3.2 Objectives (PoC-Level)**

* Visitors can select a food street and explore icons on a custom map.  
* Visitors can opt into GPS-only tracking to see their location and enable proximity/dwell narration.  
* Automatic narration triggers only after dwell time and only once per item per session.  
* Language switching updates visible text and narration language.  
* The solution degrades gracefully when GPS is denied/unavailable or when narration/translation fails.

---

## **4\. Scope**

### **4.1 In-Scope**

* Food street selection on entry; ability to change food street.  
* Custom map rendering per selected food street with icon overlays.  
* Vendor/area icon tap → info panel showing rating/price range/reviews \+ description.  
* “Explain with audio” manual narration for selected vendor/area.  
* GPS permission request; GPS-only behavior (no IP fallback).  
* Settings toggle: “Narrate using current location.”  
* Proximity \+ dwell-time logic for auto narration (default dwell 8–10s, configurable).  
* Session memory: do not repeat narration for the same item in the same session.  
* Multilingual support:  
  * Language selector accessible from map experience  
  * UI text and narration follow selected language  
  * Defined behavior when language changes mid-narration  
* Static JSON datasets per food street, loaded at runtime.  
* Basic error handling and user messaging for: GPS denied/unavailable, missing data, network failure, translation/narration failure.

### **4.2 Out-of-Scope (PoC)**

* Native mobile apps (iOS/Android) or app-store distribution.  
* User accounts, login, personalization across devices.  
* Saving visit history beyond the active session (unless optional stretch).  
* Crowdsourced reviews, user-generated content, or submitting feedback to vendors.  
* Payments, ordering, reservations, loyalty, coupons.  
* Turn-by-turn navigation / routing.  
* IP-based location, Wi-Fi location, BLE beacons, or background geofencing beyond browser capabilities.  
* Guaranteed offline mode (may be partially possible with caching, but not required).  
* Real-time Google Reviews scraping (must use official APIs/permissions or cached/manual values).

---

## **5\. Target Users and Personas (Generic)**

Note: University PoC; no external stakeholders.

### **5.1 Personas**

* **P1: First-time Visitor**  
  * Wants quick understanding of what’s nearby; prefers audio while walking.  
  * Often hesitant to grant GPS permission.  
* **P2: Food Enthusiast / Explorer**  
  * Enjoys deeper descriptions and reviews; likely to try multiple vendors.  
  * Switches languages (tourist use case).  
* **P3: Accessibility-Focused User**  
  * Prefers audio-first content; needs readable UI and basic screen reader compatibility.

---

## **6\. User Journeys (Core)**

### **J1 — Entry and Food Street Selection**

1. User opens web app.  
2. App prompts selection of current food street from list.  
3. User selects a food street → app loads custom map \+ dataset.  
4. User can later tap “Change food street” to switch.

### **J2 — GPS Allowed (Location-based Narration)**

1. On entering map (or appropriate moment), app requests GPS permission.  
2. User allows → user marker appears.  
3. If “Narrate using current location” enabled:  
   * User approaches vendor/area boundary.  
   * After dwelling inside boundary for configured dwell time (default 8–10s), narration auto-plays once.  
4. User can also tap icons and manually play narration.

### **J3 — GPS Denied (Manual Exploration Only)**

1. App requests GPS permission.  
2. User denies → no location tracking, no user marker, no auto narration.  
3. User taps icons to view info and plays narration manually.

### **J4 — Language Switching**

1. User opens language selector and chooses a language.  
2. Any displayed vendor/area text updates to chosen language.  
3. Narration uses chosen language for future playback/auto narration.  
4. If narration is playing during a language change: the system stops current narration; user can replay in the new language.

---

## **7\. Business Requirements (High-Level) with IDs**

### **BR-001 — Food Street Selection and Switching**

The system shall allow users to select a food street on entry and switch food streets during the session.

### **BR-002 — Custom Map Experience**

The system shall display a custom map for the selected food street and overlay interactive icons for vendors/areas.

### **BR-003 — Vendor/Area Information Presentation**

The system shall display vendor/area details on icon tap, including description and Google-derived fields (rating, price range, reviews summary/sample).

### **BR-004 — Manual Narration**

The system shall allow users to trigger narration for the selected vendor/area via “Explain with audio,” regardless of GPS permission.

### **BR-005 — GPS-Only Permissioned Location Features**

The system shall request GPS permission and, only if granted, show user position and enable location-based narration features. If denied, no location tracking and no alternate location methods.

### **BR-006 — Settings-Controlled Auto Narration**

The system shall provide a “Narrate using current location” toggle controlling whether auto narration may occur.

### **BR-007 — Proximity and Dwell Logic for Auto Narration**

The system shall auto-narrate only when the user remains within a vendor/area boundary continuously for a configurable dwell time, and only once per vendor/area per session.

### **BR-008 — Multilingual UI and Narration**

The system shall support multiple languages for both on-screen content and narration, with configurable supported languages and clear fallback behavior.

### **BR-009 — Content/Data Loading via Static Datasets**

The system shall load food street content from static JSON datasets and map assets at runtime.

### **BR-010 — PoC-Appropriate Privacy and Compliance**

The system shall obtain user consent for GPS, avoid persistent storage of precise location (session-only preferred), and treat Google-derived data and map imagery with legal/licensing constraints.

---

## **8\. Success Metrics (PoC-Appropriate)**

1. **Completion Rate:** % of sessions that successfully select a food street and load the map (target: high).  
2. **Engagement:** average number of icon taps per session.  
3. **Audio Usage:** % sessions where “Explain with audio” is used at least once.  
4. **Auto Narration Effectiveness (GPS allowed):**  
   * % of GPS-allowed sessions where at least one auto narration triggers.  
   * False-trigger rate observed during testing (qualitative \+ log-based).  
5. **Language Feature Adoption:** % sessions that switch language; successful narration after switch.  
6. **Stability:** error rate for JSON loading / GPS acquisition / narration start.

---

## **9\. Assumptions**

* A1. Users access the app via mobile browsers (iOS Safari / Android Chrome); desktop support is not a primary goal.  
* A2. GPS accuracy is “good enough” for PoC in typical outdoor conditions; when accuracy is poor, the dataset may use area boundaries instead of per-vendor boundaries.  
* A3. Food street datasets are curated by the project team and shipped as static JSON \+ assets.  
* A4. Google rating/reviews/price range can be represented as cached/manual values in PoC; any live retrieval depends on official Google APIs, quotas, permissions, and terms.  
* A5. Location data is used transiently for features and is not stored persistently by default (session-only).  
* A6. Supported languages list is small for PoC (e.g., 2–5) and configurable.  
* A7. Audio narration can be produced either via pre-recorded audio assets or TTS; PoC may choose the simplest feasible path while keeping the requirements flexible.

---

## **10\. Constraints**

* C1. GPS-only: no IP geolocation fallback. If denied, the app remains functional without location-based features.  
* C2. Web app only; may be added to Home Screen but remains a web app.  
* C3. iOS autoplay restrictions: narration must be initiated by a user gesture at least once (commonly required); auto narration may require prior user interaction depending on browser policy.  
* C4. Map imagery licensing: “redrawn/cropped from Google Maps imagery” introduces legal risk; PoC must adopt a safe approach (see Risks/Mitigations).  
* C5. Configurable parameters must be adjustable without refactoring core logic (dwell time, proximity radius, GPS accuracy thresholds, supported languages).

---

## **11\. Risks and Mitigations**

### **R-001 — Map Imagery Licensing / Terms of Use**

* **Risk:** Cropping/redrawing directly from Google Maps imagery may violate licensing/terms.  
* **Mitigations (PoC-safe options):**  
  * Use a custom-drawn schematic map (vector/illustration) created by the team.  
  * Use open-licensed map sources (where permitted) and generate a custom style image.  
  * Use Google Maps only via official embed/API with proper attribution (but this may conflict with “custom map” requirement; use only if compliant).

### **R-002 — GPS Accuracy Variability on “Food Street”**

* **Risk:** Urban canyons/crowds reduce accuracy; could trigger wrong vendor narration.  
* **Mitigations:**  
  * Provide “area mode” boundaries with fewer larger zones.  
  * Use configurable GPS accuracy threshold to switch to area mode or suppress auto narration.  
  * Add hysteresis/cooldown and dwell requirement to reduce false triggers.

### **R-003 — Mobile Browser Autoplay Restrictions**

* **Risk:** Auto narration may not play without prior user interaction.  
* **Mitigations:**  
  * Require a first-time user gesture (“Enable audio”) to unlock playback.  
  * If auto narration is blocked, show a prompt/toast to tap “Play” rather than failing silently.

### **R-004 — External Service Limits for Translation/Narration**

* **Risk:** API cost, quota limits, latency, or privacy concerns.  
* **Mitigations:**  
  * Allow pre-authored translations and/or pre-recorded audio in dataset.  
  * Cache translations/audio per session.  
  * Clearly document what data is sent externally and protect API keys.

### **R-005 — Google Reviews/Ratings Access Constraints**

* **Risk:** Official APIs require billing, quotas, place IDs; scraping is not acceptable.  
* **Mitigations:**  
  * For PoC, store cached/manual values in JSON.  
  * Treat live retrieval as optional integration with clear prerequisites.

### **R-006 — Data Quality / Maintenance Burden**

* **Risk:** JSON schema inconsistencies or missing translations break UI.  
* **Mitigations:**  
  * Define strict schema \+ validation checks at load time.  
  * Provide fallbacks to default language and graceful missing-field handling.

---

## **12\. Dependencies**

* D1. Browser Geolocation API availability and user permission.  
* D2. Map assets (images/icons) hosted and accessible.  
* D3. Static JSON datasets hosted and accessible.  
* D4. Optional: Translation and/or narration service (if not using fully pre-authored content).  
* D5. Optional: Google Places APIs (if attempting live rating/reviews/price data) with required permissions/billing.

---

## **13\. Acceptance Criteria (Business-Level)**

1. **Food Street Selection:** Users can select a food street and see the correct map and icons.  
2. **GPS Denied Flow:** If GPS permission is denied, the app does not request alternate location methods, does not show a user marker, and still allows icon tap \+ manual audio.  
3. **GPS Allowed Flow:** If GPS is allowed, the user marker displays and location-based features are available subject to the narration setting.  
4. **Auto Narration Rule:** Auto narration triggers only if GPS allowed \+ narration setting enabled \+ user dwells in boundary for dwell time \+ not previously narrated in-session.  
5. **No Repeat Narration:** The same vendor/area is not auto-narrated more than once per session.  
6. **Manual Narration Always Works:** “Explain with audio” works for the currently selected vendor/area even if GPS is denied.  
7. **Multilingual:** Switching language updates visible description and subsequent narration language; if switching during narration, current narration stops and user can replay in the new language.  
8. **Resilience:** Missing data or failures (GPS, JSON load, narration/translation) show a user-friendly message and preserve core exploration where possible.

---

## **14\. Business Rules Summary (Traceability-Friendly)**

* **BRULE-001:** GPS denied → no tracking, no user marker, no auto narration, no alternative geolocation.  
* **BRULE-002:** Auto narration eligibility requires: GPS allowed AND narration toggle enabled.  
* **BRULE-003:** Auto narration triggers only after continuous dwell ≥ configured dwell seconds.  
* **BRULE-004:** No repeat auto narration per item per session.  
* **BRULE-005:** Language change updates UI text immediately; narration follows selected language; changing during playback stops current narration.

