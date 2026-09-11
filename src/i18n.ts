import { useEffect, useState } from 'react';

export type Language = 'th' | 'en' | 'ja';

const th = {
  language: 'ภาษา', help: 'วิธีใช้งาน', closeHelp: 'ปิดวิธีใช้งาน',
  tagline: 'วอลเปเปอร์ที่เป็นคุณมากขึ้น', studio: 'สตูดิโอวอลเปเปอร์ของคุณ',
  headingPhoto: 'รูปของคุณ', headingMusic: 'เพลงของคุณ', subtitle: 'เก็บความรู้สึกดี ๆ ไว้บนหน้าจอ',
  template: 'เครื่องเล่นเพลง', templateNowPlaying: 'Now Playing (ธีมมืด)',
  templateSectionTitle: 'รูปแบบเทมเพลต', templateSelectLabel: 'เลือกรูปแบบเทมเพลต',
  sideNote: 'จากสิ่งเล็ก ๆ ที่คุณรัก', makeYours: 'สร้างให้เป็นคุณ',
  personal: 'เติมความเป็นคุณ', editor: 'แต่งวอลเปเปอร์', editorLabel: 'เครื่องมือแต่งวอลเปเปอร์',
  preview: 'ภาพตัวอย่าง', previewLabel: 'ตัวอย่างวอลเปเปอร์', viewPreview: 'ดูตัวอย่าง',
  guides: 'จำลอง Lock Screen', guidesNote: 'นาฬิกาและวิดเจ็ตไม่ติดในไฟล์ PNG',
  guidesLabel: 'นาฬิกาและวิดเจ็ตจำลอง ไม่ติดในไฟล์ PNG', previewDate: 'วันจันทร์ที่ 9 กันยายน',
  privacy: 'รูปของคุณอยู่บนเครื่องของคุณเสมอ',
  helpTitle: 'จากรูปโปรด สู่หน้าจอของคุณ',
  helpStep1: 'เลือกรุ่น iPhone แล้วอัปโหลดรูป',
  helpStep2: 'ลากรูปในพรีวิวและปรับซูม ใส่ข้อความและเลือกสี',
  helpStep3: 'ดาวน์โหลด PNG แล้วเปิดรูปบน iPhone กดแชร์ → ใช้เป็นภาพพื้นหลัง',
  helpPhotos: 'บน iPhone หากไฟล์อยู่ใน Downloads ให้เปิดไฟล์ กดแชร์ แล้วเลือกบันทึกรูปภาพก่อนตั้งวอลเปเปอร์ นาฬิกาจำลองไม่ติดใน PNG และตำแหน่งจริงขึ้นกับการตั้งค่า iOS',
  helpStorage: 'งานล่าสุดเก็บเฉพาะเบราว์เซอร์นี้ การล้างข้อมูลเว็บไซต์หรือโหมดส่วนตัวอาจทำให้งานหาย',
  loadingDraft: 'กำลังเปิดงาน…', saved: 'บันทึกในเครื่องแล้ว', saving: 'กำลังบันทึก…',
  restoreError: 'เปิดงานเดิมไม่ได้ · แต่งและดาวน์โหลดได้', saveError: 'บันทึกไม่ได้ · กรุณาดาวน์โหลดเก็บไว้',
  screen: 'หน้าจอของคุณ', device: 'รุ่น iPhone', appleSize: 'ขนาดจาก Apple',
  photo: 'รูปโปรดของคุณ', removePhoto: 'ลบรูป', uploadPhoto: 'อัปโหลดรูปปก',
  preparingPhoto: 'กำลังเตรียมรูป…', changePhoto: 'เปลี่ยนรูปภาพ', choosePhoto: 'เลือกหรือลากรูปมาวาง',
  fileTypes: 'JPG, PNG, WebP · สูงสุด 30 MB', zoom: 'ซูมรูป', center: 'จัดกึ่งกลาง',
  cropHint: 'ลากรูปในภาพตัวอย่างเพื่อจัดตำแหน่ง', dragPhoto: 'เลื่อนรูปปก ใช้ปุ่มลูกศรเพื่อจัดตำแหน่ง',
  dragHint: 'ลากเพื่อจัดรูป', emptyImage: 'ใส่รูปที่เป็นคุณ',
  music: 'เพลงที่เป็นคุณ', title: 'ชื่อเพลง / ข้อความ', titlePlaceholder: 'เพลงโปรดของคุณ',
  artist: 'ศิลปิน', artistPlaceholder: 'ชื่อศิลปิน หรือใครสักคน', elapsed: 'เวลาปัจจุบัน', duration: 'ความยาวเพลง',
  timeError: 'ใช้รูปแบบนาที:วินาที เช่น 0:42 โดยเวลาปัจจุบันไม่เกินความยาวเพลง และความยาวต้องมากกว่า 0:00',
  colors: 'สีและบรรยากาศ', extractedColors: 'สีจากรูปของคุณ', palette: 'ชุดสี',
  colorsAutoHint: 'พื้นหลังและสีข้อความคำนวณอัตโนมัติจากรูปสำหรับเทมเพลตนี้',
  chooseBackground: 'เลือกสีพื้นหลัง', background: 'สีพื้นหลัง', foreground: 'ข้อความและไอคอน',
  automatic: 'อัตโนมัติ', showPalette: 'แสดง Color Palette', signature: 'ลายเซ็นของคุณ',
  showCredit: 'แสดงเครดิตด้านล่าง', credit: 'ข้อความเครดิต', creditPlaceholder: '@yourname หรือข้อความสั้น ๆ',
  dismissError: 'ปิดข้อความผิดพลาด', pngReady: 'PNG พร้อมแล้ว', downloadRetry: 'หากดาวน์โหลดไม่เริ่ม',
  saveAgain: 'กดบันทึกอีกครั้ง', share: 'แชร์ / บันทึกรูปภาพ', exporting: 'กำลังสร้างวอลเปเปอร์…',
  download: 'ดาวน์โหลด PNG', startHint: 'เลือกรูปโปรดของคุณเพื่อเริ่มต้น', noWatermark: 'ไม่มีลายน้ำ',
  footer: 'ช่วงเวลาเล็ก ๆ ที่เก็บไว้ได้', footerNote: 'สร้างด้วยรูปของคุณ และความรู้สึกของคุณ',
  imageDecodeError: 'เปิดรูปนี้ไม่ได้ ลองใช้ JPG, PNG หรือ WebP หากเป็น HEIC ให้แปลงเป็น JPG ก่อน',
  imageSizeError: 'รูปใหญ่เกิน 30 MB กรุณาเลือกรูปที่เล็กลง', imageTypeError: 'กรุณาเลือกไฟล์รูป JPG, PNG หรือ WebP',
  canvasError: 'เบราว์เซอร์นี้ไม่รองรับการแต่งรูป', imageExportError: 'สร้างรูปไม่สำเร็จ กรุณาลองอีกครั้ง',
  importError: 'เปิดรูปไม่สำเร็จ กรุณาลองอีกครั้ง', exportError: 'สร้าง PNG ไม่สำเร็จ กรุณาลองอีกครั้ง',
  shareError: 'แชร์รูปไม่สำเร็จ ใช้ปุ่มดาวน์โหลด PNG ได้เลย',
};

export type MessageKey = keyof typeof th;
export type Messages = Record<MessageKey, string>;

const en: Messages = {
  language: 'Language', help: 'How to use', closeHelp: 'Close help',
  tagline: 'A wallpaper, a little more you.', studio: 'Your personal wallpaper studio',
  headingPhoto: 'Your photo.', headingMusic: 'Your song.', subtitle: 'Keep a little feeling on your screen.',
  template: 'Music player', templateNowPlaying: 'Now Playing (dark)',
  templateSectionTitle: 'Template style', templateSelectLabel: 'Choose template style',
  sideNote: 'Made of your favorite things', makeYours: 'Make it yours.',
  personal: 'Let’s make it personal', editor: 'Edit wallpaper', editorLabel: 'Wallpaper editing tools',
  preview: 'Preview', previewLabel: 'Wallpaper preview', viewPreview: 'Preview',
  guides: 'Lock Screen preview', guidesNote: 'Clock and widgets are not included in the PNG',
  guidesLabel: 'Simulated clock and widgets, not included in the PNG', previewDate: 'Monday, September 9',
  privacy: 'Your photos stay on your device.',
  helpTitle: 'From a favorite photo to your screen',
  helpStep1: 'Choose your iPhone model and upload a photo.',
  helpStep2: 'Drag and zoom the photo in the preview, add your text, and choose colors.',
  helpStep3: 'Download the PNG, open it on your iPhone, then tap Share → Use as Wallpaper.',
  helpPhotos: 'If the file is in Downloads on your iPhone, open it, tap Share, and choose Save Image before setting your wallpaper. The simulated clock is not included in the PNG. Its actual position depends on your iOS settings.',
  helpStorage: 'Your latest draft is saved only in this browser. Clearing website data or using private browsing may remove it.',
  loadingDraft: 'Opening your draft…', saved: 'Saved on this device', saving: 'Saving…',
  restoreError: 'Could not restore your draft · You can still edit and download', saveError: 'Could not save · Please download a copy',
  screen: 'Your screen', device: 'iPhone model', appleSize: 'Apple specifications',
  photo: 'Your favorite photo', removePhoto: 'Remove photo', uploadPhoto: 'Upload cover image',
  preparingPhoto: 'Preparing your photo…', changePhoto: 'Change photo', choosePhoto: 'Choose or drop a photo',
  fileTypes: 'JPG, PNG, WebP · Up to 30 MB', zoom: 'Zoom', center: 'Recenter',
  cropHint: 'Drag the photo in the preview to reposition it.', dragPhoto: 'Move cover image. Use arrow keys to reposition.',
  dragHint: 'Drag to reposition', emptyImage: 'Add a photo that’s you',
  music: 'Your kind of music', title: 'Song title / text', titlePlaceholder: 'Your favorite song',
  artist: 'Artist', artistPlaceholder: 'An artist, or someone special', elapsed: 'Current time', duration: 'Song duration',
  timeError: 'Use minutes:seconds, such as 0:42. Current time cannot exceed the duration, and duration must be greater than 0:00.',
  colors: 'Colors & mood', extractedColors: 'From your photo', palette: 'Palette',
  colorsAutoHint: 'Background and text colors are calculated automatically from your photo for this template.',
  chooseBackground: 'Choose background color', background: 'Background', foreground: 'Text & icons',
  automatic: 'Auto', showPalette: 'Show color palette', signature: 'Your signature',
  showCredit: 'Show credit at the bottom', credit: 'Credit text', creditPlaceholder: '@yourname or a short message',
  dismissError: 'Dismiss error', pngReady: 'Your PNG is ready', downloadRetry: 'Download didn’t start?',
  saveAgain: 'Save again', share: 'Share / Save image', exporting: 'Creating your wallpaper…',
  download: 'Download PNG', startHint: 'Choose your favorite photo to get started', noWatermark: 'No watermark',
  footer: 'Little moments. Yours to keep.', footerNote: 'Made with your photos and your feelings.',
  imageDecodeError: 'Could not open this image. Try JPG, PNG, or WebP. Convert HEIC to JPG first if needed.',
  imageSizeError: 'This image exceeds 30 MB. Please choose a smaller file.', imageTypeError: 'Please choose a JPG, PNG, or WebP image.',
  canvasError: 'This browser does not support image editing.', imageExportError: 'Could not create the image. Please try again.',
  importError: 'Could not open the image. Please try again.', exportError: 'Could not create the PNG. Please try again.',
  shareError: 'Could not share the image. Use Download PNG instead.',
};

const ja: Messages = {
  language: '言語', help: '使い方', closeHelp: '使い方を閉じる',
  tagline: 'あなたらしさを、壁紙に。', studio: 'あなただけの壁紙スタジオ',
  headingPhoto: '好きな写真。', headingMusic: '好きな音楽。', subtitle: '大切な気持ちを、いつも画面に。',
  template: 'ミュージックプレーヤー', templateNowPlaying: 'Now Playing(ダーク)',
  templateSectionTitle: 'テンプレートスタイル', templateSelectLabel: 'テンプレートスタイルを選択',
  sideNote: 'あなたの好きなものを集めて', makeYours: 'あなたらしい一枚に。',
  personal: 'あなたらしさをプラス', editor: '壁紙を編集', editorLabel: '壁紙の編集ツール',
  preview: 'プレビュー', previewLabel: '壁紙のプレビュー', viewPreview: 'プレビュー',
  guides: 'ロック画面を再現', guidesNote: '時計とウィジェットはPNGに含まれません',
  guidesLabel: '時計とウィジェットの表示例です。PNGには含まれません', previewDate: '9月9日 月曜日',
  privacy: '写真はお使いの端末内だけで処理されます。',
  helpTitle: 'お気に入りの写真を、あなたの画面に',
  helpStep1: 'iPhoneのモデルを選び、写真をアップロードします。',
  helpStep2: 'プレビューで写真をドラッグ・ズームし、文字や色を調整します。',
  helpStep3: 'PNGをダウンロードしてiPhoneで開き、「共有」→「壁紙に設定」を選びます。',
  helpPhotos: 'iPhoneの「ダウンロード」に保存された場合は、ファイルを開いて「共有」→「画像を保存」を選んでから壁紙に設定してください。表示例の時計はPNGに含まれません。実際の位置はiOSの設定によって異なります。',
  helpStorage: '直近の編集内容はこのブラウザにのみ保存されます。サイトデータの削除やプライベートブラウズによって失われる場合があります。',
  loadingDraft: '編集内容を読み込み中…', saved: 'この端末に保存しました', saving: '保存中…',
  restoreError: '編集内容を復元できませんでした · 編集とダウンロードは可能です', saveError: '保存できませんでした · ダウンロードして保管してください',
  screen: 'あなたの画面', device: 'iPhoneのモデル', appleSize: 'Appleの仕様',
  photo: 'お気に入りの写真', removePhoto: '写真を削除', uploadPhoto: 'カバー画像をアップロード',
  preparingPhoto: '写真を準備中…', changePhoto: '写真を変更', choosePhoto: '写真を選択・ドロップ',
  fileTypes: 'JPG・PNG・WebP · 最大30 MB', zoom: 'ズーム', center: '中央に戻す',
  cropHint: 'プレビューの写真をドラッグして位置を調整できます。', dragPhoto: 'カバー画像を移動。矢印キーでも位置を調整できます。',
  dragHint: 'ドラッグして位置を調整', emptyImage: 'あなたらしい写真を選ぼう',
  music: 'あなたらしい音楽', title: '曲名 / テキスト', titlePlaceholder: 'お気に入りの曲',
  artist: 'アーティスト', artistPlaceholder: 'アーティストや大切な人の名前', elapsed: '再生位置', duration: '曲の長さ',
  timeError: '0:42のように「分:秒」で入力してください。再生位置は曲の長さ以内、曲の長さは0:00より長くしてください。',
  colors: '色と雰囲気', extractedColors: '写真から抽出した色', palette: 'パレット',
  colorsAutoHint: 'このテンプレートでは、背景と文字の色は写真から自動的に計算されます。',
  chooseBackground: '背景色を選択', background: '背景色', foreground: '文字とアイコン',
  automatic: '自動', showPalette: 'カラーパレットを表示', signature: 'あなたのサイン',
  showCredit: '下部にクレジットを表示', credit: 'クレジットの文字', creditPlaceholder: '@yourname または短いメッセージ',
  dismissError: 'エラーを閉じる', pngReady: 'PNGの準備ができました', downloadRetry: 'ダウンロードが始まらない場合は',
  saveAgain: 'もう一度保存', share: '共有 / 画像を保存', exporting: '壁紙を作成中…',
  download: 'PNGをダウンロード', startHint: 'お気に入りの写真を選んで始めましょう', noWatermark: '透かしなし',
  footer: '小さな瞬間を、あなたの手元に。', footerNote: 'あなたの写真と、あなたの気持ちで。',
  imageDecodeError: 'この画像を開けません。JPG・PNG・WebPをお試しください。HEICの場合はJPGに変換してください。',
  imageSizeError: '画像が30 MBを超えています。小さいファイルを選んでください。', imageTypeError: 'JPG・PNG・WebPの画像を選んでください。',
  canvasError: 'このブラウザは画像編集に対応していません。', imageExportError: '画像を作成できませんでした。もう一度お試しください。',
  importError: '画像を開けませんでした。もう一度お試しください。', exportError: 'PNGを作成できませんでした。もう一度お試しください。',
  shareError: '画像を共有できませんでした。PNGのダウンロードをご利用ください。',
};

export const translations: Record<Language, Messages> = { th, en, ja };
export const languageStorageKey = 'still-language';

export function isLanguage(value: unknown): value is Language {
  return value === 'th' || value === 'en' || value === 'ja';
}

export function errorMessageKey(error: unknown, fallback: MessageKey): MessageKey {
  return error instanceof Error && Object.hasOwn(th, error.message) ? error.message as MessageKey : fallback;
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(languageStorageKey);
      return isLanguage(saved) ? saved : 'th';
    } catch { return 'th'; }
  });
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `still. — ${translations[language].editor}`;
    try { localStorage.setItem(languageStorageKey, language); } catch {}
  }, [language]);
  return { language, setLanguage, copy: translations[language] };
}
