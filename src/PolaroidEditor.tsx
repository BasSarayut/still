import FontOptions from './FontOptions';
import { automaticForeground } from './model';
import { createPolaroidSettings, type PolaroidPreset, type PolaroidSettings } from './polaroid';
import PaletteEditor from './PaletteEditor';
import type { Messages } from './i18n';

type Props = { value: PolaroidSettings; copy: Messages; onChange: (value: PolaroidSettings) => void };

const PRESETS: PolaroidPreset[] = ['classic', 'clean', 'diary', 'cinema', 'noir', 'postcard', 'scrapbook', 'formal'];
const PRESET_NAMES = ['Classic', 'Clean', 'Diary', 'Cinema', 'Noir', 'Postcard', 'Scrapbook', 'Formal'];

export function PolaroidPresets({ value, copy, onChange }: Props) {
  const hints = [copy.polaroidClassicHint, copy.polaroidCleanHint, copy.polaroidDiaryHint, copy.polaroidCinemaHint, copy.polaroidNoirHint, copy.polaroidPostcardHint, copy.polaroidScrapbookHint, copy.polaroidFormalHint];
  return <div className="polaroid-presets"><p className="field-hint">{copy.polaroidPresetHint}</p><div>{PRESETS.map((preset, index) => {
    const start = { ...createPolaroidSettings(preset), stamp: value.stamp };
    const selected = (Object.keys(start) as (keyof PolaroidSettings)[]).every(key => value[key] === start[key]);
    return <button type="button" key={preset} className={`polaroid-preset ${preset}`} aria-pressed={selected} onClick={() => onChange(start)}><span className="polaroid-sample" aria-hidden="true"><i /><b /><em /></span><strong>{PRESET_NAMES[index]}</strong><small>{hints[index]}</small></button>;
  })}</div></div>;
}

export default function PolaroidEditor({ value, copy, onChange }: Props) {
  const update = (patch: Partial<PolaroidSettings>) => onChange({ ...value, ...patch });
  const ink = value.ink ?? automaticForeground(value.paper);
  const range = (key: 'photoWidth' | 'padding' | 'captionHeight' | 'radius' | 'photoRadius' | 'rotation' | 'position' | 'shadow' | 'textureAmount' | 'titleSize' | 'artistSize' | 'titleWeight' | 'artistWeight', label: string, min: number, max: number, step = 1, suffix = '') => <label className="player-range"><span>{label}<span className="player-range-value" aria-hidden="true">{value[key]}{suffix}</span></span><input type="range" aria-label={label} min={min} max={max} step={step} value={value[key]} onChange={event => update({ [key]: event.target.valueAsNumber })} /></label>;
  const toggle = (key: 'titleItalic' | 'artistItalic' | 'showTimes' | 'showStamp' | 'photoCorners', label: string) => <label className="toggle-label"><span>{label}</span><input type="checkbox" role="switch" checked={value[key]} onChange={event => update({ [key]: event.target.checked })} /><span className="toggle-track" aria-hidden="true" /></label>;
  const select = (key: 'photoFormat' | 'align' | 'tape' | 'texture' | 'wallPattern', label: string, options: [string, string][]) => <div className="player-select"><label htmlFor={`polaroid-${key}`}>{label}</label><select id={`polaroid-${key}`} value={value[key]} onChange={event => update({ [key]: event.target.value })}>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></div>;
  const color = (key: 'paper' | 'ink' | 'titleColor' | 'artistColor' | 'tapeColor', label: string, automatic = false) => <div className="color-row"><label htmlFor={`polaroid-${key}`}>{label}</label>{automatic && <button type="button" className={`auto-button ${value[key] === null ? 'active' : ''}`} aria-pressed={value[key] === null} onClick={() => update({ [key]: null })}>{copy.automatic}</button>}<input id={`polaroid-${key}`} type="color" value={value[key] ?? ink} onChange={event => update({ [key]: event.target.value })} /></div>;
  return <div className="player-editor polaroid-editor">
    <details className="player-details"><summary>{copy.polaroidFrame}</summary>
      {select('photoFormat', copy.polaroidPhotoFormat, [['square', copy.polaroidSquare], ['portrait', copy.polaroidPortrait], ['landscape', copy.polaroidLandscape]])}
      {range('photoWidth', copy.playerArtworkSize, 260, 404)}{range('padding', copy.polaroidPadding, 8, 36)}{range('captionHeight', copy.polaroidCaptionHeight, 80, 180)}
      {range('radius', copy.polaroidRadius, 0, 24)}{range('photoRadius', copy.playerRadius, 0, 24)}
      {range('rotation', copy.polaroidRotation, -10, 10, 0.5, '°')}{range('position', copy.polaroidPosition, 15, 50, 0.5, '%')}{range('shadow', copy.playerShadow, 0, 60, 1, '%')}
      <p className="field-hint">{copy.polaroidLayoutHint}</p>
      {color('paper', copy.polaroidPaper)}{color('ink', copy.polaroidInk, true)}
      {select('texture', copy.polaroidTexture, [['smooth', copy.polaroidSmooth], ['fiber', copy.polaroidFiber], ['aged', copy.polaroidAged]])}
      {value.texture !== 'smooth' && range('textureAmount', copy.polaroidTextureAmount, 0, 60, 1, '%')}
    </details>
    <details className="player-details"><summary>{copy.playerTypography}</summary>
      {select('align', copy.coverAlign, [['left', copy.coverLeft], ['center', copy.coverCenter], ['right', copy.coverRight]])}
      {(['title', 'artist'] as const).map(kind => <fieldset className="player-type-group" key={kind}><legend>{kind === 'title' ? copy.title : copy.artist}</legend>
        <div className="player-select"><label htmlFor={`polaroid-${kind}-font`}>{copy.coverFont}</label><select id={`polaroid-${kind}-font`} value={value[`${kind}Font`]} onChange={event => update({ [`${kind}Font`]: event.target.value })}><FontOptions template="polaroid" /></select></div>
        {range(`${kind}Size`, copy.coverFontSize, kind === 'title' ? 14 : 10, kind === 'title' ? 32 : 22)}{range(`${kind}Weight`, copy.coverWeight, 100, 900, 50)}
        {toggle(`${kind}Italic`, copy.coverItalic)}{color(`${kind}Color`, copy.coverTextColor, true)}
      </fieldset>)}
    </details>
    <details className="player-details"><summary>{copy.polaroidDecorations}</summary>
      {select('tape', copy.polaroidTape, [['none', copy.playerHidden], ['top', copy.polaroidTapeTop], ['corners', copy.polaroidTapeCorners]])}
      {value.tape !== 'none' && color('tapeColor', copy.polaroidTapeColor)}
      {toggle('photoCorners', copy.polaroidCorners)}
      {select('wallPattern', copy.polaroidPattern, [['none', copy.playerSolid], ['grid', copy.polaroidGrid], ['dots', copy.playerDots]])}
      {toggle('showStamp', copy.polaroidShowStamp)}
      {value.showStamp && <><label className="field-label" htmlFor="polaroid-stamp">{copy.polaroidStamp}</label><input id="polaroid-stamp" maxLength={80} value={value.stamp} placeholder={copy.polaroidStampPlaceholder} onChange={event => update({ stamp: event.target.value })} /></>}
      {value.showProgress && toggle('showTimes', copy.playerShowTimes)}
      <PaletteEditor value={value} copy={copy} onChange={update} />
    </details>
  </div>;
}
