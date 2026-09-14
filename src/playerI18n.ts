const en = {
  playerMini: 'Mini Player', playerGlass: 'Glass Player', playerLyrics: 'Lyric Focus', playerVinyl: 'Vinyl Session',
  playerLayout: 'Player layout', playerStack: 'Cover above text', playerMiniLayout: 'Cover beside text', playerLyricLayout: 'Words above player', playerVinylLayout: 'Sleeve & vinyl record',
  playerShape: 'Cover shape', playerSquare: 'Square', playerRound: 'Circle', playerPortrait: 'Portrait · 3:4', playerLandscape: 'Landscape · 16:9', playerArtworkSide: 'Cover side',
  playerPanelSection: 'Player panel', playerPanel: 'Panel style', playerPanelNone: 'No panel', playerPanelSolid: 'Solid color panel', playerPanelGlass: 'Translucent glass', playerPanelColor: 'Panel color', playerPanelOpacity: 'Panel opacity', playerPanelRadius: 'Panel corner radius', playerPanelPadding: 'Panel padding',
  playerAmbient: 'Ambient colors from photo', playerAmbientHint: 'Soft pools of color from your photo. The original photo keeps its colors.', playerAccent: 'Player accent color',
  playerProgressStyle: 'Progress style', playerLine: 'Thin line', playerThick: 'Rounded bar', playerSegments: 'Segments', playerWaveform: 'Decorative waveform', playerProgressThumb: 'Progress marker', playerThumbDot: 'Dot', playerThumbLine: 'Tick', playerThumbRing: 'Ring',
  playerPrevious: 'Show previous track', playerNext: 'Show next track', playerShuffle: 'Show shuffle', playerRepeat: 'Show repeat',
  playerNotes: 'Words & personal details', playerShowExtra: 'Show personal note', playerExtraText: 'Album / playlist / date / dedication', playerExtraHint: 'Two short lines beneath the song information.',
  playerLyricText: 'Your words (up to 4 lines)', playerLyricPlaceholder: 'Your favorite words\nA moment to remember\nA song to keep', playerLyricFont: 'Words font', playerLyricSize: 'Words size', playerLyricHighlight: 'Highlighted line', playerLyricOpacity: 'Other lines opacity', playerLyricHint: 'Start each line yourself. Long lines end with … Words and the waveform are static artwork.',
  playerRecordSection: 'Vinyl record', playerRecordColor: 'Record color', playerRecordLabelColor: 'Center label color', playerRecordLabel: 'Center label text', playerRecordReveal: 'Record reveal', playerRecordGrooves: 'Show record grooves', playerRecordHint: 'The photo stays on the square sleeve; the record sits behind it.', playerResetSection: 'Reset this section',
};
type PlayerMessages = { [K in keyof typeof en]: string };
const th: PlayerMessages = {
  playerMini: 'Mini Player', playerGlass: 'Glass Player', playerLyrics: 'Lyric Focus', playerVinyl: 'Vinyl Session',
  playerLayout: 'เลย์เอาต์เครื่องเล่น', playerStack: 'ปกอยู่เหนือข้อความ', playerMiniLayout: 'ปกอยู่ข้างข้อความ', playerLyricLayout: 'ข้อความเด่นเหนือเครื่องเล่น', playerVinylLayout: 'ซองปกและแผ่นเสียง',
  playerShape: 'รูปทรงปก', playerSquare: 'จัตุรัส', playerRound: 'วงกลม', playerPortrait: 'แนวตั้ง · 3:4', playerLandscape: 'แนวนอน · 16:9', playerArtworkSide: 'ด้านที่วางปก',
  playerPanelSection: 'แผงเครื่องเล่น', playerPanel: 'รูปแบบแผง', playerPanelNone: 'ไม่มีแผง', playerPanelSolid: 'แผงสี', playerPanelGlass: 'กระจกโปร่งแสง', playerPanelColor: 'สีแผง', playerPanelOpacity: 'ความทึบแผง', playerPanelRadius: 'ความโค้งมุมแผง', playerPanelPadding: 'ระยะขอบด้านในแผง',
  playerAmbient: 'สีฟุ้งจากภาพ', playerAmbientHint: 'นำชุดสีจากรูปมาสร้างพื้นหลังสีฟุ้ง รูปต้นฉบับยังคงสีเดิม', playerAccent: 'สีเน้นเครื่องเล่น',
  playerProgressStyle: 'รูปแบบแถบเวลา', playerLine: 'เส้นบาง', playerThick: 'แถบมุมมน', playerSegments: 'ขีดแบ่งช่วง', playerWaveform: 'คลื่นเสียงตกแต่ง', playerProgressThumb: 'หัวเลื่อนเวลา', playerThumbDot: 'จุด', playerThumbLine: 'ขีด', playerThumbRing: 'วงแหวน',
  playerPrevious: 'แสดงปุ่มเพลงก่อนหน้า', playerNext: 'แสดงปุ่มเพลงถัดไป', playerShuffle: 'แสดงปุ่มสุ่มเพลง', playerRepeat: 'แสดงปุ่มเล่นซ้ำ',
  playerNotes: 'ข้อความและรายละเอียดส่วนตัว', playerShowExtra: 'แสดงข้อความเสริม', playerExtraText: 'อัลบั้ม / เพลย์ลิสต์ / วันที่ / ข้อความถึงใครสักคน', playerExtraHint: 'ข้อความสั้นสองบรรทัดใต้ข้อมูลเพลง',
  playerLyricText: 'ข้อความของคุณ (ไม่เกิน 4 บรรทัด)', playerLyricPlaceholder: 'ถ้อยคำที่อยากจำ\nช่วงเวลาที่อยากเก็บ\nเพลงที่อยากฟังด้วยกัน', playerLyricFont: 'ฟอนต์ข้อความเด่น', playerLyricSize: 'ขนาดข้อความเด่น', playerLyricHighlight: 'บรรทัดที่เน้น', playerLyricOpacity: 'ความทึบบรรทัดอื่น', playerLyricHint: 'กดขึ้นบรรทัดใหม่เอง ข้อความยาวเกินพื้นที่จะลงท้ายด้วย … ข้อความและคลื่นเสียงเป็นภาพตกแต่งคงที่',
  playerRecordSection: 'แผ่นเสียง', playerRecordColor: 'สีแผ่นเสียง', playerRecordLabelColor: 'สีฉลากกลางแผ่น', playerRecordLabel: 'ข้อความฉลากกลางแผ่น', playerRecordReveal: 'ระยะที่แผ่นโผล่จากซอง', playerRecordGrooves: 'แสดงร่องแผ่นเสียง', playerRecordHint: 'รูปอยู่บนซองปกจัตุรัส แผ่นเสียงวางซ้อนอยู่ด้านหลัง', playerResetSection: 'คืนค่าหมวดนี้',
};
const ja: PlayerMessages = {
  playerMini: 'Mini Player', playerGlass: 'Glass Player', playerLyrics: 'Lyric Focus', playerVinyl: 'Vinyl Session',
  playerLayout: 'プレーヤーのレイアウト', playerStack: '写真の下に曲情報', playerMiniLayout: '写真の横に曲情報', playerLyricLayout: '言葉を主役に', playerVinylLayout: 'ジャケットとレコード',
  playerShape: '写真の形', playerSquare: '正方形', playerRound: '円形', playerPortrait: '縦長 · 3:4', playerLandscape: '横長 · 16:9', playerArtworkSide: '写真の位置',
  playerPanelSection: 'プレーヤーパネル', playerPanel: 'パネルのスタイル', playerPanelNone: 'パネルなし', playerPanelSolid: 'カラーパネル', playerPanelGlass: '半透明のガラス', playerPanelColor: 'パネルの色', playerPanelOpacity: 'パネルの不透明度', playerPanelRadius: 'パネルの角丸', playerPanelPadding: 'パネルの内側余白',
  playerAmbient: '写真の色が広がる背景', playerAmbientHint: '写真から抽出した色で柔らかな背景を作ります。元の写真の色は保持されます。', playerAccent: 'プレーヤーのアクセントカラー',
  playerProgressStyle: '進行バーのスタイル', playerLine: '細い線', playerThick: '角丸のバー', playerSegments: '区切り線', playerWaveform: '装飾用の波形', playerProgressThumb: '再生位置マーカー', playerThumbDot: '点', playerThumbLine: '目盛り', playerThumbRing: 'リング',
  playerPrevious: '前の曲ボタンを表示', playerNext: '次の曲ボタンを表示', playerShuffle: 'シャッフルを表示', playerRepeat: 'リピートを表示',
  playerNotes: '言葉と思い出', playerShowExtra: '追加メッセージを表示', playerExtraText: 'アルバム / プレイリスト / 日付 / メッセージ', playerExtraHint: '曲情報の下に短い文章を2行表示します。',
  playerLyricText: 'あなたの言葉（最大4行）', playerLyricPlaceholder: '覚えていたい言葉\n残しておきたい瞬間\n一緒に聴きたい曲', playerLyricFont: '言葉のフォント', playerLyricSize: '言葉のサイズ', playerLyricHighlight: '強調する行', playerLyricOpacity: '他の行の不透明度', playerLyricHint: '改行を入力してください。長い行は … で省略します。言葉と波形は静止画です。',
  playerRecordSection: 'レコード', playerRecordColor: 'レコードの色', playerRecordLabelColor: '中央ラベルの色', playerRecordLabel: '中央ラベルの文字', playerRecordReveal: 'レコードの引き出し量', playerRecordGrooves: 'レコードの溝を表示', playerRecordHint: '写真を正方形のジャケットに配置し、レコードを背面に重ねます。', playerResetSection: 'この項目をリセット',
};
export const playerMessages = { th, en, ja };
