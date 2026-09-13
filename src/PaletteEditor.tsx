import type { PaletteOrder, PaletteSettings, PaletteStyle } from './palette';
import type { Messages } from './i18n';

type Props = { value: PaletteSettings; copy: Messages; onChange: (patch: Partial<PaletteSettings>) => void };

// Shared by Music Player and Polaroid — both settings types intersect PaletteSettings (see palette.ts).
export default function PaletteEditor({ value, copy, onChange }: Props) {
  const styles: [PaletteStyle, string][] = [['strip', copy.playerStrip], ['dots', copy.playerDots], ['gradient', copy.paletteGradient], ['ribbon', copy.paletteRibbon], ['necklace', copy.paletteNecklace], ['numbered', copy.paletteNumbered], ['hero', copy.paletteHero]];
  const orders: [PaletteOrder, string][] = [['frequency', copy.paletteOrderFrequency], ['luminance', copy.paletteOrderLuminance], ['hue', copy.paletteOrderHue]];
  return <>
    <div className="player-select"><label htmlFor="palette-style">{copy.playerPaletteStyle}</label><select id="palette-style" value={value.paletteStyle} onChange={event => onChange({ paletteStyle: event.target.value as PaletteStyle })}>{styles.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></div>
    <div className="player-select"><label htmlFor="palette-order">{copy.paletteOrder}</label><select id="palette-order" value={value.paletteOrder} onChange={event => onChange({ paletteOrder: event.target.value as PaletteOrder })}>{orders.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></div>
    <label className="player-range"><span>{copy.paletteCount}<span className="player-range-value" aria-hidden="true">{value.paletteCount}</span></span><input aria-label={copy.paletteCount} type="range" min={3} max={6} step={1} value={value.paletteCount} onChange={event => onChange({ paletteCount: event.target.valueAsNumber })} /></label>
    <label className="player-range"><span>{copy.paletteSize}<span className="player-range-value" aria-hidden="true">{value.paletteSize}%</span></span><input aria-label={copy.paletteSize} type="range" min={60} max={160} step={5} value={value.paletteSize} onChange={event => onChange({ paletteSize: event.target.valueAsNumber })} /></label>
    <label className="player-range"><span>{copy.paletteGap}<span className="player-range-value" aria-hidden="true">{value.paletteGap}%</span></span><input aria-label={copy.paletteGap} type="range" min={60} max={160} step={5} value={value.paletteGap} onChange={event => onChange({ paletteGap: event.target.valueAsNumber })} /></label>
  </>;
}
