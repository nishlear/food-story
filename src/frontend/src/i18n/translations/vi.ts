import type { Translations } from '../types';

export const vi: Translations = {
  // Auth
  signInSubtitle: 'Đăng nhập để khám phá phố ẩm thực',
  createAccountSubtitle: 'Tạo tài khoản mới',
  username: 'Tên đăng nhập',
  usernamePlaceholder: 'VD: admin',
  chooseUsernamePlaceholder: 'Chọn tên đăng nhập',
  password: 'Mật khẩu',
  confirmPassword: 'Xác nhận mật khẩu',
  invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng',
  connectionError: 'Lỗi kết nối. Vui lòng thử lại.',
  signingIn: 'Đang đăng nhập…',
  signIn: 'Đăng nhập',
  noAccount: 'Chưa có tài khoản? Tạo ngay',
  creatingAccount: 'Đang tạo tài khoản…',
  createAccount: 'Tạo tài khoản',
  alreadyHaveAccount: 'Đã có tài khoản? Đăng nhập',
  passwordMismatch: 'Mật khẩu không khớp',

  // Location Selection
  whereAreYou: 'Bạn đang ở đâu?',
  selectStreetHaven: 'Chọn một phố ẩm thực',
  roleAdmin: 'Quản trị',
  roleVendor: 'Người bán',
  roleUser: 'Người dùng',
  adminPanelTitle: 'Trang quản trị',
  logout: 'Đăng xuất',
  vendorCountOne: '{count} quán',
  vendorCountMany: '{count} quán',

  // Map Interface
  tapToPlaceVendor: 'Nhấn vào bản đồ để đặt quán',
  tapMapToPlacePin: 'Nhấn bản đồ để đặt ghim',
  pinSaved: 'Đã lưu vị trí ghim',
  failedSavePin: 'Không thể lưu vị trí ghim',
  tapMapToPlacePinFor: 'Nhấn bản đồ để đặt ghim cho {name}',
  placePinHere: 'Đặt ghim tại đây?',
  cancel: 'Hủy',
  confirm: 'Xác nhận',
  mapFailedToLoad: 'Bản đồ tải thất bại. Hãy tải lại trang.',

  // Vendor Bottom Sheet
  getDirections: 'Chỉ đường',
  share: 'Chia sẻ',
  about: 'Giới thiệu',
  defaultDescription: 'Một địa điểm huyền thoại nổi tiếng với hương vị đặc trưng và công thức gia truyền qua nhiều thế hệ. Mùi thơm từ xa đã đủ để thu hút thực khách từ khắp nơi.',
  reviews: 'Đánh giá',

  // Vendor Rate Form
  leaveReview: 'Viết đánh giá',
  shareExperience: 'Chia sẻ trải nghiệm của bạn…',
  selectRatingError: 'Vui lòng chọn số sao',
  submitting: 'Đang gửi…',
  submitReview: 'Gửi đánh giá',

  // Vendor Comments List
  noReviewsYet: 'Chưa có đánh giá. Hãy là người đầu tiên!',

  // Vendor Edit Modal
  editVendor: 'Sửa quán',
  name: 'Tên',
  description: 'Mô tả',
  imageUrlsLabel: 'URL hình ảnh (mỗi dòng một URL)',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: 'Đang lưu…',
  saveChanges: 'Lưu thay đổi',
  setLocationOnMap: 'Đặt vị trí trên bản đồ',

  // Add Vendor Modal
  addVendor: 'Thêm quán',
  requestVendor: 'Yêu cầu thêm quán',
  vendorName: 'Tên quán',
  vendorNamePlaceholder: 'VD: Phở Gia Truyền',
  briefDescriptionPlaceholder: 'Mô tả ngắn...',
  initialRating: 'Đánh giá ban đầu',
  submitRequest: 'Gửi yêu cầu',

  // Add Location Modal
  addFoodStreet: 'Thêm phố ẩm thực',
  streetName: 'Tên phố',
  streetNamePlaceholder: 'VD: Phố Hàng Bông',
  city: 'Thành phố',
  cityPlaceholder: 'VD: Hà Nội',
  addStreet: 'Thêm phố',

  // Edit Location Modal
  editFoodStreet: 'Sửa phố ẩm thực',
  mapBoundingBox: 'Vùng bản đồ',
  mapBoundingBoxHint: 'tùy chọn — tạo ảnh bản đồ',
  nwLatitude: 'Vĩ độ TBắc (trên)',
  nwLongitude: 'Kinh độ TBắc (trái)',
  seLatitude: 'Vĩ độ ĐNam (dưới)',
  seLongitude: 'Kinh độ ĐNam (phải)',
  mapImageWillGenerate: 'Ảnh bản đồ sẽ được tạo khi lưu.',
  update: 'Cập nhật',

  // Delete Location Modal
  deleteFoodStreet: 'Xóa phố ẩm thực?',
  deleteLocationConfirm: 'Bạn có chắc muốn xóa hoàn toàn "{name}" và tất cả các quán của nó? Hành động này không thể hoàn tác.',
  delete: 'Xóa',

  // Settings Modal
  settings: 'Cài đặt',
  narrationAudio: 'Âm thanh thuyết minh',
  narrationAudioHint: 'Tự động phát khi ở gần',
  textSize: 'Cỡ chữ',
  textSizeHint: 'Điều chỉnh độ dễ đọc',
  changePassword: 'Đổi mật khẩu',
  changePasswordHint: 'Cập nhật mật khẩu tài khoản',

  // Change Password Modal
  currentPassword: 'Mật khẩu hiện tại',
  newPassword: 'Mật khẩu mới',
  confirmNewPassword: 'Xác nhận mật khẩu mới',
  newPasswordsMismatch: 'Mật khẩu mới không khớp',
  passwordChangedSuccess: 'Đổi mật khẩu thành công!',
  savePassword: 'Lưu mật khẩu',

  // Admin Screen
  adminPanel: 'Trang quản trị',
  dashboard: 'Tổng quan',
  users: 'Người dùng',
  vendors: 'Quán ăn',
  comments: 'Bình luận',
  addNewVendor: 'Thêm quán mới',
  backToMap: 'Về bản đồ',
  signedInAs: 'Đăng nhập với',
  searchPlaceholder: 'Tìm phố hoặc quán...',

  // Admin Dashboard
  streetFoodCreated: 'Phố ẩm thực đã tạo',
  streetsBadge: 'Phố',
  totalVendors: 'Tổng số quán',
  activeBadge: 'Hoạt động',
  totalUsers: 'Tổng người dùng',
  globalBadge: 'Toàn cầu',
  totalComments: 'Tổng bình luận',
  newBadge: 'Mới',
  topPerformingStreets: 'Phố nổi bật nhất',
  topStreetsSubtitle: 'Các phố đông đúc nhất theo số lượng quán',
  viewAllMaps: 'Xem tất cả bản đồ',
  noStreetsYet: 'Chưa có phố nào',
  rankLabel: 'Hạng',
  vendorActivityChart: 'Biểu đồ hoạt động quán ăn',
  recentActivity: 'Hoạt động gần đây',
  noActivityYet: 'Chưa có hoạt động',
  newComment: 'Bình luận mới',
  clearAllLogs: 'Xóa tất cả nhật ký',
  needInsights: 'Cần phân tích?',
  needInsightsDesc: 'Tạo báo cáo hiệu suất toàn diện cho dữ liệu của bạn.',
  getReport: 'Xem báo cáo →',
  vendorCountOneShort: '{count} quán',
  vendorCountManyShort: '{count} quán',

  // Time Ago
  minAgo: '{n} phút trước',
  minsAgo: '{n} phút trước',
  hourAgo: '{n} giờ trước',
  hoursAgo: '{n} giờ trước',
  dayAgo: '{n} ngày trước',
  daysAgo: '{n} ngày trước',

  // Admin Users Tab
  usersHeading: 'Người dùng',
  deleteUserConfirm: 'Xóa người dùng này?',

  // Admin Vendors Tab
  allVendors: 'Tất cả quán',
  assignOwnerPlaceholder: 'Nhập tên chủ quán',
  save: 'Lưu',
  deleteVendorConfirm: 'Xóa quán "{name}"?',

  // Admin Comments Tab
  allComments: 'Tất cả bình luận',
  noCommentsYet: 'Chưa có bình luận',
  deleteCommentConfirm: 'Xóa bình luận này?',

  // App Toasts
  streetAdded: 'Đã thêm phố thành công',
  failedAddStreet: 'Không thể thêm phố',
  streetUpdated: 'Đã cập nhật phố thành công',
  failedUpdateStreet: 'Không thể cập nhật phố',
  streetDeleted: 'Đã xóa phố thành công',
  failedDeleteStreet: 'Không thể xóa phố',
  vendorRequestSubmitted: 'Đã gửi yêu cầu thêm quán!',
  vendorAdded: 'Đã thêm quán thành công',
  failedAddVendor: 'Không thể thêm quán',
  linkCopied: 'Đã sao chép liên kết!',

  // Language Picker
  languageLabel: 'Ngôn ngữ',
};
