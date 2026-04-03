# Activity Diagrams

## 1. Application Startup & Auth Flow

```mermaid
flowchart TD
    Start([App Starts]) --> CheckUser{currentUser\nin state?}
    CheckUser -->|No| ShowLogin[Show LoginScreen]
    CheckUser -->|Yes| ShowLocation[Show LocationSelection]

    ShowLogin --> UserChoice{User action}
    UserChoice -->|Login| PostLogin[POST /api/auth/login]
    UserChoice -->|Register| PostRegister[POST /api/auth/register]

    PostLogin --> LoginOK{200 OK?}
    PostRegister --> RegOK{201 Created?}

    LoginOK -->|No| ShowLoginError[Show error message] --> ShowLogin
    LoginOK -->|Yes| StoreUser[Store currentUser\nrole + token]
    RegOK -->|No| ShowRegError[Show error message] --> ShowLogin
    RegOK -->|Yes| StoreUser

    StoreUser --> ShowLocation
```

## 2. Screen Navigation State Machine

```mermaid
flowchart TD
    Login([login screen]) -->|onLogin success| Location([location screen])
    Location -->|onSelectLocation| Map([map screen])
    Location -->|onGoToAdmin - admin only| Admin([admin screen])
    Map -->|onBack| Location
    Admin -->|onBack| Location

    style Login fill:#dbeafe
    style Location fill:#dcfce7
    style Map fill:#fef9c3
    style Admin fill:#fce7f3
```

## 3. Location Selection Screen Activity

```mermaid
flowchart TD
    Enter([Enter LocationSelection]) --> FetchStreets[GET /api/streets]
    FetchStreets --> FetchOK{Success?}
    FetchOK -->|No| ShowFetchError[Show error] --> FetchStreets
    FetchOK -->|Yes| RenderList[Render street list]

    RenderList --> UserAction{User action}

    UserAction -->|Tap street| GoToMap[setSelectedLocation\nsetCurrentScreen map]
    UserAction -->|Click + - admin| OpenAddModal[Open AddLocationModal]
    UserAction -->|Click pencil - admin| OpenEditModal[Open EditLocationModal]
    UserAction -->|Click trash - admin| OpenDeleteConfirm[Open delete confirmation]
    UserAction -->|Click shield - admin| GoToAdmin[setCurrentScreen admin]
    UserAction -->|Click settings| OpenSettings[Open SettingsModal]

    OpenAddModal --> FillAddForm[Fill name, city, bbox, zoom]
    FillAddForm --> SubmitAdd[POST /api/streets]
    SubmitAdd --> RefreshStreets[GET /api/streets] --> RenderList

    OpenEditModal --> FillEditForm[Edit fields]
    FillEditForm --> SubmitEdit[PUT /api/streets/:id]
    SubmitEdit --> RegenerateMap[Backend: generate map PNG]
    RegenerateMap --> RefreshStreets

    OpenDeleteConfirm --> ConfirmDelete{Confirmed?}
    ConfirmDelete -->|No| RenderList
    ConfirmDelete -->|Yes| DeleteStreet[DELETE /api/streets/:id] --> RefreshStreets
```

## 4. Map Interface Activity

```mermaid
flowchart TD
    Enter([Enter MapInterface]) --> FetchVendors[GET /api/streets/:id/vendors]
    FetchVendors --> HasBbox{Location has\nbbox + map image?}

    HasBbox -->|Yes| RealMap[Render real map PNG\nProject pins via lat/lon]
    HasBbox -->|No| MockMap[Render mock map grid\nPlace pins at x/y %]

    RealMap --> Idle{Waiting for input}
    MockMap --> Idle

    Idle -->|Tap vendor pin| OpenVendorSheet[Open VendorBottomSheet]
    Idle -->|Click Add Vendor\nadmin/foodvendor| EnterAddMode[isAddingVendor = true\ncrosshair cursor]
    Idle -->|Click back| GoBack[Back to LocationSelection]

    EnterAddMode --> TapMap{User taps map}
    TapMap -->|Cancel| Idle
    TapMap -->|Tap location| CaptureCoords[Capture x, y, lat?, lon?]
    CaptureCoords --> OpenAddVendorModal[Open AddVendorModal]
    OpenAddVendorModal --> SubmitVendor[POST /api/streets/:id/vendors]
    SubmitVendor --> FetchVendors

    OpenVendorSheet --> SheetAction{User action in sheet}
    SheetAction -->|Close| Idle
    SheetAction -->|Submit rating| PostComment[POST /api/vendors/:id/comments]
    PostComment --> RefreshComments[GET /api/vendors/:id/comments]
    RefreshComments --> OpenVendorSheet

    SheetAction -->|Edit - admin/owner| OpenEditModal[Open VendorEditModal]
    OpenEditModal --> EditAction{Edit action}
    EditAction -->|Save fields| PutVendor[PUT /api/streets/:sId/vendors/:vId]
    PutVendor --> FetchVendors
    EditAction -->|Set Location on Map\nadmin only| EnterPinMode
```

## 5. Pin Placement Mode (Admin)

```mermaid
flowchart TD
    Trigger([Admin clicks Set Location on Map]) --> ClosePreviousModals[Close VendorEditModal\nClose VendorBottomSheet]
    ClosePreviousModals --> SetState[pinPlacementMode = true\npinPlacementVendor = vendor]
    SetState --> ShowToast[Toast: Tap map to place pin]

    ShowToast --> WaitTap{Admin taps map}
    WaitTap -->|Cancel pin mode| ExitMode[pinPlacementMode = false] --> Done([Done])

    WaitTap -->|Tap location| CalcLatLon[percentToLatLon:\nconvert tap % → lat/lon]
    CalcLatLon --> SetCandidate[candidatePin = calculated lat/lon]
    SetCandidate --> ShowConfirmPanel[Show candidate pin\n+ confirm/cancel panel]

    ShowConfirmPanel --> AdminDecision{Admin decision}
    AdminDecision -->|Cancel| ClearCandidate[candidatePin = null] --> WaitTap
    AdminDecision -->|Confirm| SavePin[PUT /api/streets/:sId/vendors/:vId\nbody: lat, lon + existing fields]
    SavePin --> PinOK{200 OK?}
    PinOK -->|No| ShowError[Show error] --> ShowConfirmPanel
    PinOK -->|Yes| RefreshVendors[GET /api/streets/:id/vendors]
    RefreshVendors --> ExitMode
    ExitMode --> ShowSuccessToast[Toast: Pin location saved] --> Done
```

## 6. Vendor Authorization Rules

```mermaid
flowchart TD
    Request([API Request]) --> CheckToken{X-Role-Token\npresent?}
    CheckToken -->|No| Reject401[401 Unauthorized]
    CheckToken -->|Yes| DecodeToken[Decode base64\nrole:username]

    DecodeToken --> RouteCheck{Request type}

    RouteCheck -->|GET /api/*| AllowRead[Allow - any role]

    RouteCheck -->|POST/PUT/DELETE\n/streets| IsAdmin1{role === admin?}
    IsAdmin1 -->|No| Reject403[403 Forbidden]
    IsAdmin1 -->|Yes| AllowFull[Allow full operation]

    RouteCheck -->|POST /streets/:id/vendors| CanPost{role === admin\nor foodvendor?}
    CanPost -->|No| Reject403
    CanPost -->|Yes| AllowPost[Allow - set mode accordingly\nadmin: direct add\nfoodvendor: request]

    RouteCheck -->|PUT /streets/:sId/vendors/:vId| IsAdminOrOwner{role === admin\nor username === owner?}
    IsAdminOrOwner -->|No| Reject403
    IsAdminOrOwner -->|Yes| CheckFieldScope{role === admin?}
    CheckFieldScope -->|Yes| AllowFull
    CheckFieldScope -->|No - foodvendor| AllowLimited[Allow name/description/images only]

    RouteCheck -->|Admin endpoints\n/admin/*| IsAdmin2{role === admin?}
    IsAdmin2 -->|No| Reject403
    IsAdmin2 -->|Yes| AllowAdmin[Allow admin operation]
```

## 7. Map Rendering Decision

```mermaid
flowchart TD
    LoadMap([MapInterface renders]) --> FetchVendors[GET /api/streets/:id/vendors]
    FetchVendors --> CheckBbox{selectedLocation has\nlat_nw, lon_nw,\nlat_se, lon_se?}

    CheckBbox -->|No| MockMapMode[Mock Map Mode]
    CheckBbox -->|Yes| CheckImage{map_image_path\nexists?}

    CheckImage -->|No| MockMapMode
    CheckImage -->|Yes| RealMapMode[Real Map Mode]

    MockMapMode --> RenderGrid[Render CSS grid background]
    RenderGrid --> PlaceMockPins[Place vendor pins at\nx%, y% positions]
    PlaceMockPins --> MockInteraction[Tap pin → open VendorBottomSheet\nPin placement NOT available]

    RealMapMode --> FetchMapPng[Fetch static/maps/:id.png\nwith ?t= cache bust]
    FetchMapPng --> ProjectPins[For each vendor with lat/lon:\nprojectVendorToPercent → x%, y%]
    ProjectPins --> RenderRealPins[Overlay pins on map image]
    RenderRealPins --> RealInteraction[Tap pin → open VendorBottomSheet\nTap empty area → pin placement if admin mode]
```

## 8. Comment & Rating Flow

```mermaid
flowchart TD
    Open([Open VendorBottomSheet]) --> FetchComments[GET /api/vendors/:id/comments]
    FetchComments --> ShowVendor[Show vendor name, avg rating,\nreview count, comment list]

    ShowVendor --> UserChoice{User action}
    UserChoice -->|Close| End([Close sheet])
    UserChoice -->|Rate & Review| ShowForm[Show VendorRateForm]

    ShowForm --> FillForm[Select star rating 1-5\nWrite comment body]
    FillForm --> Submit[POST /api/vendors/:vendorId/comments\n{rating, body}]
    Submit --> PostOK{201 Created?}
    PostOK -->|No| ShowFormError[Show error] --> ShowForm
    PostOK -->|Yes| BackendRecalc[Backend: UPDATE vendors\nSET rating = avg, reviews = count]
    BackendRecalc --> RefreshComments[GET /api/vendors/:id/comments]
    RefreshComments --> ShowVendor
```

## 9. Admin Dashboard Activity

```mermaid
flowchart TD
    Enter([Enter AdminScreen]) --> LoadStats[GET /api/admin/stats]
    LoadStats --> ShowDashboard[Show stats cards:\nstreets, vendors, users, comments]

    ShowDashboard --> TabChoice{Active tab}

    TabChoice -->|Users| LoadUsers[GET /api/admin/users]
    LoadUsers --> ShowUsers[Show user list with roles]
    ShowUsers --> UserMgmt{User action}
    UserMgmt -->|Change role - not self| PutUser[PUT /api/admin/users/:id {role}]
    UserMgmt -->|Delete user - not self| DeleteUser[DELETE /api/admin/users/:id]
    PutUser --> LoadUsers
    DeleteUser --> LoadUsers

    TabChoice -->|Vendors| LoadVendors[GET /api/admin/vendors]
    LoadVendors --> ShowVendors[Show all vendors with\nstreet name, owner, rating]

    TabChoice -->|Comments| LoadComments[GET /api/admin/comments]
    LoadComments --> ShowComments[Show all comments with\nvendor name, username, rating]
    ShowComments --> CommentMgmt{Admin action}
    CommentMgmt -->|Delete comment| DeleteComment[DELETE /api/vendors/:vId/comments/:cId]
    DeleteComment --> LoadComments

    TabChoice -->|Back| GoBack[setCurrentScreen location] --> Done([Done])
```

## 10. Full User Journey (Happy Path)

```mermaid
flowchart TD
    Start([User opens app]) --> Login[Login with credentials]
    Login --> BrowseStreets[Browse street list]
    BrowseStreets --> SelectStreet[Select a food street]
    SelectStreet --> ViewMap[View interactive map]
    ViewMap --> TapPin[Tap a vendor pin]
    TapPin --> ReadVendor[Read vendor info & reviews]
    ReadVendor --> LeaveReview{Want to\nleave review?}
    LeaveReview -->|Yes| SubmitRating[Rate 1-5 stars\n+ write comment]
    SubmitRating --> ViewMap
    LeaveReview -->|No| MoreVendors{More vendors\nto browse?}
    MoreVendors -->|Yes| ViewMap
    MoreVendors -->|No| AnotherStreet{Another street?}
    AnotherStreet -->|Yes| BrowseStreets
    AnotherStreet -->|No| End([Done])
```
