export type Language = 'en' | 'vi' | 'ko' | 'ja' | 'zh-CN' | 'zh-TW' | 'es';

export interface Translations {
  // --- Auth ---
  signInSubtitle: string;
  createAccountSubtitle: string;
  username: string;
  usernamePlaceholder: string;
  chooseUsernamePlaceholder: string;
  password: string;
  confirmPassword: string;
  invalidCredentials: string;
  connectionError: string;
  signingIn: string;
  signIn: string;
  noAccount: string;
  creatingAccount: string;
  createAccount: string;
  alreadyHaveAccount: string;
  passwordMismatch: string;

  // --- Location Selection ---
  whereAreYou: string;
  selectStreetHaven: string;
  roleAdmin: string;
  roleVendor: string;
  roleUser: string;
  adminPanelTitle: string;
  logout: string;
  vendorCountOne: string;
  vendorCountMany: string;

  // --- Map Interface ---
  tapToPlaceVendor: string;
  tapMapToPlacePin: string;
  pinSaved: string;
  failedSavePin: string;
  tapMapToPlacePinFor: string;
  placePinHere: string;
  cancel: string;
  confirm: string;
  mapFailedToLoad: string;

  // --- Vendor Bottom Sheet ---
  getDirections: string;
  share: string;
  about: string;
  defaultDescription: string;
  reviews: string;

  // --- Vendor Rate Form ---
  leaveReview: string;
  shareExperience: string;
  selectRatingError: string;
  submitting: string;
  submitReview: string;

  // --- Vendor Comments List ---
  noReviewsYet: string;

  // --- Vendor Edit Modal ---
  editVendor: string;
  name: string;
  description: string;
  imageUrlsLabel: string;
  imageUrlsPlaceholder: string;
  saving: string;
  saveChanges: string;
  setLocationOnMap: string;

  // --- Add Vendor Modal ---
  addVendor: string;
  requestVendor: string;
  vendorName: string;
  vendorNamePlaceholder: string;
  briefDescriptionPlaceholder: string;
  initialRating: string;
  submitRequest: string;

  // --- Add Location Modal ---
  addFoodStreet: string;
  streetName: string;
  streetNamePlaceholder: string;
  city: string;
  cityPlaceholder: string;
  addStreet: string;

  // --- Edit Location Modal ---
  editFoodStreet: string;
  mapBoundingBox: string;
  mapBoundingBoxHint: string;
  nwLatitude: string;
  nwLongitude: string;
  seLatitude: string;
  seLongitude: string;
  mapImageWillGenerate: string;
  update: string;

  // --- Delete Location Modal ---
  deleteFoodStreet: string;
  deleteLocationConfirm: string;
  delete: string;

  // --- Settings Modal ---
  settings: string;
  narrationAudio: string;
  narrationAudioHint: string;
  textSize: string;
  textSizeHint: string;
  changePassword: string;
  changePasswordHint: string;

  // --- Change Password Modal ---
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  newPasswordsMismatch: string;
  passwordChangedSuccess: string;
  savePassword: string;

  // --- Admin Screen ---
  adminPanel: string;
  dashboard: string;
  users: string;
  vendors: string;
  comments: string;
  addNewVendor: string;
  backToMap: string;
  signedInAs: string;
  searchPlaceholder: string;

  // --- Admin Dashboard ---
  streetFoodCreated: string;
  streetsBadge: string;
  totalVendors: string;
  activeBadge: string;
  totalUsers: string;
  globalBadge: string;
  totalComments: string;
  newBadge: string;
  topPerformingStreets: string;
  topStreetsSubtitle: string;
  viewAllMaps: string;
  noStreetsYet: string;
  rankLabel: string;
  vendorActivityChart: string;
  recentActivity: string;
  noActivityYet: string;
  newComment: string;
  clearAllLogs: string;
  needInsights: string;
  needInsightsDesc: string;
  getReport: string;
  vendorCountOneShort: string;
  vendorCountManyShort: string;

  // --- Time Ago ---
  minAgo: string;
  minsAgo: string;
  hourAgo: string;
  hoursAgo: string;
  dayAgo: string;
  daysAgo: string;

  // --- Admin Users Tab ---
  usersHeading: string;
  deleteUserConfirm: string;

  // --- Admin Vendors Tab ---
  allVendors: string;
  assignOwnerPlaceholder: string;
  save: string;
  deleteVendorConfirm: string;

  // --- Admin Comments Tab ---
  allComments: string;
  noCommentsYet: string;
  deleteCommentConfirm: string;

  // --- App Toasts ---
  streetAdded: string;
  failedAddStreet: string;
  streetUpdated: string;
  failedUpdateStreet: string;
  streetDeleted: string;
  failedDeleteStreet: string;
  vendorRequestSubmitted: string;
  vendorAdded: string;
  failedAddVendor: string;
  linkCopied: string;

  // --- Language Picker ---
  languageLabel: string;
}
