import type { Translations } from '../types';

export const zhTW: Translations = {
  // Auth
  signInSubtitle: '登入探索美食街',
  createAccountSubtitle: '建立新帳號',
  username: '使用者名稱',
  usernamePlaceholder: '例如：admin',
  chooseUsernamePlaceholder: '選擇使用者名稱',
  password: '密碼',
  confirmPassword: '確認密碼',
  invalidCredentials: '使用者名稱或密碼錯誤',
  connectionError: '連線錯誤，請重試。',
  signingIn: '登入中…',
  signIn: '登入',
  noAccount: '沒有帳號？立即註冊',
  creatingAccount: '建立帳號中…',
  createAccount: '建立帳號',
  alreadyHaveAccount: '已有帳號？去登入',
  passwordMismatch: '密碼不一致',

  // Location Selection
  whereAreYou: '您在哪裡？',
  selectStreetHaven: '選擇一條美食街',
  roleAdmin: '管理員',
  roleVendor: '商家',
  roleUser: '使用者',
  adminPanelTitle: '管理面板',
  logout: '登出',
  vendorCountOne: '{count}家',
  vendorCountMany: '{count}家',

  // Map Interface
  tapToPlaceVendor: '點擊地圖放置商家',
  tapMapToPlacePin: '點擊地圖放置圖釘',
  pinSaved: '圖釘位置已儲存',
  failedSavePin: '儲存圖釘位置失敗',
  tapMapToPlacePinFor: '點擊地圖為{name}放置圖釘',
  placePinHere: '在此處放置圖釘？',
  cancel: '取消',
  confirm: '確認',
  mapFailedToLoad: '地圖載入失敗，請重新整理頁面。',

  // Vendor Bottom Sheet
  getDirections: '取得路線',
  share: '分享',
  about: '關於',
  defaultDescription: '一個以正宗口味和世代相傳秘方聞名的傳奇之地。光是香氣就足以吸引遠處的人們。',
  reviews: '評價',

  // Vendor Rate Form
  leaveReview: '撰寫評價',
  shareExperience: '分享您的體驗…',
  selectRatingError: '請選擇評分',
  submitting: '提交中…',
  submitReview: '提交評價',

  // Vendor Comments List
  noReviewsYet: '尚無評價，來寫第一條吧！',

  // Vendor Edit Modal
  editVendor: '編輯商家',
  name: '名稱',
  description: '描述',
  imageUrlsLabel: '圖片連結（每行一個）',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: '儲存中…',
  saveChanges: '儲存變更',
  setLocationOnMap: '在地圖上設定位置',

  // Add Vendor Modal
  addVendor: '新增商家',
  requestVendor: '申請新增商家',
  vendorName: '商家名稱',
  vendorNamePlaceholder: '例如：老字號麵店',
  briefDescriptionPlaceholder: '簡短描述...',
  initialRating: '初始評分',
  submitRequest: '提交申請',

  // Add Location Modal
  addFoodStreet: '新增美食街',
  streetName: '街道名稱',
  streetNamePlaceholder: '例如：饒河夜市',
  city: '城市',
  cityPlaceholder: '例如：台北',
  addStreet: '新增街道',

  // Edit Location Modal
  editFoodStreet: '編輯美食街',
  mapBoundingBox: '地圖範圍',
  mapBoundingBoxHint: '選填 — 產生地圖圖片',
  nwLatitude: '西北緯度（上）',
  nwLongitude: '西北經度（左）',
  seLatitude: '東南緯度（下）',
  seLongitude: '東南經度（右）',
  mapImageWillGenerate: '儲存時將產生地圖圖片。',
  update: '更新',

  // Delete Location Modal
  deleteFoodStreet: '刪除美食街？',
  deleteLocationConfirm: '確定要完全刪除「{name}」及其所有商家嗎？此操作無法復原。',
  delete: '刪除',

  // Settings Modal
  settings: '設定',
  narrationAudio: '旁白音訊',
  narrationAudioHint: '靠近時自動播放',
  textSize: '字體大小',
  textSizeHint: '調整可讀性',
  changePassword: '變更密碼',
  changePasswordHint: '更新帳號密碼',

  // Change Password Modal
  currentPassword: '目前密碼',
  newPassword: '新密碼',
  confirmNewPassword: '確認新密碼',
  newPasswordsMismatch: '新密碼不一致',
  passwordChangedSuccess: '密碼變更成功！',
  savePassword: '儲存密碼',

  // Admin Screen
  adminPanel: '管理面板',
  dashboard: '儀表板',
  users: '使用者',
  vendors: '商家',
  comments: '評論',
  addNewVendor: '新增商家',
  backToMap: '返回地圖',
  signedInAs: '目前登入：',
  searchPlaceholder: '搜尋街道或商家...',

  // Admin Dashboard
  streetFoodCreated: '已建立美食街',
  streetsBadge: '街道',
  totalVendors: '商家總數',
  activeBadge: '活躍',
  totalUsers: '使用者總數',
  globalBadge: '全球',
  totalComments: '評論總數',
  newBadge: '新增',
  topPerformingStreets: '最熱門街道',
  topStreetsSubtitle: '按商家數量排名的高流量街道',
  viewAllMaps: '查看全部地圖',
  noStreetsYet: '尚無街道',
  rankLabel: '排名',
  vendorActivityChart: '商家活動圖表',
  recentActivity: '最近動態',
  noActivityYet: '尚無動態',
  newComment: '新評論',
  clearAllLogs: '清除全部記錄',
  needInsights: '需要分析報告？',
  needInsightsDesc: '為您的資料產生完整的街道績效報告。',
  getReport: '取得報告 →',
  vendorCountOneShort: '{count}家',
  vendorCountManyShort: '{count}家',

  // Time Ago
  minAgo: '{n}分鐘前',
  minsAgo: '{n}分鐘前',
  hourAgo: '{n}小時前',
  hoursAgo: '{n}小時前',
  dayAgo: '{n}天前',
  daysAgo: '{n}天前',

  // Admin Users Tab
  usersHeading: '使用者',
  deleteUserConfirm: '刪除此使用者？',

  // Admin Vendors Tab
  allVendors: '全部商家',
  assignOwnerPlaceholder: '輸入負責人使用者名稱',
  save: '儲存',
  deleteVendorConfirm: '刪除商家「{name}」？',

  // Admin Comments Tab
  allComments: '全部評論',
  noCommentsYet: '尚無評論',
  deleteCommentConfirm: '刪除此評論？',

  // App Toasts
  streetAdded: '街道新增成功',
  failedAddStreet: '街道新增失敗',
  streetUpdated: '街道更新成功',
  failedUpdateStreet: '街道更新失敗',
  streetDeleted: '街道刪除成功',
  failedDeleteStreet: '街道刪除失敗',
  vendorRequestSubmitted: '商家申請已提交！',
  vendorAdded: '商家新增成功',
  vendorUpdated: '商家更新成功',
  failedAddVendor: '商家新增失敗',
  linkCopied: '連結已複製到剪貼簿！',

  // Language Picker
  languageLabel: '語言',
};
