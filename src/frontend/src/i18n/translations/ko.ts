import type { Translations } from '../types';

export const ko: Translations = {
  // Auth
  signInSubtitle: '로그인하여 음식 거리를 탐험하세요',
  createAccountSubtitle: '새 계정 만들기',
  username: '사용자 이름',
  usernamePlaceholder: '예: admin',
  chooseUsernamePlaceholder: '사용자 이름 선택',
  password: '비밀번호',
  confirmPassword: '비밀번호 확인',
  invalidCredentials: '사용자 이름 또는 비밀번호가 올바르지 않습니다',
  connectionError: '연결 오류. 다시 시도해 주세요.',
  signingIn: '로그인 중…',
  signIn: '로그인',
  noAccount: '계정이 없으신가요? 만들기',
  creatingAccount: '계정 생성 중…',
  createAccount: '계정 만들기',
  alreadyHaveAccount: '이미 계정이 있으신가요? 로그인',
  passwordMismatch: '비밀번호가 일치하지 않습니다',

  // Location Selection
  whereAreYou: '어디 계세요?',
  selectStreetHaven: '음식 거리를 선택하세요',
  roleAdmin: '관리자',
  roleVendor: '판매자',
  roleUser: '사용자',
  adminPanelTitle: '관리자 패널',
  logout: '로그아웃',
  vendorCountOne: '{count}개 가게',
  vendorCountMany: '{count}개 가게',

  // Map Interface
  tapToPlaceVendor: '지도를 탭하여 가게를 배치하세요',
  tapMapToPlacePin: '지도를 탭하여 핀을 놓으세요',
  pinSaved: '핀 위치가 저장되었습니다',
  failedSavePin: '핀 위치 저장에 실패했습니다',
  tapMapToPlacePinFor: '{name}의 핀을 놓으려면 지도를 탭하세요',
  placePinHere: '여기에 핀을 놓을까요?',
  cancel: '취소',
  confirm: '확인',
  mapFailedToLoad: '지도를 불러오지 못했습니다. 새로 고침하세요.',

  // Vendor Bottom Sheet
  getDirections: '길 안내',
  share: '공유',
  about: '소개',
  defaultDescription: '대대로 전해 내려온 정통 맛과 비밀 레시피로 유명한 전설적인 곳입니다. 향기만으로도 멀리서 사람들을 끌어모읍니다.',
  reviews: '리뷰',

  // Vendor Rate Form
  leaveReview: '리뷰 작성',
  shareExperience: '경험을 공유해 주세요…',
  selectRatingError: '별점을 선택해 주세요',
  submitting: '제출 중…',
  submitReview: '리뷰 제출',

  // Vendor Comments List
  noReviewsYet: '아직 리뷰가 없습니다. 첫 번째로 작성해 보세요!',

  // Vendor Edit Modal
  editVendor: '가게 편집',
  name: '이름',
  description: '설명',
  imageUrlsLabel: '이미지 URL (한 줄에 하나씩)',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: '저장 중…',
  saveChanges: '변경 사항 저장',
  setLocationOnMap: '지도에서 위치 설정',

  // Add Vendor Modal
  addVendor: '가게 추가',
  requestVendor: '가게 요청',
  vendorName: '가게 이름',
  vendorNamePlaceholder: '예: 떡볶이 명인',
  briefDescriptionPlaceholder: '간단한 설명...',
  initialRating: '초기 평점',
  submitRequest: '요청 제출',

  // Add Location Modal
  addFoodStreet: '음식 거리 추가',
  streetName: '거리 이름',
  streetNamePlaceholder: '예: 명동 먹자골목',
  city: '도시',
  cityPlaceholder: '예: 서울',
  addStreet: '거리 추가',

  // Edit Location Modal
  editFoodStreet: '음식 거리 편집',
  mapBoundingBox: '지도 영역',
  mapBoundingBoxHint: '선택 사항 — 지도 이미지 생성',
  nwLatitude: '북서 위도 (위)',
  nwLongitude: '북서 경도 (왼쪽)',
  seLatitude: '동남 위도 (아래)',
  seLongitude: '동남 경도 (오른쪽)',
  mapImageWillGenerate: '저장 시 지도 이미지가 생성됩니다.',
  update: '업데이트',

  // Delete Location Modal
  deleteFoodStreet: '음식 거리 삭제?',
  deleteLocationConfirm: '"{name}"과 모든 가게를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  delete: '삭제',

  // Settings Modal
  settings: '설정',
  narrationAudio: '내레이션 오디오',
  narrationAudioHint: '근처에서 자동 재생',
  textSize: '글자 크기',
  textSizeHint: '가독성 조정',
  changePassword: '비밀번호 변경',
  changePasswordHint: '계정 비밀번호 업데이트',

  // Change Password Modal
  currentPassword: '현재 비밀번호',
  newPassword: '새 비밀번호',
  confirmNewPassword: '새 비밀번호 확인',
  newPasswordsMismatch: '새 비밀번호가 일치하지 않습니다',
  passwordChangedSuccess: '비밀번호가 성공적으로 변경되었습니다!',
  savePassword: '비밀번호 저장',

  // Admin Screen
  adminPanel: '관리자 패널',
  dashboard: '대시보드',
  users: '사용자',
  vendors: '가게',
  comments: '댓글',
  addNewVendor: '새 가게 추가',
  backToMap: '지도로 돌아가기',
  signedInAs: '로그인:',
  searchPlaceholder: '거리 또는 가게 검색...',

  // Admin Dashboard
  streetFoodCreated: '생성된 음식 거리',
  streetsBadge: '거리',
  totalVendors: '총 가게 수',
  activeBadge: '활성',
  totalUsers: '총 사용자 수',
  globalBadge: '전체',
  totalComments: '총 댓글 수',
  newBadge: '신규',
  topPerformingStreets: '인기 음식 거리',
  topStreetsSubtitle: '가게 수 기준 상위 거리',
  viewAllMaps: '모든 지도 보기',
  noStreetsYet: '아직 거리가 없습니다',
  rankLabel: '순위',
  vendorActivityChart: '가게 활동 차트',
  recentActivity: '최근 활동',
  noActivityYet: '아직 활동이 없습니다',
  newComment: '새 댓글',
  clearAllLogs: '모든 로그 지우기',
  needInsights: '인사이트가 필요하신가요?',
  needInsightsDesc: '데이터에 대한 종합적인 거리 성과 보고서를 생성하세요.',
  getReport: '보고서 보기 →',
  vendorCountOneShort: '{count}개',
  vendorCountManyShort: '{count}개',

  // Time Ago
  minAgo: '{n}분 전',
  minsAgo: '{n}분 전',
  hourAgo: '{n}시간 전',
  hoursAgo: '{n}시간 전',
  dayAgo: '{n}일 전',
  daysAgo: '{n}일 전',

  // Admin Users Tab
  usersHeading: '사용자',
  deleteUserConfirm: '이 사용자를 삭제할까요?',

  // Admin Vendors Tab
  allVendors: '모든 가게',
  assignOwnerPlaceholder: '소유자 사용자 이름 입력',
  save: '저장',
  deleteVendorConfirm: '가게 "{name}"을(를) 삭제할까요?',

  // Admin Comments Tab
  allComments: '모든 댓글',
  noCommentsYet: '아직 댓글이 없습니다',
  deleteCommentConfirm: '이 댓글을 삭제할까요?',

  // App Toasts
  streetAdded: '거리가 성공적으로 추가되었습니다',
  failedAddStreet: '거리 추가에 실패했습니다',
  streetUpdated: '거리가 성공적으로 업데이트되었습니다',
  failedUpdateStreet: '거리 업데이트에 실패했습니다',
  streetDeleted: '거리가 성공적으로 삭제되었습니다',
  failedDeleteStreet: '거리 삭제에 실패했습니다',
  vendorRequestSubmitted: '가게 요청이 제출되었습니다!',
  vendorAdded: '가게가 성공적으로 추가되었습니다',
  vendorUpdated: '가게가 성공적으로 업데이트되었습니다',
  failedAddVendor: '가게 추가에 실패했습니다',
  linkCopied: '링크가 클립보드에 복사되었습니다!',

  // Language Picker
  languageLabel: '언어',

  // TTS Settings
  cooldownLabel: '자동 내레이션 대기 시간',
  cooldownHint: '같은 가게를 다시 내레이션하기 전 대기 시간',
  cooldown5min: '5분',
  cooldown10min: '10분',
  cooldown20min: '20분',
  cooldown30min: '30분',
  cooldown1hr: '1시간',
  cooldownNever: '자동 실행 안 함',
  gpsAccuracyWarning: 'GPS 정확도가 낮으면 이 기능이 작동하지 않을 수 있습니다',
  gpsLowAccuracyTitle: 'GPS 정확도 낮음',
  gpsLowAccuracyMessage: 'GPS 정확도가 낮습니다. 자동 내레이션이 제대로 작동하지 않을 수 있습니다. 비활성화하시겠습니까?',
  disable: '비활성화',
  keepEnabled: '계속 사용',
  transitionPhrase: '{from}을(를) 떠나 {to}을(를) 소개합니다',
};
