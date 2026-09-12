import { coverFonts } from './albumCover';
import { applyPlayerPreset, type PlayerSettings, type PlayerPreset } from './musicPlayer';
import { PlayerLayoutControls, PlayerNoteControls, PlayerProgressControls, PlayerSectionReset, PlayerSurfaceControls, PlayerTransportControls } from './PlayerAppearance';
import type { Messages } from './i18n';

type Props = { value: PlayerSettings; copy: Messages; onChange: (value: PlayerSettings) => void };

function Range({ label, value, min, max, step = 1, suffix = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (value: number) => void }) {
  return <label className="player-range"><span>{label}<span className="player-range-value" aria-hidden="true">{Number(value.toFixed(2))}{suffix}</span></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(event.target.valueAsNumber)} /></label>;
}

export function PlayerPresets({ value, copy, onChange }: Props) {
  return <div className="player-presets"><p className="field-hint">{copy.playerPresetHint}</p><div>{(['classic', 'dark', 'minimal', 'mini', 'glass', 'lyrics', 'vinyl'] as PlayerPreset[]).map((preset, index) => {
    const start = applyPlayerPreset(value, preset);
    const selected = (Object.keys(start) as (keyof PlayerSettings)[]).every(key => value[key] === start[key]);
    return <button type="button" key={preset} className={`player-preset ${preset}`} aria-pressed={selected} onClick={() => onChange(start)}><span className="preset-art" aria-hidden="true"><i /><b /><em /></span>{[copy.playerClassic, copy.playerDark, copy.playerMinimal, copy.playerMini, copy.playerGlass, copy.playerLyrics, copy.playerVinyl][index]}</button>;
  })}</div></div>;
}

export function PlayerBackground({ value, copy, onChange }: Props) {
  return <div className="player-background"><label className="field-label" htmlFor="player-background-mode">{copy.playerBackground}</label><select id="player-background-mode" value={value.backgroundMode} onChange={event => onChange({ ...value, backgroundMode: event.target.value as PlayerSettings['backgroundMode'] })}><option value="solid">{copy.playerSolid}</option><option value="gradient">{copy.playerGradient}</option><option value="photo">{copy.playerPhoto}</option><option value="ambient">{copy.playerAmbient}</option></select>
    {value.backgroundMode === 'gradient' && <><div className="color-row"><label htmlFor="player-gradient-end">{copy.playerGradientEnd}</label><span>{value.gradientEnd.toUpperCase()}</span><input type="color" id="player-gradient-end" value={value.gradientEnd} onChange={event => onChange({ ...value, gradientEnd: event.target.value })} /></div><Range label={copy.playerAngle} value={value.gradientAngle} min={0} max={360} suffix="°" onChange={gradientAngle => onChange({ ...value, gradientAngle })} /></>}
    {(value.backgroundMode === 'photo' || value.backgroundMode === 'ambient') && <><p className="field-hint">{value.backgroundMode === 'ambient' ? copy.playerAmbientHint : copy.playerPhotoHint}</p><Range label={copy.playerDarkness} value={value.darkness} min={0} max={80} suffix="%" onChange={darkness => onChange({ ...value, darkness })} /></>}
  </div>;
}

export default function PlayerEditor({ value, copy, onChange, ink }: Props & { ink: string }) {
  const props = { value, copy, onChange };
  const update = (patch: Partial<PlayerSettings>) => onChange({ ...value, ...patch });
  const range = (key: 'artworkSize' | 'artworkRadius' | 'artworkShadow' | 'position' | 'gap' | 'titleSize' | 'artistSize' | 'titleWeight' | 'artistWeight' | 'controlsScale', label: string, min: number, max: number, step = 1, suffix = '') => <Range label={label} value={value[key]} min={min} max={max} step={step} suffix={suffix} onChange={next => update({ [key]: next })} />;
  const toggle = (key: 'showProgress' | 'showTimes' | 'showFavorite', label: string) => <label className="toggle-label"><span>{label}</span><input type="checkbox" role="switch" checked={value[key]} onChange={event => update({ [key]: event.target.checked })} /><span className="toggle-track" aria-hidden="true" /></label>;
  const select = (key: 'align' | 'timeDisplay' | 'controls' | 'glyph' | 'buttonStyle' | 'paletteStyle', label: string, options: [string, string][]) => <div className="player-select"><label htmlFor={`player-${key}`}>{label}</label><select id={`player-${key}`} value={value[key]} onChange={event => update({ [key]: event.target.value })}>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></div>;
  return <div className="player-editor">
    <details className="player-details"><summary>{copy.playerArtwork}</summary>
      <PlayerLayoutControls {...props} />
      {range('artworkSize', copy.playerArtworkSize, 280, 420)}{range('artworkRadius', copy.playerRadius, 0, 48)}{range('artworkShadow', copy.playerShadow, 0, 80, 1, '%')}
      {range('position', copy.playerPosition, 15, 65, 0.5, '%')}{value.layout !== 'mini' && value.layout !== 'lyrics' && range('gap', copy.playerGap, 8, 48)}
      <p className="field-hint">{copy.playerLayoutHint}</p>
      <PlayerSectionReset {...props} keys={['layout', 'artworkShape', 'artworkSide', 'artworkSize', 'artworkRadius', 'artworkShadow', 'position', 'gap']} />
    </details>
    <PlayerSurfaceControls {...props} ink={ink} />
    <details className="player-details"><summary>{copy.playerTypography}</summary>
      {select('align', copy.coverAlign, [['left', copy.coverLeft], ['center', copy.coverCenter]])}
      {(['title', 'artist'] as const).map(kind => <fieldset className="player-type-group" key={kind}><legend>{kind === 'title' ? copy.title : copy.artist}</legend>
        <div className="player-select"><label htmlFor={`player-${kind}-font`}>{copy.coverFont}</label><select id={`player-${kind}-font`} value={value[`${kind}Font`]} onChange={event => update({ [`${kind}Font`]: event.target.value })}>{Object.keys(coverFonts).map(font => <option key={font} value={font}>{({ sans: 'Sans · Arial', serif: 'Serif · Georgia', mono: 'Mono · Courier', thai: 'Noto Sans Thai', japanese: 'Noto Sans JP' })[font]}</option>)}</select></div>
        {range(`${kind}Size`, copy.coverFontSize, kind === 'title' ? 14 : 10, kind === 'title' ? 38 : 24)}
        {range(`${kind}Weight`, copy.coverWeight, 100, 900, 50)}
        <div className="color-row"><label htmlFor={`player-${kind}-color`}>{copy.coverTextColor}</label><button type="button" className={`auto-button ${value[`${kind}Color`] === null ? 'active' : ''}`} aria-pressed={value[`${kind}Color`] === null} onClick={() => update({ [`${kind}Color`]: null })}>{copy.coverInherit}</button><input id={`player-${kind}-color`} type="color" value={value[`${kind}Color`] ?? ink} onChange={event => update({ [`${kind}Color`]: event.target.value })} /></div>
      </fieldset>)}
      <PlayerSectionReset {...props} keys={['titleFont', 'artistFont', 'titleSize', 'artistSize', 'titleWeight', 'artistWeight', 'titleColor', 'artistColor', 'align']} />
    </details>
    <PlayerNoteControls {...props} />
    <details className="player-details"><summary>{copy.playerPlayback}</summary>
      {toggle('showProgress', copy.showProgress)}
      {value.showProgress && <><PlayerProgressControls {...props} />{toggle('showTimes', copy.playerShowTimes)}{value.showTimes && select('timeDisplay', copy.playerTimeDisplay, [['duration', copy.duration], ['remaining', copy.playerRemaining]])}</>}
      {select('controls', copy.playerControls, [['full', copy.playerFull], ['compact', copy.playerCompact], ['none', copy.playerHidden]])}
      {value.controls !== 'none' && <>{select('glyph', copy.playerGlyph, [['play', copy.playerPlay], ['pause', copy.playerPause]])}{select('buttonStyle', copy.playerButtonStyle, [['circle', copy.playerCircle], ['plain', copy.playerPlain]])}{range('controlsScale', copy.playerControlsSize, 0.7, 1.3, 0.05, '×')}</>}
      {value.controls !== 'none' && <PlayerTransportControls {...props} />}
      {toggle('showFavorite', copy.playerFavorite)}
      {select('paletteStyle', copy.playerPaletteStyle, [['strip', copy.playerStrip], ['dots', copy.playerDots]])}
      <PlayerSectionReset {...props} keys={['showProgress', 'showTimes', 'timeDisplay', 'progressStyle', 'progressThumb', 'controls', 'glyph', 'buttonStyle', 'controlsScale', 'showPrevious', 'showNext', 'showShuffle', 'showRepeat', 'showFavorite', 'paletteStyle']} />
    </details>
  </div>;
}
