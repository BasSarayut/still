import { useState } from 'react';
import './concertTicket.css';
import { coverFontLabels, coverFonts } from './albumCover';
import { automaticForeground } from './model';
import { applyTicketPreset, type TicketField, type TicketFieldId, type TicketPreset, type TicketSettings } from './concertTicket';
import type { MessageKey, Messages } from './i18n';

type Props = { value: TicketSettings; copy: Messages; onChange: (value: TicketSettings) => void };
const fieldNames: Record<TicketFieldId, MessageKey> = { event: 'ticketEvent', artist: 'ticketArtist', date: 'ticketDate', time: 'ticketTime', venue: 'ticketVenue', gate: 'ticketGate', zone: 'ticketZone', row: 'ticketRow', seat: 'ticketSeat', holder: 'ticketHolder', serial: 'ticketSerial', note: 'ticketNote' };

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="toggle-label"><span>{label}</span><input type="checkbox" role="switch" checked={checked} onChange={event => onChange(event.target.checked)} /><span className="toggle-track" aria-hidden="true" /></label>;
}

export function TicketPresets({ value, copy, onChange }: Props) {
  return <div className="ticket-presets"><p className="field-hint">{copy.ticketPresetHint}</p><div className="ticket-preset-list">{(['photo', 'classic', 'midnight'] as TicketPreset[]).map((preset, index) =>
    <button type="button" key={preset} className={`ticket-preset ${preset}`} aria-pressed={value.preset === preset} onClick={() => onChange(applyTicketPreset(value, preset))}>
      <span className="ticket-sample" aria-hidden="true"><i /><b /><em /></span><strong>{['Photo Pass', 'Classic Stub', 'Midnight Live'][index]}</strong><small>{[copy.ticketPhotoHint, copy.ticketClassicHint, copy.ticketMidnightHint][index]}</small>
    </button>)}</div></div>;
}

export function TicketContent({ value, copy, onChange }: Props) {
  const [selected, setSelected] = useState<TicketFieldId>('event');
  const item = value.fields.find(field => field.id === selected)!;
  const index = value.fields.indexOf(item);
  const update = (patch: Partial<TicketField>) => onChange({ ...value, fields: value.fields.map(field => field.id === selected ? { ...field, ...patch } : field) });
  const move = (direction: number) => {
    const fields = [...value.fields]; [fields[index], fields[index + direction]] = [fields[index + direction], fields[index]];
    onChange({ ...value, fields });
  };
  return <div className="ticket-content">
    <label className="field-label" htmlFor="ticket-field">{copy.ticketField}</label><select id="ticket-field" value={selected} onChange={event => setSelected(event.target.value as TicketFieldId)}>{value.fields.map(field => <option key={field.id} value={field.id}>{copy[fieldNames[field.id]]}{field.label ? ` · ${field.label}` : ''}</option>)}</select>
    <div className="ticket-field-actions"><button type="button" className="text-button" disabled={index === 0} onClick={() => move(-1)}>↑ {copy.ticketEarlier}</button><button type="button" className="text-button" disabled={index === value.fields.length - 1} onClick={() => move(1)}>↓ {copy.ticketLater}</button></div>
    <Switch label={copy.coverVisible} checked={item.visible} onChange={visible => update({ visible })} />
    <label className="field-label" htmlFor="ticket-label">{copy.ticketLabel}</label><input id="ticket-label" maxLength={40} value={item.label} onChange={event => update({ label: event.target.value })} />
    <label className="field-label" htmlFor="ticket-value">{copy.ticketValue}</label><textarea id="ticket-value" rows={item.id === 'event' || item.id === 'note' ? 3 : 2} maxLength={180} value={item.text} onChange={event => update({ text: event.target.value })} />
    <details className="player-details"><summary>{copy.playerTypography}</summary>
      <div className="player-select"><label htmlFor="ticket-field-font">{copy.coverFont}</label><select id="ticket-field-font" value={item.font} onChange={event => update({ font: event.target.value as TicketField['font'] })}>{Object.keys(coverFonts).map(font => <option key={font} value={font}>{coverFontLabels[font as keyof typeof coverFonts]}</option>)}</select></div>
      <label className="player-range"><span>{copy.coverFontSize}<span className="player-range-value">{item.size}</span></span><input aria-label={copy.coverFontSize} type="range" min={12} max={item.id === 'event' ? 38 : 24} value={item.size} onChange={event => update({ size: event.target.valueAsNumber })} /></label>
      <label className="player-range"><span>{copy.coverWeight}<span className="player-range-value">{item.weight}</span></span><input aria-label={copy.coverWeight} type="range" min={100} max={900} step={50} value={item.weight} onChange={event => update({ weight: event.target.valueAsNumber })} /></label>
      <div className="player-select"><label htmlFor="ticket-field-align">{copy.coverAlign}</label><select id="ticket-field-align" value={item.align} onChange={event => update({ align: event.target.value as TicketField['align'] })}><option value="left">{copy.coverLeft}</option><option value="center">{copy.coverCenter}</option><option value="right">{copy.coverRight}</option></select></div>
      <div className="color-row"><label htmlFor="ticket-field-color">{copy.coverTextColor}</label><button type="button" className={`auto-button ${item.color === null ? 'active' : ''}`} aria-pressed={item.color === null} onClick={() => update({ color: null })}>{copy.automatic}</button><input id="ticket-field-color" type="color" value={item.color ?? value.ink ?? automaticForeground(value.paper)} onChange={event => update({ color: event.target.value })} /></div>
    </details>
  </div>;
}

export function TicketPaper({ value, copy, onChange, palette }: Props & { palette: string[] }) {
  const update = (patch: Partial<TicketSettings>) => onChange({ ...value, ...patch });
  return <details className="player-details"><summary>{copy.ticketPaperSection}</summary>
    <button type="button" className="text-button ticket-photo-colors" onClick={() => update({ paper: palette[palette.length - 1] ?? value.paper, stubPaper: palette[palette.length - 2] ?? value.stubPaper, accent: palette[0] ?? value.accent, ink: null })}>{copy.ticketPhotoColors}</button>
    {(['paper', 'stubPaper', 'ink', 'accent'] as const).filter(key => key !== 'stubPaper' || value.showStub).map(key => <div className="color-row" key={key}><label htmlFor={`ticket-${key}`}>{copy[({ paper: 'ticketPaper', stubPaper: 'ticketStubPaper', ink: 'ticketInk', accent: 'ticketAccent' } as const)[key]]}</label>{key === 'ink' && <button type="button" className={`auto-button ${value.ink === null ? 'active' : ''}`} aria-pressed={value.ink === null} onClick={() => update({ ink: null })}>{copy.automatic}</button>}<input id={`ticket-${key}`} type="color" value={value[key] ?? automaticForeground(value.paper)} onChange={event => update({ [key]: event.target.value })} /></div>)}
    <div className="player-select"><label htmlFor="ticket-texture">{copy.ticketTexture}</label><select id="ticket-texture" value={value.texture} onChange={event => update({ texture: event.target.value as TicketSettings['texture'] })}><option value="smooth">{copy.ticketSmooth}</option><option value="fiber">{copy.ticketFiber}</option><option value="aged">{copy.ticketAged}</option></select></div>
    {value.texture !== 'smooth' && <label className="player-range"><span>{copy.ticketTextureAmount}<span className="player-range-value">{value.textureAmount}%</span></span><input aria-label={copy.ticketTextureAmount} type="range" min={0} max={60} value={value.textureAmount} onChange={event => update({ textureAmount: event.target.valueAsNumber })} /></label>}
  </details>;
}

export default function ConcertTicketEditor({ value, copy, onChange }: Props) {
  const update = (patch: Partial<TicketSettings>) => onChange({ ...value, ...patch });
  const range = (key: 'size' | 'position' | 'rotation' | 'radius' | 'shadow' | 'photoShare' | 'stubShare' | 'holeSize' | 'holeGap' | 'perforationOpacity', label: string, min: number, max: number, step = 1, suffix = '') => <label className="player-range"><span>{label}<span className="player-range-value">{value[key]}{suffix}</span></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value[key]} onChange={event => update({ [key]: event.target.valueAsNumber })} /></label>;
  return <div className="player-editor ticket-editor">
    <details className="player-details"><summary>{copy.ticketFrame}</summary>
      <div className="player-select"><label htmlFor="ticket-orientation">{copy.ticketOrientation}</label><select id="ticket-orientation" value={value.orientation} onChange={event => update({ orientation: event.target.value as TicketSettings['orientation'] })}><option value="portrait">{copy.ticketPortrait}</option><option value="landscape">{copy.ticketLandscape}</option></select></div>
      {range('size', copy.ticketSize, 65, 100, 1, '%')}{range('position', copy.ticketPosition, 15, 65, 0.5, '%')}{range('rotation', copy.ticketRotation, -10, 10, 0.5, '°')}{range('radius', copy.polaroidRadius, 0, 24)}{range('shadow', copy.playerShadow, 0, 60, 1, '%')}
      <Switch label={copy.ticketPhoto} checked={value.showPhoto} onChange={showPhoto => update({ showPhoto })} />
      {value.showPhoto && range('photoShare', copy.ticketPhotoShare, 25, 55, 1, '%')}
      <p className="field-hint">{copy.ticketLayoutHint}</p>
    </details>
    <details className="player-details"><summary>{copy.ticketStub}</summary>
      <Switch label={copy.ticketShowStub} checked={value.showStub} onChange={showStub => update({ showStub })} />
      {value.showStub && <>
        <div className="player-select"><label htmlFor="ticket-stub-side">{copy.ticketStubSide}</label><select id="ticket-stub-side" value={value.stubSide} onChange={event => update({ stubSide: event.target.value as TicketSettings['stubSide'] })}><option value="start">{value.orientation === 'portrait' ? copy.ticketTop : copy.coverLeft}</option><option value="end">{value.orientation === 'portrait' ? copy.ticketBottom : copy.coverRight}</option></select></div>
        {range('stubShare', copy.ticketStubShare, 18, 30, 1, '%')}
        <Switch label={copy.ticketLinked} checked={value.linkedStub} onChange={linkedStub => update({ linkedStub })} />
        {value.linkedStub ? <p className="field-hint">{copy.ticketLinkedHint}</p> : <><label className="field-label" htmlFor="ticket-stub-text">{copy.ticketStubText}</label><textarea id="ticket-stub-text" maxLength={180} rows={3} value={value.stubText} onChange={event => update({ stubText: event.target.value })} /></>}
        <div className="player-select"><label htmlFor="ticket-perforation">{copy.ticketPerforation}</label><select id="ticket-perforation" value={value.perforation} onChange={event => update({ perforation: event.target.value as TicketSettings['perforation'] })}><option value="none">{copy.ticketNone}</option><option value="dash">{copy.ticketDash}</option><option value="holes">{copy.ticketHoles}</option></select></div>
        {value.perforation !== 'none' && <>{range('holeSize', copy.ticketHoleSize, 0.7, 2.5, 0.1)}{range('holeGap', copy.ticketHoleGap, 5, 14)}{range('perforationOpacity', copy.ticketPerforationOpacity, 10, 90, 1, '%')}</>}
        <Switch label={copy.ticketNotches} checked={value.notches} onChange={notches => update({ notches })} />
      </>}
    </details>
  </div>;
}

export function TicketDecorations({ value, copy, onChange }: Props) {
  return <div className="ticket-decorations">
    <Switch label={copy.ticketBarcode} checked={value.showBarcode} onChange={showBarcode => onChange({ ...value, showBarcode })} />
    {value.showBarcode && <p className="field-hint">{copy.ticketBarcodeHint}</p>}
    <Switch label={copy.ticketShowBadge} checked={value.showBadge} onChange={showBadge => onChange({ ...value, showBadge })} />
    {value.showBadge && <><label className="field-label" htmlFor="ticket-badge">{copy.ticketBadge}</label><input id="ticket-badge" maxLength={40} value={value.badge} onChange={event => onChange({ ...value, badge: event.target.value })} /></>}
  </div>;
}
