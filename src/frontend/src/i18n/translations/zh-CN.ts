import type { Translations } from '../types';

export const zhCN: Translations = {
  // Auth
  signInSubtitle: '登录探索美食街',
  createAccountSubtitle: '创建新账户',
  username: '用户名',
  usernamePlaceholder: '例如：admin',
  chooseUsernamePlaceholder: '选择用户名',
  password: '密码',
  confirmPassword: '确认密码',
  invalidCredentials: '用户名或密码错误',
  connectionError: '连接错误，请重试。',
  signingIn: '登录中…',
  signIn: '登录',
  noAccount: '没有账户？立即注册',
  creatingAccount: '创建账户中…',
  createAccount: '创建账户',
  alreadyHaveAccount: '已有账户？去登录',
  passwordMismatch: '密码不一致',

  // Location Selection
  whereAreYou: '您在哪里？',
  selectStreetHaven: '选择一条美食街',
  roleAdmin: '管理员',
  roleVendor: '商家',
  roleUser: '用户',
  adminPanelTitle: '管理面板',
  logout: '退出登录',
  vendorCountOne: '{count}家',
  vendorCountMany: '{count}家',

  // Map Interface
  tapToPlaceVendor: '点击地图放置商家',
  tapMapToPlacePin: '点击地图放置图钉',
  pinSaved: '图钉位置已保存',
  failedSavePin: '保存图钉位置失败',
  tapMapToPlacePinFor: '点击地图为{name}放置图钉',
  placePinHere: '在此处放置图钉？',
  cancel: '取消',
  confirm: '确认',
  mapFailedToLoad: '地图加载失败，请刷新页面。',

  // Vendor Bottom Sheet
  getDirections: '获取路线',
  share: '分享',
  about: '关于',
  defaultDescription: '一个以正宗口味和世代相传的秘方而闻名的传奇之地。仅仅是香气就足以吸引远处的人们。',
  reviews: '评价',

  // Vendor Rate Form
  leaveReview: '写评价',
  shareExperience: '分享您的体验…',
  selectRatingError: '请选择评分',
  submitting: '提交中…',
  submitReview: '提交评价',

  // Vendor Comments List
  noReviewsYet: '暂无评价，来写第一条吧！',

  // Vendor Edit Modal
  editVendor: '编辑商家',
  name: '名称',
  description: '描述',
  imageUrlsLabel: '图片链接（每行一个）',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: '保存中…',
  saveChanges: '保存更改',
  setLocationOnMap: '在地图上设置位置',

  // Add Vendor Modal
  addVendor: '添加商家',
  requestVendor: '申请添加商家',
  vendorName: '商家名称',
  vendorNamePlaceholder: '例如：老字号面馆',
  briefDescriptionPlaceholder: '简短描述...',
  initialRating: '初始评分',
  submitRequest: '提交申请',

  // Add Location Modal
  addFoodStreet: '添加美食街',
  streetName: '街道名称',
  streetNamePlaceholder: '例如：王府井小吃街',
  city: '城市',
  cityPlaceholder: '例如：北京',
  addStreet: '添加街道',

  // Edit Location Modal
  editFoodStreet: '编辑美食街',
  mapBoundingBox: '地图范围',
  mapBoundingBoxHint: '可选 — 生成地图图片',
  nwLatitude: '西北纬度（上）',
  nwLongitude: '西北经度（左）',
  seLatitude: '东南纬度（下）',
  seLongitude: '东南经度（右）',
  mapImageWillGenerate: '保存时将生成地图图片。',
  update: '更新',

  // Delete Location Modal
  deleteFoodStreet: '删除美食街？',
  deleteLocationConfirm: '确定要完全删除"{name}"及其所有商家吗？此操作无法撤销。',
  delete: '删除',

  // Settings Modal
  settings: '设置',
  narrationAudio: '旁白音频',
  narrationAudioHint: '靠近时自动播放',
  textSize: '字体大小',
  textSizeHint: '调整可读性',
  changePassword: '修改密码',
  changePasswordHint: '更新账户密码',

  // Change Password Modal
  currentPassword: '当前密码',
  newPassword: '新密码',
  confirmNewPassword: '确认新密码',
  newPasswordsMismatch: '新密码不一致',
  passwordChangedSuccess: '密码修改成功！',
  savePassword: '保存密码',

  // Admin Screen
  adminPanel: '管理面板',
  dashboard: '仪表盘',
  users: '用户',
  vendors: '商家',
  comments: '评论',
  addNewVendor: '添加新商家',
  backToMap: '返回地图',
  signedInAs: '当前登录：',
  searchPlaceholder: '搜索街道或商家...',

  // Admin Dashboard
  streetFoodCreated: '已创建美食街',
  streetsBadge: '街道',
  totalVendors: '商家总数',
  activeBadge: '活跃',
  totalUsers: '用户总数',
  globalBadge: '全球',
  totalComments: '评论总数',
  newBadge: '新增',
  topPerformingStreets: '最热门街道',
  topStreetsSubtitle: '按商家数量排名的高流量街道',
  viewAllMaps: '查看全部地图',
  noStreetsYet: '暂无街道',
  rankLabel: '排名',
  vendorActivityChart: '商家活动图表',
  recentActivity: '最近动态',
  noActivityYet: '暂无动态',
  newComment: '新评论',
  clearAllLogs: '清除全部日志',
  needInsights: '需要分析报告？',
  needInsightsDesc: '为您的数据生成全面的街道绩效报告。',
  getReport: '获取报告 →',
  vendorCountOneShort: '{count}家',
  vendorCountManyShort: '{count}家',

  // Time Ago
  minAgo: '{n}分钟前',
  minsAgo: '{n}分钟前',
  hourAgo: '{n}小时前',
  hoursAgo: '{n}小时前',
  dayAgo: '{n}天前',
  daysAgo: '{n}天前',

  // Admin Users Tab
  usersHeading: '用户',
  deleteUserConfirm: '删除该用户？',

  // Admin Vendors Tab
  allVendors: '全部商家',
  assignOwnerPlaceholder: '输入负责人用户名',
  save: '保存',
  deleteVendorConfirm: '删除商家"{name}"？',

  // Admin Comments Tab
  allComments: '全部评论',
  noCommentsYet: '暂无评论',
  deleteCommentConfirm: '删除此评论？',

  // App Toasts
  streetAdded: '街道添加成功',
  failedAddStreet: '街道添加失败',
  streetUpdated: '街道更新成功',
  failedUpdateStreet: '街道更新失败',
  streetDeleted: '街道删除成功',
  failedDeleteStreet: '街道删除失败',
  vendorRequestSubmitted: '商家申请已提交！',
  vendorAdded: '商家添加成功',
  vendorUpdated: '商家更新成功',
  failedAddVendor: '商家添加失败',
  linkCopied: '链接已复制到剪贴板！',

  // Language Picker
  languageLabel: '语言',
};
