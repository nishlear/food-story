import type { Translations } from '../types';

export const ja: Translations = {
  // Auth
  signInSubtitle: 'ログインしてフードストリートを探索しましょう',
  createAccountSubtitle: '新しいアカウントを作成',
  username: 'ユーザー名',
  usernamePlaceholder: '例: admin',
  chooseUsernamePlaceholder: 'ユーザー名を選択',
  password: 'パスワード',
  confirmPassword: 'パスワード確認',
  invalidCredentials: 'ユーザー名またはパスワードが正しくありません',
  connectionError: '接続エラーです。もう一度お試しください。',
  signingIn: 'ログイン中…',
  signIn: 'ログイン',
  noAccount: 'アカウントをお持ちでない方はこちら',
  creatingAccount: 'アカウント作成中…',
  createAccount: 'アカウント作成',
  alreadyHaveAccount: 'アカウントをお持ちの方はログイン',
  passwordMismatch: 'パスワードが一致しません',

  // Location Selection
  whereAreYou: 'どこにいますか？',
  selectStreetHaven: 'フードストリートを選択',
  roleAdmin: '管理者',
  roleVendor: '販売者',
  roleUser: 'ユーザー',
  adminPanelTitle: '管理パネル',
  logout: 'ログアウト',
  vendorCountOne: '{count}店舗',
  vendorCountMany: '{count}店舗',

  // Map Interface
  tapToPlaceVendor: 'マップをタップして店舗を配置',
  tapMapToPlacePin: 'マップをタップしてピンを置く',
  pinSaved: 'ピン位置を保存しました',
  failedSavePin: 'ピン位置の保存に失敗しました',
  tapMapToPlacePinFor: '{name}のピンを置くにはマップをタップ',
  placePinHere: 'ここにピンを置きますか？',
  cancel: 'キャンセル',
  confirm: '確認',
  mapFailedToLoad: 'マップの読み込みに失敗しました。再読み込みしてください。',

  // Vendor Bottom Sheet
  getDirections: '経路案内',
  share: '共有',
  about: 'お店について',
  defaultDescription: '何世代にもわたって受け継がれた秘伝のレシピと本格的な味で知られる伝説のスポット。漂う香りだけで遠くからも人々を引き寄せます。',
  reviews: 'レビュー',

  // Vendor Rate Form
  leaveReview: 'レビューを書く',
  shareExperience: 'ご体験をシェアしてください…',
  selectRatingError: '評価を選択してください',
  submitting: '送信中…',
  submitReview: 'レビューを投稿',

  // Vendor Comments List
  noReviewsYet: 'まだレビューがありません。最初の方になりましょう！',

  // Vendor Edit Modal
  editVendor: '店舗を編集',
  name: '名前',
  description: '説明',
  imageUrlsLabel: '画像URL（1行に1つ）',
  imageUrlsPlaceholder: 'https://example.com/image.jpg',
  saving: '保存中…',
  saveChanges: '変更を保存',
  setLocationOnMap: 'マップで位置を設定',

  // Add Vendor Modal
  addVendor: '店舗を追加',
  requestVendor: '店舗リクエスト',
  vendorName: '店舗名',
  vendorNamePlaceholder: '例: 老舗ラーメン',
  briefDescriptionPlaceholder: '簡単な説明...',
  initialRating: '初期評価',
  submitRequest: 'リクエストを送信',

  // Add Location Modal
  addFoodStreet: 'フードストリートを追加',
  streetName: 'ストリート名',
  streetNamePlaceholder: '例: 築地場外市場',
  city: '都市',
  cityPlaceholder: '例: 東京',
  addStreet: 'ストリートを追加',

  // Edit Location Modal
  editFoodStreet: 'フードストリートを編集',
  mapBoundingBox: 'マップ範囲',
  mapBoundingBoxHint: 'オプション — マップ画像を生成',
  nwLatitude: '北西緯度（上）',
  nwLongitude: '北西経度（左）',
  seLatitude: '南東緯度（下）',
  seLongitude: '南東経度（右）',
  mapImageWillGenerate: '保存時にマップ画像が生成されます。',
  update: '更新',

  // Delete Location Modal
  deleteFoodStreet: 'フードストリートを削除しますか？',
  deleteLocationConfirm: '「{name}」とそのすべての店舗を完全に削除してもよろしいですか？この操作は取り消せません。',
  delete: '削除',

  // Settings Modal
  settings: '設定',
  narrationAudio: 'ナレーション音声',
  narrationAudioHint: '近くで自動再生',
  textSize: '文字サイズ',
  textSizeHint: '読みやすさを調整',
  changePassword: 'パスワード変更',
  changePasswordHint: 'アカウントのパスワードを更新',

  // Change Password Modal
  currentPassword: '現在のパスワード',
  newPassword: '新しいパスワード',
  confirmNewPassword: '新しいパスワードを確認',
  newPasswordsMismatch: '新しいパスワードが一致しません',
  passwordChangedSuccess: 'パスワードが正常に変更されました！',
  savePassword: 'パスワードを保存',

  // Admin Screen
  adminPanel: '管理パネル',
  dashboard: 'ダッシュボード',
  users: 'ユーザー',
  vendors: '店舗',
  comments: 'コメント',
  addNewVendor: '新しい店舗を追加',
  backToMap: 'マップに戻る',
  signedInAs: 'ログイン中:',
  searchPlaceholder: 'ストリートや店舗を検索...',

  // Admin Dashboard
  streetFoodCreated: '作成済みフードストリート',
  streetsBadge: 'ストリート',
  totalVendors: '総店舗数',
  activeBadge: '稼働中',
  totalUsers: '総ユーザー数',
  globalBadge: 'グローバル',
  totalComments: '総コメント数',
  newBadge: '新規',
  topPerformingStreets: '人気ストリートランキング',
  topStreetsSubtitle: '店舗数順の高トラフィックスポット',
  viewAllMaps: '全マップを見る',
  noStreetsYet: 'まだストリートがありません',
  rankLabel: 'ランク',
  vendorActivityChart: '店舗活動チャート',
  recentActivity: '最近のアクティビティ',
  noActivityYet: 'まだアクティビティがありません',
  newComment: '新しいコメント',
  clearAllLogs: 'すべてのログを削除',
  needInsights: 'インサイトが必要ですか？',
  needInsightsDesc: 'データの包括的なストリートパフォーマンスレポートを生成します。',
  getReport: 'レポートを取得 →',
  vendorCountOneShort: '{count}店',
  vendorCountManyShort: '{count}店',

  // Time Ago
  minAgo: '{n}分前',
  minsAgo: '{n}分前',
  hourAgo: '{n}時間前',
  hoursAgo: '{n}時間前',
  dayAgo: '{n}日前',
  daysAgo: '{n}日前',

  // Admin Users Tab
  usersHeading: 'ユーザー',
  deleteUserConfirm: 'このユーザーを削除しますか？',

  // Admin Vendors Tab
  allVendors: '全店舗',
  assignOwnerPlaceholder: 'オーナーのユーザー名を入力',
  save: '保存',
  deleteVendorConfirm: '店舗「{name}」を削除しますか？',

  // Admin Comments Tab
  allComments: '全コメント',
  noCommentsYet: 'まだコメントがありません',
  deleteCommentConfirm: 'このコメントを削除しますか？',

  // App Toasts
  streetAdded: 'ストリートを追加しました',
  failedAddStreet: 'ストリートの追加に失敗しました',
  streetUpdated: 'ストリートを更新しました',
  failedUpdateStreet: 'ストリートの更新に失敗しました',
  streetDeleted: 'ストリートを削除しました',
  failedDeleteStreet: 'ストリートの削除に失敗しました',
  vendorRequestSubmitted: '店舗リクエストを送信しました！',
  vendorAdded: '店舗を追加しました',
  vendorUpdated: '店舗を更新しました',
  failedAddVendor: '店舗の追加に失敗しました',
  linkCopied: 'リンクをコピーしました！',

  // Language Picker
  languageLabel: '言語',

  // TTS Settings
  cooldownLabel: '自動ナレーションのクールダウン',
  cooldownHint: '同じ店舗を再ナレーションするまでの時間',
  cooldown5min: '5分',
  cooldown10min: '10分',
  cooldown20min: '20分',
  cooldown30min: '30分',
  cooldown1hr: '1時間',
  cooldownNever: '自動トリガーなし',
  gpsAccuracyWarning: 'GPSの精度が低い場合、この機能が正常に動作しない場合があります',
  gpsLowAccuracyTitle: 'GPS精度が低下',
  gpsLowAccuracyMessage: 'GPSの精度が低くなっています。自動ナレーションが正常に動作しない可能性があります。無効にしますか？',
  disable: '無効にする',
  keepEnabled: '有効のまま',
  transitionPhrase: '{from}を離れました。次は{to}をご紹介します',
  ttsSpeedLabel: 'ナレーション速度',
  ttsSpeedHint: '音声が説明を読む速さ',
};
