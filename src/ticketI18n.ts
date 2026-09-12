const en = {
  templateConcertTicket: 'Concert Ticket', ticketPresetHint: 'Choose a starting style. Your photo, crop, field labels and text stay with you.',
  ticketPhotoHint: 'Portrait photo · keepsake stub', ticketClassicHint: 'Wide paper ticket · vintage ink', ticketMidnightHint: 'Dark paper · concert lights',
  ticketContent: 'Concert details', ticketField: 'Edit a field', ticketLabel: 'Field label', ticketValue: 'Field text', ticketEarlier: 'Move earlier', ticketLater: 'Move later',
  ticketEvent: 'Event name', ticketArtist: 'Artist', ticketDate: 'Date', ticketTime: 'Time', ticketVenue: 'Venue', ticketGate: 'Gate', ticketZone: 'Zone', ticketRow: 'Row', ticketSeat: 'Seat', ticketHolder: 'Ticket holder', ticketSerial: 'Ticket number', ticketNote: 'Personal note',
  ticketFrame: 'Ticket layout', ticketOrientation: 'Ticket orientation', ticketPortrait: 'Portrait', ticketLandscape: 'Landscape', ticketSize: 'Ticket size', ticketPosition: 'Ticket position', ticketRotation: 'Ticket rotation', ticketPhoto: 'Show photo', ticketPhotoShare: 'Photo area',
  ticketLayoutHint: 'The ticket fits inside the wallpaper. Long text wraps or shrinks to fit; extra text ends with … . Hidden fields close up automatically.',
  ticketStub: 'Stub & perforation', ticketShowStub: 'Show ticket stub', ticketStubSide: 'Stub position', ticketTop: 'Top', ticketBottom: 'Bottom', ticketStubShare: 'Stub proportion', ticketLinked: 'Use concert details on stub', ticketStubText: 'Custom stub text',
  ticketLinkedHint: 'Zone, row and seat appear on the stub. The landscape stub also repeats the event and date. Changes follow the main fields.',
  ticketPerforation: 'Perforation style', ticketNone: 'None', ticketDash: 'Dashed line', ticketHoles: 'Punched holes', ticketHoleSize: 'Perforation size', ticketHoleGap: 'Perforation spacing', ticketPerforationOpacity: 'Perforation ink', ticketNotches: 'Semicircle cutouts',
  ticketPaperSection: 'Ticket colors & paper', ticketPaper: 'Ticket paper color', ticketStubPaper: 'Stub paper color', ticketInk: 'Ticket ink color', ticketAccent: 'Accent color', ticketTexture: 'Paper texture', ticketSmooth: 'Smooth', ticketFiber: 'Paper fibers', ticketAged: 'Aged paper', ticketTextureAmount: 'Texture strength', ticketPhotoColors: 'Use photo colors for ticket',
  ticketDecorations: 'Ticket decorations', ticketBarcode: 'Show decorative barcode', ticketBarcodeHint: 'The barcode is artwork for your keepsake.', ticketShowBadge: 'Show badge', ticketBadge: 'Badge text', ticketNoPhotoHint: 'Your text-only ticket is ready to export.',
};
type TicketMessages = { [K in keyof typeof en]: string };
const th: TicketMessages = {
  templateConcertTicket: 'Concert Ticket (บัตรคอนเสิร์ต)', ticketPresetHint: 'เลือกสไตล์เริ่มต้น รูป การครอป ชื่อช่อง และข้อความที่กรอกจะยังอยู่',
  ticketPhotoHint: 'ภาพแนวตั้ง · หางบัตรเก็บความทรงจำ', ticketClassicHint: 'บัตรแนวนอน · กระดาษวินเทจ', ticketMidnightHint: 'กระดาษเข้ม · อารมณ์แสงเวที',
  ticketContent: 'ข้อมูลคอนเสิร์ต', ticketField: 'เลือกช่องที่จะแก้ไข', ticketLabel: 'ชื่อช่อง', ticketValue: 'ข้อความในช่อง', ticketEarlier: 'เลื่อนขึ้น', ticketLater: 'เลื่อนลง',
  ticketEvent: 'ชื่องาน', ticketArtist: 'ศิลปิน', ticketDate: 'วันที่', ticketTime: 'เวลา', ticketVenue: 'สถานที่', ticketGate: 'ประตู', ticketZone: 'โซน', ticketRow: 'แถว', ticketSeat: 'ที่นั่ง', ticketHolder: 'ชื่อผู้ถือบัตร', ticketSerial: 'หมายเลขบัตร', ticketNote: 'ข้อความความทรงจำ',
  ticketFrame: 'รูปทรงและการจัดวางบัตร', ticketOrientation: 'แนวบัตร', ticketPortrait: 'แนวตั้ง', ticketLandscape: 'แนวนอน', ticketSize: 'ขนาดบัตร', ticketPosition: 'ตำแหน่งบัตร', ticketRotation: 'เอียงบัตร', ticketPhoto: 'แสดงรูปภาพ', ticketPhotoShare: 'พื้นที่รูปภาพ',
  ticketLayoutHint: 'บัตรปรับให้พอดีวอลเปเปอร์ ข้อความยาวจะขึ้นบรรทัดหรือลดขนาด และใช้ … เมื่อเกินพื้นที่ ช่องที่ซ่อนจะจัดเรียงใหม่อัตโนมัติ',
  ticketStub: 'หางบัตรและรอยปรุ', ticketShowStub: 'แสดงหางบัตร', ticketStubSide: 'ตำแหน่งหางบัตร', ticketTop: 'ด้านบน', ticketBottom: 'ด้านล่าง', ticketStubShare: 'สัดส่วนหางบัตร', ticketLinked: 'ใช้ข้อมูลงานเดียวกันบนหางบัตร', ticketStubText: 'ข้อความเฉพาะบนหางบัตร',
  ticketLinkedHint: 'โซน แถว และที่นั่งแสดงบนหางบัตร แนวนอนจะแสดงชื่องานและวันที่ซ้ำด้วย แก้ข้อมูลหลักแล้วหางบัตรเปลี่ยนตาม',
  ticketPerforation: 'รูปแบบรอยปรุ', ticketNone: 'ไม่มี', ticketDash: 'เส้นประ', ticketHoles: 'รูเจาะ', ticketHoleSize: 'ขนาดรอยปรุ', ticketHoleGap: 'ระยะห่างรอยปรุ', ticketPerforationOpacity: 'ความเข้มหมึกรอยปรุ', ticketNotches: 'รอยเว้าครึ่งวงกลม',
  ticketPaperSection: 'สีบัตรและเนื้อกระดาษ', ticketPaper: 'สีตัวบัตร', ticketStubPaper: 'สีหางบัตร', ticketInk: 'สีหมึกบนบัตร', ticketAccent: 'สีเน้น', ticketTexture: 'พื้นผิวกระดาษ', ticketSmooth: 'เรียบ', ticketFiber: 'ใยกระดาษ', ticketAged: 'กระดาษเก่า', ticketTextureAmount: 'ความเข้มพื้นผิว', ticketPhotoColors: 'ใช้สีจากรูปบนบัตร',
  ticketDecorations: 'ของตกแต่งบัตร', ticketBarcode: 'แสดงบาร์โค้ดตกแต่ง', ticketBarcodeHint: 'บาร์โค้ดเป็นลายตกแต่งสำหรับบัตรเก็บความทรงจำ', ticketShowBadge: 'แสดงตราบนบัตร', ticketBadge: 'ข้อความบนตรา', ticketNoPhotoHint: 'บัตรข้อความพร้อมส่งออกได้เลย',
};
const ja: TicketMessages = {
  templateConcertTicket: 'Concert Ticket（コンサートチケット）', ticketPresetHint: 'スタイルを選んで調整できます。写真、トリミング、項目名、入力した文章は保持されます。',
  ticketPhotoHint: '縦長の写真・思い出の半券', ticketClassicHint: '横長チケット・ビンテージ', ticketMidnightHint: 'ダークな紙・ライブの光',
  ticketContent: 'コンサート情報', ticketField: '編集する項目', ticketLabel: '項目名', ticketValue: '項目の内容', ticketEarlier: '前に移動', ticketLater: '後ろに移動',
  ticketEvent: '公演名', ticketArtist: 'アーティスト', ticketDate: '日付', ticketTime: '時刻', ticketVenue: '会場', ticketGate: '入場口', ticketZone: 'エリア', ticketRow: '列', ticketSeat: '座席', ticketHolder: 'チケット所有者', ticketSerial: 'チケット番号', ticketNote: '思い出のメモ',
  ticketFrame: 'チケットのレイアウト', ticketOrientation: 'チケットの向き', ticketPortrait: '縦', ticketLandscape: '横', ticketSize: 'チケットのサイズ', ticketPosition: 'チケットの位置', ticketRotation: 'チケットの傾き', ticketPhoto: '写真を表示', ticketPhotoShare: '写真の領域',
  ticketLayoutHint: 'チケットは壁紙内に収まります。長い文章は改行や縮小で調整し、収まらない場合は … で省略します。非表示の項目の余白は自動で詰めます。',
  ticketStub: '半券とミシン目', ticketShowStub: '半券を表示', ticketStubSide: '半券の位置', ticketTop: '上', ticketBottom: '下', ticketStubShare: '半券の割合', ticketLinked: '半券に公演情報を使用', ticketStubText: '半券専用の文章',
  ticketLinkedHint: 'エリア、列、座席を半券に表示します。横向きでは公演名と日付も表示します。編集内容は半券にも反映されます。',
  ticketPerforation: 'ミシン目のスタイル', ticketNone: 'なし', ticketDash: '破線', ticketHoles: '小さな穴', ticketHoleSize: 'ミシン目のサイズ', ticketHoleGap: 'ミシン目の間隔', ticketPerforationOpacity: 'ミシン目のインク濃度', ticketNotches: '半円の切り欠き',
  ticketPaperSection: 'チケットの色と紙質', ticketPaper: 'チケットの紙色', ticketStubPaper: '半券の紙色', ticketInk: 'チケットのインク色', ticketAccent: 'アクセントカラー', ticketTexture: '紙の質感', ticketSmooth: 'なめらか', ticketFiber: '紙の繊維', ticketAged: '古い紙', ticketTextureAmount: '質感の強さ', ticketPhotoColors: '写真の色をチケットに使用',
  ticketDecorations: 'チケットの装飾', ticketBarcode: '装飾用バーコードを表示', ticketBarcodeHint: 'バーコードは思い出のチケットを彩る装飾です。', ticketShowBadge: 'スタンプを表示', ticketBadge: 'スタンプの文字', ticketNoPhotoHint: '写真なしのチケットを書き出せます。',
};
export const ticketMessages = { th, en, ja };
