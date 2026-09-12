import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { coverFonts, createCoverText, type AlbumCover, type CoverText } from './albumCover';
import type { Messages } from './i18n';

type Props = { value: AlbumCover; ink: string; copy: Messages; onChange: (value: AlbumCover) => void };

function NumberField({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const [input, setInput] = useState(String(value));
  useEffect(() => { setInput(current => current.trim() !== '' && Number(current) === value ? current : String(value)); }, [value]);
  return <label className="cover-field">{label}<input type="number" min={min} max={max} step={step} value={input} onChange={event => {
    setInput(event.target.value);
    const next = event.target.valueAsNumber;
    if (Number.isFinite(next) && next >= min && next <= max) onChange(next);
  }} onBlur={() => {
    const next = input.trim() === '' || !Number.isFinite(Number(input)) ? value : Math.min(max, Math.max(min, Number(input)));
    setInput(String(next)); onChange(next);
  }} /></label>;
}

export default function AlbumCoverEditor({ value, ink, copy, onChange }: Props) {
  const [selected, setSelected] = useState(value.texts[0]?.id);
  const active = value.texts.find(text => text.id === selected) ?? value.texts[0];
  function change(patch: Partial<CoverText>) {
    if (active) onChange({ ...value, texts: value.texts.map(text => text.id === active.id ? { ...text, ...patch } : text) });
  }
  function number(key: 'size' | 'weight' | 'x' | 'y' | 'width' | 'tracking' | 'lineHeight' | 'opacity', label: string, min: number, max: number, step = 1) {
    return <NumberField label={label} value={active[key]} min={min} max={max} step={step} onChange={next => change({ [key]: next })} />;
  }
  return <div className="cover-editor">
    <p className="field-hint">{copy.coverTextHint}</p>
    <div className="cover-text-list" aria-label={copy.coverLayers}>
      {value.texts.map((text, index) => <button key={text.id} className={text.id === active?.id ? 'active' : ''} aria-pressed={text.id === active?.id} onClick={() => setSelected(text.id)}>
        <span>{String(index + 1).padStart(2, '0')}</span><span>{text.text.split('\n')[0] || copy.coverEmptyText}</span><span>{text.visible ? 'Aa' : '—'}</span>
      </button>)}
    </div>
    <button className="cover-add" disabled={value.texts.length >= 12} onClick={() => {
      const text = createCoverText(crypto.randomUUID());
      onChange({ ...value, texts: [...value.texts, text] }); setSelected(text.id);
    }}><Plus size={14} />{copy.coverAddText}<span>{value.texts.length}/12</span></button>
    {active && <div className="cover-text-settings" key={active.id}>
      <label className="field-label" htmlFor="cover-text">{copy.coverContent}</label>
      <textarea id="cover-text" rows={3} maxLength={1000} value={active.text} placeholder={copy.coverEmptyText} onChange={event => change({ text: event.target.value })} />
      <div className="cover-text-actions"><label><input type="checkbox" checked={active.visible} onChange={event => change({ visible: event.target.checked })} />{copy.coverVisible}</label>
        <button className="text-button" onClick={() => onChange({ ...value, texts: value.texts.filter(text => text.id !== active.id) })}><Trash2 size={13} />{copy.coverDeleteText}</button></div>
      <label className="field-label" htmlFor="cover-font">{copy.coverFont}</label>
      <select id="cover-font" value={active.font} onChange={event => change({ font: event.target.value as CoverText['font'] })}>
        {Object.keys(coverFonts).map(font => <option key={font} value={font}>{({ sans: 'Sans · Arial', serif: 'Serif · Georgia', mono: 'Mono · Courier', thai: 'Noto Sans Thai', japanese: 'Noto Sans JP' })[font]}</option>)}
      </select>
      <div className="cover-grid">{number('size', copy.coverFontSize, 6, 80)}{number('weight', copy.coverWeight, 100, 900, 100)}</div>
      <div className="cover-text-actions"><label><input type="checkbox" checked={active.italic} onChange={event => change({ italic: event.target.checked })} />{copy.coverItalic}</label></div>
      <label className="field-label" htmlFor="cover-align">{copy.coverAlign}</label>
      <select id="cover-align" value={active.align} onChange={event => change({ align: event.target.value as CoverText['align'] })}><option value="left">{copy.coverLeft}</option><option value="center">{copy.coverCenter}</option><option value="right">{copy.coverRight}</option></select>
      <div className="color-row"><label htmlFor="cover-text-color">{copy.coverTextColor}</label><button className={`auto-button ${active.color === null ? 'active' : ''}`} aria-pressed={active.color === null} onClick={() => change({ color: null })}>{copy.coverInherit}</button><input id="cover-text-color" type="color" value={active.color ?? ink} onChange={event => change({ color: event.target.value })} /></div>
      <details className="cover-details" open><summary>{copy.coverPosition}</summary><p className="field-hint">{copy.coverPositionHint}</p><div className="cover-grid">{number('x', copy.coverX, 0, 95, 0.5)}{number('y', copy.coverY, 0, 95, 0.5)}{number('width', copy.coverWidth, 5, 100, 0.5)}{number('opacity', copy.coverOpacity, 0, 1, 0.05)}</div></details>
      <details className="cover-details"><summary>{copy.coverSpacing}</summary><div className="cover-grid">{number('tracking', copy.coverTracking, -2, 12, 0.1)}{number('lineHeight', copy.coverLineHeight, 0.8, 3, 0.1)}</div></details>
    </div>}
  </div>;
}
