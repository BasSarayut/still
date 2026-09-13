import { coverFontLabels, coverFonts } from './albumCover';
import { createPlayerSettings, type PlayerSettings } from './musicPlayer';
import type { Messages } from './i18n';
import './playerVariations.css';

type Props = { value: PlayerSettings; copy: Messages; onChange: (value: PlayerSettings) => void };
type NumberKey = { [K in keyof PlayerSettings]: PlayerSettings[K] extends number ? K : never }[keyof PlayerSettings];
type BooleanKey = { [K in keyof PlayerSettings]: PlayerSettings[K] extends boolean ? K : never }[keyof PlayerSettings];

function controls({ value, copy, onChange }: Props) {
  const update = (patch: Partial<PlayerSettings>) => onChange({ ...value, ...patch });
  const select = (key: keyof PlayerSettings, label: string, options: [string, string][]) => <div className="player-select"><label htmlFor={`player-${key}`}>{label}</label><select id={`player-${key}`} value={String(value[key])} onChange={event => update({ [key]: event.target.value })}>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></div>;
  const range = (key: NumberKey, label: string, min: number, max: number, suffix = '') => <label className="player-range"><span>{label}<span className="player-range-value" aria-hidden="true">{value[key]}{suffix}</span></span><input aria-label={label} type="range" min={min} max={max} value={value[key]} onChange={event => update({ [key]: event.target.valueAsNumber })} /></label>;
  const toggle = (key: BooleanKey, label: string) => <label className="toggle-label"><span>{label}</span><input type="checkbox" role="switch" checked={value[key]} onChange={event => update({ [key]: event.target.checked })} /><span className="toggle-track" aria-hidden="true" /></label>;
  const color = (key: 'panelColor' | 'recordColor' | 'recordLabelColor' | 'accent', label: string, fallback = '#45433f') => <div className="color-row"><label htmlFor={`player-${key}`}>{label}</label>{key === 'accent' && <button type="button" className={`auto-button ${value.accent === null ? 'active' : ''}`} aria-pressed={value.accent === null} onClick={() => update({ accent: null })}>{copy.automatic}</button>}<input id={`player-${key}`} type="color" value={value[key] ?? fallback} onChange={event => update({ [key]: event.target.value })} /></div>;
  const reset = (keys: (keyof PlayerSettings)[]) => <button type="button" className="text-button player-reset-section" onClick={() => { const defaults = createPlayerSettings(); update(Object.fromEntries(keys.map(key => [key, defaults[key]]))); }}>{copy.playerResetSection}</button>;
  return { update, select, range, toggle, color, reset };
}

export function PlayerLayoutControls(props: Props) {
  const { value, copy } = props, { select } = controls(props);
  return <>
    {select('layout', copy.playerLayout, [['stack', copy.playerStack], ['mini', copy.playerMiniLayout], ['lyrics', copy.playerLyricLayout], ['vinyl', copy.playerVinylLayout]])}
    {value.layout !== 'vinyl' && select('artworkShape', copy.playerShape, [['square', copy.playerSquare], ['circle', copy.playerRound], ['portrait', copy.playerPortrait], ['landscape', copy.playerLandscape]])}
    {['mini', 'lyrics'].includes(value.layout) && select('artworkSide', copy.playerArtworkSide, [['left', copy.coverLeft], ['right', copy.coverRight]])}
  </>;
}

export function PlayerSurfaceControls(props: Props & { ink: string }) {
  const { value, copy, ink } = props, { select, range, color, reset } = controls(props);
  return <details className="player-details"><summary>{copy.playerPanelSection}</summary>
    {select('panel', copy.playerPanel, [['none', copy.playerPanelNone], ['solid', copy.playerPanelSolid], ['glass', copy.playerPanelGlass]])}
    {value.panel !== 'none' && <>{color('panelColor', copy.playerPanelColor)}{range('panelOpacity', copy.playerPanelOpacity, 0, 100, '%')}{range('panelRadius', copy.playerPanelRadius, 0, 40)}{range('panelPadding', copy.playerPanelPadding, 12, 32)}</>}
    {color('accent', copy.playerAccent, ink)}
    {reset(['panel', 'panelColor', 'panelOpacity', 'panelRadius', 'panelPadding', 'accent'])}
  </details>;
}

export function PlayerNoteControls(props: Props) {
  const { value, copy } = props, { update, toggle, select, range, color, reset } = controls(props);
  return <>
    <details className="player-details" open={value.layout === 'lyrics' ? true : undefined}><summary>{copy.playerNotes}</summary>
      {toggle('showExtra', copy.playerShowExtra)}
      {value.showExtra && <><label className="field-label" htmlFor="player-extraText">{copy.playerExtraText}</label><textarea id="player-extraText" rows={2} maxLength={180} value={value.extraText} onChange={event => update({ extraText: event.target.value })} /><p className="field-hint">{copy.playerExtraHint}</p></>}
      {value.layout === 'lyrics' && <>
        <label className="field-label" htmlFor="player-lyrics">{copy.playerLyricText}</label><textarea id="player-lyrics" rows={4} maxLength={400} value={value.lyrics} placeholder={copy.playerLyricPlaceholder} onChange={event => update({ lyrics: event.target.value })} />
        <p className="field-hint">{copy.playerLyricHint}</p>
        {select('lyricFont', copy.playerLyricFont, Object.keys(coverFonts).map(key => [key, coverFontLabels[key as keyof typeof coverFonts]]))}
        {range('lyricSize', copy.playerLyricSize, 20, 44)}{range('lyricHighlight', copy.playerLyricHighlight, 1, 4)}{range('lyricOpacity', copy.playerLyricOpacity, 10, 80, '%')}
      </>}
      {reset(['showExtra', 'lyricFont', 'lyricSize', 'lyricHighlight', 'lyricOpacity'])}
    </details>
    {value.layout === 'vinyl' && <details className="player-details" open><summary>{copy.playerRecordSection}</summary>
      {color('recordColor', copy.playerRecordColor)}{color('recordLabelColor', copy.playerRecordLabelColor)}
      <label className="field-label" htmlFor="player-recordLabel">{copy.playerRecordLabel}</label><input id="player-recordLabel" maxLength={40} value={value.recordLabel} onChange={event => update({ recordLabel: event.target.value })} />
      {range('recordReveal', copy.playerRecordReveal, 25, 90, '%')}{toggle('recordGrooves', copy.playerRecordGrooves)}<p className="field-hint">{copy.playerRecordHint}</p>
      {reset(['recordColor', 'recordLabelColor', 'recordReveal', 'recordGrooves'])}
    </details>}
  </>;
}

export function PlayerProgressControls(props: Props) {
  const { copy } = props, { select } = controls(props);
  return <>{select('progressStyle', copy.playerProgressStyle, [['line', copy.playerLine], ['thick', copy.playerThick], ['segments', copy.playerSegments], ['waveform', copy.playerWaveform]])}{select('progressThumb', copy.playerProgressThumb, [['none', copy.playerHidden], ['dot', copy.playerThumbDot], ['line', copy.playerThumbLine], ['ring', copy.playerThumbRing]])}</>;
}

export function PlayerTransportControls(props: Props) {
  const { value, copy } = props, { toggle } = controls(props);
  return <>{toggle('showPrevious', copy.playerPrevious)}{toggle('showNext', copy.playerNext)}{value.controls === 'full' && <>{toggle('showShuffle', copy.playerShuffle)}{toggle('showRepeat', copy.playerRepeat)}</>}</>;
}

export function PlayerSectionReset(props: Props & { keys: (keyof PlayerSettings)[] }) {
  return controls(props).reset(props.keys);
}
