import type { Translations } from '../types';

export const en: Translations = {
  // Auth
  signInSubtitle: 'Sign in to explore food streets',
  createAccountSubtitle: 'Create a new account',
  username: 'Username',
  usernamePlaceholder: 'e.g. admin',
  chooseUsernamePlaceholder: 'Choose a username',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  invalidCredentials: 'Invalid username or password',
  connectionError: 'Connection error. Please try again.',
  signingIn: 'Signing in…',
  signIn: 'Sign In',
  noAccount: "Don't have an account? Create one",
  creatingAccount: 'Creating account…',
  createAccount: 'Create Account',
  alreadyHaveAccount: 'Already have an account? Sign in',
  passwordMismatch: 'Passwords do not match',

  // Location Selection
  whereAreYou: 'Where are you?',
  selectStreetHaven: 'Select a street food haven',
  roleAdmin: 'Admin',
  roleVendor: 'Vendor',
  roleUser: 'User',
  adminPanelTitle: 'Admin Panel',
  logout: 'Logout',
  vendorCountOne: '{count} vendor',
  vendorCountMany: '{count} vendors',

  // Map Interface
  tapToPlaceVendor: 'Tap on the map to place a vendor',
  tapMapToPlacePin: 'Tap the map to place pin',
  pinSaved: 'Pin location saved',
  failedSavePin: 'Failed to save pin location',
  tapMapToPlacePinFor: 'Tap the map to place pin for {name}',
  placePinHere: 'Place pin here?',
  cancel: 'Cancel',
  confirm: 'Confirm',
  mapFailedToLoad: 'Map failed to load. Refresh to retry.',

  // Vendor Bottom Sheet
  getDirections: 'Get Directions',
  share: 'Share',
  about: 'About',
  defaultDescription: 'A legendary spot known for its authentic flavors and secret family recipes passed down through generations. The aroma alone is enough to draw a crowd from blocks away.',
  reviews: 'Reviews',

  // Vendor Rate Form
  leaveReview: 'Leave a Review',
  shareExperience: 'Share your experience…',
  selectRatingError: 'Please select a rating',
  submitting: 'Submitting…',
  submitReview: 'Submit Review',

  // Vendor Comments List
  noReviewsYet: 'No reviews yet. Be the first!',

  // Vendor Edit Modal
  editVendor: 'Edit Vendor',
  name: 'Name',
  description: 'Description',
  imageUrlsLabel: 'Image URLs (one per line)',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: 'Saving…',
  saveChanges: 'Save Changes',
  setLocationOnMap: 'Set Location on Map',

  // Add Vendor Modal
  addVendor: 'Add Vendor',
  requestVendor: 'Request Vendor',
  vendorName: 'Vendor Name',
  vendorNamePlaceholder: 'e.g. Pad Thai Master',
  briefDescriptionPlaceholder: 'Brief description...',
  initialRating: 'Initial Rating',
  submitRequest: 'Submit Request',

  // Add Location Modal
  addFoodStreet: 'Add Food Street',
  streetName: 'Street Name',
  streetNamePlaceholder: 'e.g. Khao San Road',
  city: 'City',
  cityPlaceholder: 'e.g. Bangkok',
  addStreet: 'Add Street',

  // Edit Location Modal
  editFoodStreet: 'Edit Food Street',
  mapBoundingBox: 'Map Bounding Box',
  mapBoundingBoxHint: 'optional — generates map image',
  nwLatitude: 'NW Latitude (top)',
  nwLongitude: 'NW Longitude (left)',
  seLatitude: 'SE Latitude (bottom)',
  seLongitude: 'SE Longitude (right)',
  mapImageWillGenerate: 'Map image will be generated on save.',
  update: 'Update',

  // Delete Location Modal
  deleteFoodStreet: 'Delete Food Street?',
  deleteLocationConfirm: 'Are you sure you want to completely delete "{name}" and all of its vendors? This action cannot be undone.',
  delete: 'Delete',

  // Settings Modal
  settings: 'Settings',
  narrationAudio: 'Narration Audio',
  narrationAudioHint: 'Auto-play when nearby',
  textSize: 'Text Size',
  textSizeHint: 'Adjust readability',
  changePassword: 'Change Password',
  changePasswordHint: 'Update your account password',

  // Change Password Modal
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmNewPassword: 'Confirm New Password',
  newPasswordsMismatch: 'New passwords do not match',
  passwordChangedSuccess: 'Password changed successfully!',
  savePassword: 'Save Password',

  // Admin Screen
  adminPanel: 'Admin Panel',
  dashboard: 'Dashboard',
  users: 'Users',
  vendors: 'Vendors',
  comments: 'Comments',
  addNewVendor: 'Add New Vendor',
  backToMap: 'Back to Map',
  signedInAs: 'Signed in as',
  searchPlaceholder: 'Search streets or vendors...',

  // Admin Dashboard
  streetFoodCreated: 'Street Food Created',
  streetsBadge: 'Streets',
  totalVendors: 'Total Vendors',
  activeBadge: 'Active',
  totalUsers: 'Total Users',
  globalBadge: 'Global',
  totalComments: 'Total Comments',
  newBadge: 'New',
  topPerformingStreets: 'Top Performing Streets',
  topStreetsSubtitle: 'High traffic hubs ranked by vendor count',
  viewAllMaps: 'View All Maps',
  noStreetsYet: 'No streets yet',
  rankLabel: 'Rank',
  vendorActivityChart: 'Vendor Activity Chart Visualization',
  recentActivity: 'Recent Activity',
  noActivityYet: 'No activity yet',
  newComment: 'New Comment',
  clearAllLogs: 'Clear All Logs',
  needInsights: 'Need Insights?',
  needInsightsDesc: 'Generate a comprehensive street performance report for your data.',
  getReport: 'Get Report →',
  vendorCountOneShort: '{count} vendor',
  vendorCountManyShort: '{count} vendors',

  // Time Ago
  minAgo: '{n} min ago',
  minsAgo: '{n} mins ago',
  hourAgo: '{n} hour ago',
  hoursAgo: '{n} hours ago',
  dayAgo: '{n} day ago',
  daysAgo: '{n} days ago',

  // Admin Users Tab
  usersHeading: 'Users',
  deleteUserConfirm: 'Delete this user?',

  // Admin Vendors Tab
  allVendors: 'All Vendors',
  assignOwnerPlaceholder: 'Assign owner username',
  save: 'Save',
  deleteVendorConfirm: 'Delete vendor "{name}"?',

  // Admin Comments Tab
  allComments: 'All Comments',
  noCommentsYet: 'No comments yet',
  deleteCommentConfirm: 'Delete this comment?',

  // App Toasts
  streetAdded: 'Street added successfully',
  failedAddStreet: 'Failed to add street',
  streetUpdated: 'Street updated successfully',
  failedUpdateStreet: 'Failed to update street',
  streetDeleted: 'Street deleted successfully',
  failedDeleteStreet: 'Failed to delete street',
  vendorRequestSubmitted: 'Vendor request submitted!',
  vendorAdded: 'Vendor added successfully',
  vendorUpdated: 'Vendor updated successfully',
  failedAddVendor: 'Failed to add vendor',
  linkCopied: 'Link copied to clipboard!',

  // Language Picker
  languageLabel: 'Language',
};
