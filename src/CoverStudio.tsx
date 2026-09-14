import { useState } from 'react';
import { arrangeCover, createAlbumCover, restoreAlbumCover, type AlbumCover } from './albumCover';
import type { Language } from './i18n';

const words = {
  th: { variant: 'การจัดวาง', balanced: 'สมดุล', top: 'ข้อความด้านบน', side: 'ข้อความด้านข้าง', image: 'กรอบและตำแหน่งรูป', x: 'แนวนอน (%)', y: 'แนวตั้ง (%)', width: 'ความกว้าง (%)', height: 'ความสูง (%)', rotation: 'หมุนรูป (°)', radius: 'ความโค้งมุม', opacity: 'ความทึบของรูป', border: 'ความหนากรอบ', background: 'พื้นหลัง', solid: 'สีพื้น', gradient: 'ไล่สี', blur: 'ภาพเบลอ', end: 'สีไล่ระดับ', effects: 'เอฟเฟกต์', grain: 'เกรนฟิล์ม', fade: 'สีเฟด', vignette: 'ขอบมืด', lightLeak: 'แสงรั่ว', overlay: 'เงาช่วยให้อ่านข้อความง่าย', decoration: 'ของตกแต่ง', none: 'ไม่มี', line: 'เส้น', tape: 'เทป', label: 'ฉลาก', film: 'กรอบฟิล์ม', color: 'สีของตกแต่งและกรอบ', amount: 'ความทึบของตกแต่ง', presets: 'สไตล์ของฉัน', name: 'ชื่อสไตล์', save: 'บันทึกสไตล์', load: 'ใช้สไตล์', remove: 'ลบ', failure: 'บันทึกไม่ได้ พื้นที่จัดเก็บอาจเต็มหรือถูกปิด', hint: 'บันทึกการจัดวางทั้งสองสัดส่วนและสี โดยยังคงรูปและข้อความปัจจุบันไว้', saved: 'บันทึกแล้ว', reset: 'เริ่มการจัดวางใหม่' },
  en: { variant: 'Composition', balanced: 'Balanced', top: 'Type at top', side: 'Type at side', image: 'Photo frame & position', x: 'Photo horizontal (%)', y: 'Photo vertical (%)', width: 'Photo width (%)', height: 'Photo height (%)', rotation: 'Photo rotation (°)', radius: 'Corner radius', opacity: 'Photo opacity', border: 'Border width', background: 'Background', solid: 'Solid', gradient: 'Gradient', blur: 'Blurred photo', end: 'Gradient color', effects: 'Effects', grain: 'Film grain', fade: 'Fade', vignette: 'Vignette', lightLeak: 'Light leak', overlay: 'Text readability shade', decoration: 'Decorations', none: 'None', line: 'Line', tape: 'Tape', label: 'Label', film: 'Film frame', color: 'Decoration & border color', amount: 'Decoration opacity', presets: 'My styles', name: 'Style name', save: 'Save style', load: 'Apply style', remove: 'Delete', failure: 'Could not save. Storage may be full or unavailable.', hint: 'Save both compositions and colors. Your current photo and text are kept.', saved: 'Saved', reset: 'Reset composition' },
  ja: { variant: '構図', balanced: 'バランス', top: '文字を上に', side: '文字を横に', image: '写真の枠と位置', x: '写真の横位置 (%)', y: '写真の縦位置 (%)', width: '写真の幅 (%)', height: '写真の高さ (%)', rotation: '写真の回転 (°)', radius: '角の丸み', opacity: '写真の不透明度', border: '枠の太さ', background: '背景', solid: '単色', gradient: 'グラデーション', blur: 'ぼかした写真', end: 'グラデーションの色', effects: 'エフェクト', grain: 'フィルム粒子', fade: 'フェード', vignette: '周辺減光', lightLeak: '光漏れ', overlay: '文字用の影', decoration: '装飾', none: 'なし', line: '線', tape: 'テープ', label: 'ラベル', film: 'フィルム枠', color: '装飾と枠の色', amount: '装飾の不透明度', presets: 'マイスタイル', name: 'スタイル名', save: 'スタイルを保存', load: '適用', remove: '削除', failure: '保存できません。ストレージを確認してください。', hint: '両方の構図と色を保存。現在の写真と文章は保持します。', saved: '保存しました', reset: '構図をリセット' },
};

type SavedStyle = { name: string; cover: AlbumCover; background: string; foreground: string | null };
const storageKey = 'still-cover-styles-v1';

export default function CoverStudio({ value, language, background, foreground, onChange, onColors }: { value: AlbumCover; language: Language; background: string; foreground: string | null; onChange: (value: AlbumCover) => void; onColors: (background: string, foreground: string | null, cover: AlbumCover) => void }) {
  const copy = words[language];
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState<SavedStyle[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      return Array.isArray(stored) ? stored.filter(item => item && typeof item.name === 'string' && /^#[0-9a-f]{6}$/i.test(item.background) && (item.foreground === null || /^#[0-9a-f]{6}$/i.test(item.foreground))).slice(0, 20).map(item => ({ ...item, cover: restoreAlbumCover(item.cover) })) : [];
    } catch { return []; }
  });
  const change = (patch: Partial<AlbumCover>) => onChange({ ...value, ...patch });
  function persist(next: SavedStyle[]) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaved(next); setStatus(copy.saved); } catch { setStatus(copy.failure); }
  }
  function range(key: 'photoX' | 'photoY' | 'photoWidth' | 'photoHeight' | 'photoRotation' | 'photoRadius' | 'photoOpacity' | 'photoBorder' | 'grain' | 'fade' | 'vignette' | 'lightLeak' | 'overlay' | 'decorationOpacity', label: string, min: number, max: number, step = 1) {
    return <label className="cover-field" key={key}><span>{label} <output>{value[key]}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value[key]} onChange={event => change({ [key]: Number(event.target.value) })} /></label>;
  }
  return <div className="cover-studio-controls">
    <label className="field-label">{copy.variant}<select value={value.variant} onChange={event => {
      const target = arrangeCover({ ...createAlbumCover(value.style), format: value.format }, event.target.value as AlbumCover['variant']);
      change({ variant: target.variant, photoX: target.photoX, photoY: target.photoY, photoWidth: target.photoWidth, photoHeight: target.photoHeight, texts: value.texts.map(text => { const position = target.texts.find(item => item.id === text.id); return position ? { ...text, x: position.x, y: position.y, width: position.width, align: position.align } : text; }) });
    }}><option value="balanced">{copy.balanced}</option><option value="top">{copy.top}</option><option value="side">{copy.side}</option></select></label>
    <details className="cover-details" open><summary>{copy.image}</summary><div className="cover-grid">
      {!['classic', 'poster', 'cassette', 'zine'].includes(value.style) && <>{range('photoX', copy.x, 0, 95)}{range('photoY', copy.y, 0, 95)}{range('photoWidth', copy.width, 5, 100)}{range('photoHeight', copy.height, 5, 100)}</>}
      {range('photoRotation', copy.rotation, -180, 180)}{range('photoRadius', copy.radius, 0, 100)}{range('photoOpacity', copy.opacity, 0, 1, 0.05)}{range('photoBorder', copy.border, 0, 30)}
    </div></details>
    <label className="field-label">{copy.background}<select value={value.backgroundMode} onChange={event => change({ backgroundMode: event.target.value as AlbumCover['backgroundMode'] })}><option value="solid">{copy.solid}</option><option value="gradient">{copy.gradient}</option><option value="blur">{copy.blur}</option></select></label>
    {value.backgroundMode === 'gradient' && <label className="color-row">{copy.end}<input type="color" value={value.gradientColor} onChange={event => change({ gradientColor: event.target.value })} /></label>}
    <details className="cover-details"><summary>{copy.effects}</summary><div className="cover-grid">{range('grain', copy.grain, 0, 1, 0.05)}{range('fade', copy.fade, 0, 1, 0.05)}{range('vignette', copy.vignette, 0, 1, 0.05)}{range('lightLeak', copy.lightLeak, 0, 1, 0.05)}{range('overlay', copy.overlay, 0, 1, 0.05)}</div></details>
    <details className="cover-details"><summary>{copy.decoration}</summary><select aria-label={copy.decoration} value={value.decoration} onChange={event => change({ decoration: event.target.value as AlbumCover['decoration'] })}>{(['none', 'line', 'tape', 'label', 'film'] as const).map(item => <option key={item} value={item}>{copy[item]}</option>)}</select><label className="color-row">{copy.color}<input type="color" value={value.decorationColor} onChange={event => change({ decorationColor: event.target.value })} /></label>{range('decorationOpacity', copy.amount, 0, 1, 0.05)}</details>
    <details className="cover-details"><summary>{copy.presets}</summary><p className="field-hint">{copy.hint}</p><label className="field-label">{copy.name}<input value={name} maxLength={60} onChange={event => setName(event.target.value)} /></label><button type="button" className="cover-add" disabled={!name.trim() || saved.length >= 20} onClick={() => { persist([...saved, { name: name.trim(), cover: value, background, foreground }]); setName(''); }}>{copy.save}</button>
      {saved.map((item, index) => <div className="cover-saved-row" key={index}><span>{item.name}</span><button type="button" onClick={() => {
        const cover = restoreAlbumCover(item.cover);
        const target = cover.format === value.format ? cover : { ...cover, ...(cover.layouts[value.format]?.layout ?? arrangeCover({ ...createAlbumCover(cover.style), format: value.format })) };
        onColors(item.background, item.foreground, { ...target, format: value.format, texts: target.texts.map(text => ({ ...text, text: value.texts.find(current => current.id === text.id)?.text ?? text.text })), layouts: cover.layouts });
      }}>{copy.load}</button><button type="button" aria-label={`${copy.remove} ${item.name}`} onClick={() => persist(saved.filter((_, position) => position !== index))}>{copy.remove}</button></div>)}<p role="status">{status}</p>
    </details>
  </div>;
}
