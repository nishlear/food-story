# Sequence Diagrams

## 1. User Login

```mermaid
sequenceDiagram
    actor U as User
    participant LS as LoginScreen
    participant App as App.tsx
    participant API as Backend API

    U->>LS: Enter username & password
    U->>LS: Click "Login"
    LS->>API: POST /api/auth/login {username, password}
    alt credentials valid
        API-->>LS: {username, role, token}
        LS->>App: onLogin(user)
        App->>App: setCurrentUser(user)\nsetCurrentScreen("location")
        App-->>U: Transition → LocationSelection
    else credentials invalid
        API-->>LS: 401 Unauthorized
        LS-->>U: Show error message
    end
```

## 2. User Registration

```mermaid
sequenceDiagram
    actor U as User
    participant LS as LoginScreen
    participant RF as RegisterForm
    participant API as Backend API
    participant App as App.tsx

    U->>LS: Click "Register"
    LS-->>U: Show RegisterForm
    U->>RF: Fill username & password
    U->>RF: Click "Register"
    RF->>API: POST /api/auth/register {username, password}
    alt username available
        API-->>RF: {username, role:"user", token}
        RF->>App: onLogin(user)
        App->>App: setCurrentUser(user)\nsetCurrentScreen("location")
        App-->>U: Transition → LocationSelection
    else username taken
        API-->>RF: 400 Bad Request
        RF-->>U: Show "Username already taken"
    end
```

## 3. Browse Locations and Select a Street

```mermaid
sequenceDiagram
    actor U as User
    participant App as App.tsx
    participant LC as LocationSelection
    participant API as Backend API

    App->>App: setCurrentScreen("location")
    App->>LC: render with currentUser
    LC->>API: GET /api/streets\nX-Role-Token: <token>
    API-->>LC: [{id, name, city, vendors_count, ...}]
    LC-->>U: Display street list

    U->>LC: Tap a street
    LC->>App: onSelectLocation(street)
    App->>App: setSelectedLocation(street)\nsetCurrentScreen("map")
    App-->>U: Transition → MapInterface
```

## 4. View Map and Vendor Details

```mermaid
sequenceDiagram
    actor U as User
    participant MI as MapInterface
    participant App as App.tsx
    participant API as Backend API
    participant VBS as VendorBottomSheet

    App->>MI: render with selectedLocation
    MI->>API: GET /api/streets/:id/vendors\nX-Role-Token: <token>
    API-->>MI: [{id, name, lat, lon, x, y, rating, ...}]

    alt location has bbox + map image
        MI-->>U: Show real map PNG with pins projected by lat/lon
    else no bbox
        MI-->>U: Show mock map with pins at x/y percentages
    end

    U->>MI: Tap vendor pin
    MI->>App: setSelectedVendor(vendor)
    App-->>VBS: render VendorBottomSheet
    VBS->>API: GET /api/vendors/:vendorId/comments\nX-Role-Token: <token>
    API-->>VBS: [{id, username, rating, body, created_at}]
    VBS-->>U: Show vendor info + comments
```

## 5. Submit a Comment / Rating

```mermaid
sequenceDiagram
    actor U as User
    participant VBS as VendorBottomSheet
    participant VRF as VendorRateForm
    participant API as Backend API

    U->>VBS: Click "Leave a Review"
    VBS-->>VRF: Show VendorRateForm
    U->>VRF: Select rating (1-5) & write comment
    U->>VRF: Click "Submit"
    VRF->>API: POST /api/vendors/:vendorId/comments\n{rating, body}\nX-Role-Token: <token>
    API->>API: Recalculate vendor avg rating & review count
    API-->>VRF: 201 Created
    VRF->>API: GET /api/vendors/:vendorId/comments
    API-->>VRF: Updated comment list
    VRF-->>U: Show updated comments & rating
```

## 6. Add a Vendor (Foodvendor / Admin)

```mermaid
sequenceDiagram
    actor FV as Foodvendor/Admin
    participant MI as MapInterface
    participant App as App.tsx
    participant AVM as AddVendorModal
    participant API as Backend API

    FV->>MI: Click "Add Vendor" button
    MI->>App: setIsAddingVendor(true)
    MI-->>FV: Cursor changes to crosshair

    FV->>MI: Tap map location
    MI->>App: setNewVendorCoords({x, y, lat?, lon?})\nsetIsAddingVendor(false)\nsetIsAddVendorModalOpen(true)
    App-->>AVM: Open AddVendorModal

    FV->>AVM: Fill name, description, images, type
    FV->>AVM: Click "Submit"
    AVM->>API: POST /api/streets/:streetId/vendors\n{name, description, x, y, lat, lon, owner_username, ...}\nX-Role-Token: <token>

    alt role === foodvendor
        API-->>AVM: 201 Created (mode=request)
        AVM-->>FV: "Vendor request submitted!"
    else role === admin
        API-->>AVM: 201 Created
        AVM-->>FV: "Vendor added successfully"
    end

    AVM->>App: close modal
    App->>API: GET /api/streets/:streetId/vendors
    API-->>App: Updated vendor list
    App-->>MI: Re-render pins
```

## 7. Admin: Set Vendor Pin Location

```mermaid
sequenceDiagram
    actor A as Admin
    participant VBS as VendorBottomSheet
    participant VEM as VendorEditModal
    participant App as App.tsx
    participant MI as MapInterface
    participant API as Backend API

    A->>VBS: Click "Edit Vendor"
    VBS-->>VEM: Open VendorEditModal
    A->>VEM: Click "Set Location on Map"
    VEM->>App: onEnterPinPlacementMode(vendor)
    App->>App: setPinPlacementMode(true)\nsetPinPlacementVendor(vendor)\nclose VendorEditModal & VendorBottomSheet
    App-->>MI: Show "Tap map to place pin" toast

    A->>MI: Tap map
    MI->>App: setCandidatePin({lat, lon})
    App-->>MI: Show candidate pin + confirmation panel

    alt Admin confirms
        A->>MI: Click "Confirm"
        MI->>API: PUT /api/streets/:streetId/vendors/:vendorId\n{lat, lon, ...}\nX-Role-Token: <token>
        API-->>MI: 200 OK
        MI->>API: GET /api/streets/:streetId/vendors
        API-->>MI: Updated vendor list
        MI->>App: setPinPlacementMode(false)
        App-->>A: Toast "Pin location saved"
    else Admin cancels
        A->>MI: Click "Cancel"
        App->>App: setCandidatePin(null)
        App-->>A: Candidate pin cleared
    end
```

## 8. Admin: Add a New Street/Location

```mermaid
sequenceDiagram
    actor A as Admin
    participant LC as LocationSelection
    participant ALM as AddLocationModal
    participant App as App.tsx
    participant API as Backend API

    A->>LC: Click "+" button
    LC->>App: setIsAddLocationOpen(true)
    App-->>ALM: Open AddLocationModal
    A->>ALM: Fill name, city, description, bbox coords, zoom
    A->>ALM: Click "Add Location"
    ALM->>API: POST /api/streets\n{name, city, description, lat_nw, lon_nw, lat_se, lon_se, map_zoom}\nX-Role-Token: <token>
    API->>API: Generate map PNG via Python script
    API->>API: Store map_image_path, map_updated_at
    API-->>ALM: 201 Created {id, ...}
    ALM->>App: close modal
    App->>API: GET /api/streets
    API-->>App: Updated street list
    App-->>LC: Re-render with new street
```

## 9. Admin: Edit Street Bounding Box

```mermaid
sequenceDiagram
    actor A as Admin
    participant LC as LocationSelection
    participant ELM as EditLocationModal
    participant App as App.tsx
    participant API as Backend API

    A->>LC: Click pencil icon on street
    LC->>App: setEditingLocation(street)
    App-->>ELM: Open EditLocationModal (pre-filled)
    A->>ELM: Update bbox coords or name/city
    A->>ELM: Click "Save"
    ELM->>API: PUT /api/streets/:id\n{name, city, lat_nw, lon_nw, lat_se, lon_se, map_zoom}\nX-Role-Token: <token>
    API->>API: Regenerate map PNG
    API-->>ELM: 200 OK
    ELM->>App: close modal
    App->>API: GET /api/streets
    API-->>App: Updated street list (with new map_image_path)
```

## 10. Admin Dashboard

```mermaid
sequenceDiagram
    actor A as Admin
    participant LC as LocationSelection
    participant AS as AdminScreen
    participant AD as AdminDashboard
    participant API as Backend API

    A->>LC: Click shield icon
    LC->>App: onGoToAdmin()
    App->>App: setCurrentScreen("admin")
    App-->>AS: Render AdminScreen

    AS->>API: GET /api/admin/stats\nX-Role-Token: <token>
    API-->>AS: {streets, vendors, users, comments}
    AS-->>AD: Render stats cards

    A->>AS: Click "Users" tab
    AS->>API: GET /api/admin/users
    API-->>AS: [{id, username, role, created_at}]
    AS-->>A: Render user list

    A->>AS: Change user role
    AS->>API: PUT /api/admin/users/:userId {role}
    API-->>AS: 200 OK
    AS->>API: GET /api/admin/users (refresh)

    A->>AS: Click "Comments" tab
    AS->>API: GET /api/admin/comments
    API-->>AS: [{id, vendor_name, username, rating, body}]
    AS-->>A: Render comments list

    A->>AS: Delete comment
    AS->>API: DELETE /api/vendors/:vendorId/comments/:commentId
    API-->>AS: 200 OK
    AS->>API: GET /api/admin/comments (refresh)
```

## 11. Change Password

```mermaid
sequenceDiagram
    actor U as User
    participant SM as SettingsModal
    participant CPM as ChangePasswordModal
    participant API as Backend API

    U->>SM: Open Settings
    U->>SM: Click "Change Password"
    SM-->>CPM: Open ChangePasswordModal
    U->>CPM: Enter current password & new password
    U->>CPM: Click "Change"
    CPM->>API: PUT /api/auth/change-password\n{currentPassword, newPassword}\nX-Role-Token: <token>
    alt success
        API-->>CPM: 200 OK
        CPM-->>U: "Password changed successfully"
        CPM->>SM: close modal
    else wrong current password
        API-->>CPM: 401 Unauthorized
        CPM-->>U: Show error
    end
```

## 12. Language Selection

```mermaid
sequenceDiagram
    actor U as User
    participant SM as SettingsModal
    participant LP as LanguagePicker
    participant App as App.tsx
    participant I18N as i18n Context

    U->>SM: Open Settings
    SM-->>LP: Render LanguagePicker (current language)
    U->>LP: Select a language (e.g. "日本語")
    LP->>App: onLanguageChange(language)
    App->>I18N: setLanguage(language)
    I18N-->>App: Re-render all components with new translations
    App-->>U: All UI text and vendor descriptions switch to selected language
```

## 13. Vendor Description Auto-Translation

```mermaid
sequenceDiagram
    actor FV as Foodvendor/Admin
    participant AVM as AddVendorModal
    participant API as Backend API
    participant GPT as GPT-4o-mini

    FV->>AVM: Fill vendor name & description (in Vietnamese)
    FV->>AVM: Click "Submit"
    AVM->>API: POST /api/streets/:streetId/vendors\n{name, description, description_language:"vi", ...}\nX-Role-Token: <token>
    API->>GPT: Translate Vietnamese description → {en, ko, ja, zh-CN, zh-TW, es}
    GPT-->>API: {en: "...", ko: "...", ja: "...", ...}
    API->>API: Store description_translations as JSON in vendor record
    API->>API: Background: generate Edge TTS .mp3 for each language
    API-->>AVM: 201 Created
    AVM-->>FV: "Vendor added successfully"
```

## 14. Manual TTS Playback (Vendor Detail)

```mermaid
sequenceDiagram
    actor U as User
    participant VBS as VendorBottomSheet
    participant TTS as useTTS hook
    participant Audio as /audio/{id}_{lang}.mp3
    participant WSA as Web Speech API

    U->>VBS: Tap speaker button on vendor card
    VBS->>TTS: play(description, language, vendorId, ttsRate)
    TTS->>Audio: GET /audio/{vendorId}_{language}.mp3
    alt pre-generated file exists
        Audio-->>TTS: MP3 audio stream
        TTS-->>U: Play Edge TTS voice at selected speed
    else file not found
        TTS->>WSA: SpeechSynthesisUtterance(description, language)
        WSA-->>U: Play browser TTS voice
    end
    U->>VBS: Tap speaker button again
    VBS->>TTS: stop()
    TTS-->>U: Playback stops
```

## 15. Proximity-based Auto-narration

```mermaid
sequenceDiagram
    actor U as User
    participant MI as MapInterface
    participant GEO as useGeolocation hook
    participant PN as useProximityNarration hook
    participant TTS as useTTS hook

    MI->>GEO: Watch user GPS position
    GEO-->>MI: userPosition {lat, lon, accuracy}

    loop every second
        PN->>PN: Calculate haversine distance to each vendor
        alt user within ~30m of a vendor AND cooldown elapsed
            PN->>TTS: play(vendorDescription, language, vendorId, ttsRate)
            TTS-->>U: Auto-play vendor description audio
            PN->>PN: Record cooldown timestamp for vendor
        end
    end

    note over PN: Requires audioEnabled=true\nand GPS position available
```

## 16. TTS Settings Configuration

```mermaid
sequenceDiagram
    actor U as User
    participant SM as SettingsModal
    participant App as App.tsx

    U->>SM: Open Settings
    U->>SM: Toggle "Audio narration" switch
    SM->>App: setAudioEnabled(true/false)

    alt audioEnabled = true
        U->>SM: Select cooldown duration (e.g. 10 min)
        SM->>App: setCooldownMinutes(10)
        U->>SM: Adjust TTS speed slider (e.g. 1.5×)
        SM->>App: setTtsRate(1.5)
        App-->>U: Proximity narration active with new settings
    else audioEnabled = false
        App-->>U: Auto-narration disabled
    end
```

## 17. GPS User Location Display

```mermaid
sequenceDiagram
    actor U as User
    participant MI as MapInterface
    participant GEO as useGeolocation hook
    participant Browser as Browser Geolocation API

    MI->>Browser: navigator.geolocation.watchPosition()
    Browser-->>GEO: {lat, lon, accuracy}
    GEO-->>MI: userPosition

    alt street has bbox + map image
        MI->>MI: projectVendorToPercent(userPosition, bbox) → {x%, y%}
        MI-->>U: Show blue dot at user's position on map
    end

    alt GPS accuracy > 50m
        MI-->>U: Show GPS accuracy warning toast
    end
```
