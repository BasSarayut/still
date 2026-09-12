import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowUpRight, Check, CheckCheck, ChevronDown, CircleHelp, ImagePlus, LayoutTemplate, LoaderCircle, LockKeyhole, Minus, Music2, Plus, RotateCcw, Share2, ShieldCheck, Smartphone, X } from 'lucide-react';
import { devices, getDevice } from './devices';
import { automaticForeground, initialCrop, initialDraft, playerColors, validTimes, type Draft, type TemplateId } from './model';
import { canvasBlob, decodeImage, importImage } from './images';
import { loadDraft, saveDraft } from './storage';
import { prepareFonts, renderWallpaper } from './renderer';
import Preview from './Preview';
import AlbumCoverEditor, { CoverPresets } from './AlbumCoverEditor';
import PlayerEditor, { PlayerBackground, PlayerPresets } from './PlayerEditor';
import PolaroidEditor, { PolaroidPresets } from './PolaroidEditor';
import ConcertTicketEditor, { TicketContent, TicketDecorations, TicketPaper, TicketPresets } from './ConcertTicketEditor';
import { errorMessageKey, useLanguage, type MessageKey } from './i18n';

function Toggle({ checked, onChange, children, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; disabled?: boolean }) {
  return <label className="toggle-label"><span>{children}</span><input type="checkbox" role="switch" disabled={disabled} checked={checked} onChange={event => onChange(event.target.checked)} /><span className="toggle-track" aria-hidden="true" /></label>;
}

function Section({ number, title, children, extra }: { number: string; title: string; children: ReactNode; extra?: ReactNode }) {
  return <section className="control-section"><div className="section-heading"><h2><span>{number}</span>{title}</h2>{extra}</div>{children}</section>;
}

const TEMPLATES: { id: TemplateId; number: string; badge: string; labelKey: 'template' | 'templatePolaroid' | 'templateAlbumCover' | 'templateConcertTicket' }[] = [
  { id: 'custom', number: '01', badge: 'THE MUSIC PLAYER', labelKey: 'template' },
  { id: 'polaroid', number: '02', badge: 'POLAROID', labelKey: 'templatePolaroid' },
  { id: 'albumCover', number: '03', badge: 'ALBUM COVER', labelKey: 'templateAlbumCover' },
  { id: 'concertTicket', number: '04', badge: 'CONCERT TICKET', labelKey: 'templateConcertTicket' },
];

export default function App() {
  const { language, setLanguage, copy } = useLanguage();
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const [saveStatus, setSaveStatus] = useState<MessageKey>('loadingDraft');
  const [download, setDownload] = useState<{ url: string; file: File } | null>(null);
  const [help, setHelp] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const latest = useRef(draft);
  const revision = useRef(0);
  const importRevision = useRef(0);
  const isCover = draft.templateId === 'albumCover';
  const isPlayer = draft.templateId === 'custom';
  const isPolaroid = draft.templateId === 'polaroid';
  const isTicket = draft.templateId === 'concertTicket';
  const photoRequired = !isTicket || draft.concertTicket.showPhoto;
  const autoBackground = isPlayer && draft.player.backgroundMode === 'photo';
  const isSquare = isCover && draft.albumCover.format === 'square';
  const device = isSquare ? { name: 'album-cover', width: 2400, height: 2400, source: '' } : getDevice(draft.device);
  const timeValid = isTicket || isCover || (isPlayer && !draft.player.showProgress) || (isPolaroid && !draft.polaroid.showProgress) || validTimes(draft.elapsed, draft.duration);
  const foreground = isPlayer ? playerColors(draft).foreground : draft.foreground ?? automaticForeground(draft.background);
  const customForeground = isPlayer ? draft.player.foreground : draft.foreground;
  const updateForeground = (foreground: string | null) => update(isPlayer ? { player: { ...draft.player, foreground } } : { foreground });
  const template = TEMPLATES.find(item => item.id === draft.templateId) ?? TEMPLATES[0];
  latest.current = draft;

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const restored = await loadDraft();
        let restoredImage: HTMLImageElement | null = null;
        if (restored.image) restoredImage = await decodeImage(restored.image);
        if (!cancelled) { setDraft(restored); setImage(restoredImage); setSaveStatus('saved'); }
      } catch {
        if (!cancelled) setSaveStatus('restoreError');
      } finally { if (!cancelled) setReady(true); }
    }
    void restore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const current = ++revision.current;
    const timer = window.setTimeout(() => {
      setSaveStatus('saving');
      void saveDraft(draft).then(() => {
        if (revision.current === current) setSaveStatus('saved');
      }).catch(() => {
        if (revision.current === current) setSaveStatus('saveError');
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, ready]);

  useEffect(() => {
    if (!ready) return;
    const flush = () => { void saveDraft(latest.current).catch(() => {}); };
    const visibility = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', flush);
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', flush); };
  }, [ready]);

  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url); }, [download]);

  function update(patch: Partial<Draft>) {
    revision.current++;
    setSaveStatus('saving');
    setDraft(previous => ({ ...previous, ...patch }));
    setDownload(null);
  }

  async function upload(file?: File) {
    if (!file || !ready || exporting) return;
    const current = ++importRevision.current;
    setBusy(true); setError(null); setDownload(null);
    try {
      const imported = await importImage(file);
      if (current !== importRevision.current) return;
      setImage(imported.image);
      update({ image: imported.blob, crop: initialCrop, palette: imported.palette, background: imported.palette[0], foreground: null });
    } catch (failure) {
      if (current === importRevision.current) setError(errorMessageKey(failure, 'importError'));
    } finally { if (current === importRevision.current) setBusy(false); }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    void upload(event.target.files?.[0]);
    event.target.value = '';
  }

  async function exportPng() {
    if ((!image && photoRequired) || !timeValid || busy || exporting) return;
    setExporting(true); setError(null);
    const currentDraft = draft;
    try {
      await prepareFonts(currentDraft);
      const canvas = document.createElement('canvas');
      renderWallpaper(canvas, currentDraft, image, device, device.width);
      const blob = await canvasBlob(canvas);
      canvas.width = canvas.height = 1;
      const file = new File([blob], `still-${device.name.toLowerCase().replaceAll(' ', '-')}.png`, { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setDownload({ url, file });
      const link = document.createElement('a');
      link.href = url; link.download = file.name;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (failure) {
      setError(errorMessageKey(failure, 'exportError'));
    } finally { setExporting(false); }
  }

  async function sharePng() {
    if (!download) return;
    try { await navigator.share({ files: [download.file] }); }
    catch (failure) { if (!(failure instanceof DOMException && failure.name === 'AbortError')) setError('shareError'); }
  }

  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="#main" aria-label={`ill. — ${copy.siteTitle}`}><span>ill<span className="brand-dot">.</span></span></a>
      <span className="brand-description">{copy.tagline}</span>
      <div className="language-picker"><label className="sr-only" htmlFor="language">{copy.language}</label><select id="language" value={language} onChange={event => setLanguage(event.target.value as typeof language)}><option value="th" lang="th">ไทย</option><option value="en" lang="en">English</option><option value="ja" lang="ja">日本語</option></select><ChevronDown size={13} aria-hidden="true" /></div>
      <button className="help-button" onClick={() => setHelp(!help)} aria-expanded={help}><CircleHelp size={17} /><span>{copy.help}</span></button>
    </header>

    {help && <aside className="help-panel"><button className="icon-button close-help" onClick={() => setHelp(false)} aria-label={copy.closeHelp}><X size={18} /></button>
      <h2>{copy.helpTitle}</h2><ol><li>{copy.helpStep1}</li><li>{copy.helpStep2}</li><li>{copy.helpStep3}</li></ol>
      <p>{copy.helpPhotos}</p>
      <p>{copy.helpStorage}</p>
    </aside>}

    <main id="main" className="studio">
      <div className="workspace">
        <div className="workspace-heading"><div><span className="eyebrow">{copy.studio}</span><h1>{copy.headingPhoto} <span>{copy.headingMusic}</span></h1><p>{copy.subtitle}</p></div><span className="template-badge"><Music2 size={13} /> {template.badge} <span>{template.number}</span></span></div>
        <div className="preview-toolbar" id="preview"><span className="preview-label"><span className="live-dot" /> {copy.preview}</span><span>{device.width} × {device.height} <span className="pixels">PX</span></span></div>
        <div className={`preview-stage ${isSquare ? 'square-stage' : ''}`} style={{ '--preview-ratio': device.width / device.height } as CSSProperties}>
          <div className="side-note">{copy.sideNote}</div>
          <div className="preview-wrap"><Preview copy={copy} draft={draft} image={image} device={device} onCrop={crop => { if (ready && !busy && !exporting) update({ crop }); }} onUpload={() => { if (ready && !busy && !exporting) uploadRef.current?.click(); }} /></div>
          <div className="stage-caption"><span>{template.number} / {copy[template.labelKey]}</span><span>{copy.makeYours}</span></div>
        </div>
        {!isSquare && <div className="preview-bottom"><Toggle disabled={!ready || busy || exporting} checked={draft.showGuides} onChange={showGuides => update({ showGuides })}><LockKeyhole size={14} /> {copy.guides}</Toggle><span>{copy.guidesNote}</span></div>}
        <p className="privacy-note"><ShieldCheck size={13} /> {copy.privacy}</p>
      </div>

      <aside className="inspector" aria-label={copy.editorLabel}>
        <div className="inspector-heading"><div><span className="eyebrow">{copy.personal}</span><h2>{copy.editor}</h2></div><span className="tiny-music"><Music2 size={20} /></span></div>
        <div className="save-status" role="status"><CheckCheck size={13} />{copy[saveStatus]}</div>
        <fieldset disabled={!ready || busy || exporting} className="editor-fields">
          <Section number="01" title={copy.templateSectionTitle}>
            <label className="sr-only" htmlFor="template">{copy.templateSelectLabel}</label>
            <div className="select-wrap"><LayoutTemplate size={16} /><select id="template" value={draft.templateId} onChange={event => update({ templateId: event.target.value as TemplateId })}>{TEMPLATES.map(item => <option key={item.id} value={item.id}>{copy[item.labelKey]}</option>)}</select><ChevronDown size={15} /></div>
            {isPlayer && <PlayerPresets value={draft.player} copy={copy} onChange={player => update({ player })} />}
            {isPolaroid && <PolaroidPresets value={draft.polaroid} copy={copy} onChange={polaroid => update({ polaroid })} />}
            {isCover && <CoverPresets value={draft.albumCover} copy={copy} onChange={albumCover => update({ albumCover })} />}
            {isTicket && <TicketPresets value={draft.concertTicket} copy={copy} onChange={concertTicket => update({ concertTicket })} />}
          </Section>

          <Section number="02" title={isCover ? copy.coverFormat : copy.screen}>
            {isCover && <><label className="sr-only" htmlFor="cover-format">{copy.coverFormat}</label><select id="cover-format" value={draft.albumCover.format} onChange={event => update({ albumCover: { ...draft.albumCover, format: event.target.value as 'square' | 'phone' } })}><option value="square">{copy.coverSquare}</option><option value="phone">{copy.coverPhone}</option></select></>}
            {!isSquare && <><label className="sr-only" htmlFor="device">{copy.device}</label>
            <div className="select-wrap"><Smartphone size={16} /><select id="device" value={device.name} onChange={event => update({ device: event.target.value })}>{devices.map(item => <option key={item.name}>{item.name}</option>)}</select><ChevronDown size={15} /></div>
            <div className="field-footnote"><span>{device.width} × {device.height} px</span><a href={device.source} target="_blank" rel="noreferrer">{copy.appleSize} <ArrowUpRight size={11} /></a></div></>}
          </Section>

          <Section number="03" title={copy.photo} extra={image && <button className="text-button" onClick={() => { setImage(null); update({ image: null, crop: initialCrop }); }}>{copy.removePhoto}</button>}>
            <input ref={uploadRef} className="sr-only" id="photo-upload" aria-label={copy.uploadPhoto} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={chooseFile} tabIndex={-1} />
            <button className={`upload-zone ${dragOver ? 'drag-over' : ''} ${image ? 'with-image' : ''}`} onClick={() => uploadRef.current?.click()}
              onDragOver={event => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onDrop={event => { event.preventDefault(); setDragOver(false); void upload(event.dataTransfer.files[0]); }}>
              {busy ? <LoaderCircle className="spin" size={24} /> : <ImagePlus size={25} strokeWidth={1.4} />}
              <strong>{busy ? copy.preparingPhoto : image ? copy.changePhoto : copy.choosePhoto}</strong><span>{copy.fileTypes}</span>
            </button>
            {image && <div className="crop-controls"><div className="zoom-heading"><label htmlFor="zoom">{copy.zoom}</label><span>{draft.crop.zoom.toFixed(2)}×</span><button className="text-button" onClick={() => update({ crop: initialCrop })}><RotateCcw size={12} /> {copy.center}</button></div><div className="range-row"><Minus size={13} /><input id="zoom" type="range" min="1" max="4" step="0.01" value={draft.crop.zoom} onChange={event => update({ crop: { ...draft.crop, zoom: Number(event.target.value) } })} /><Plus size={13} /></div><p className="field-hint">{copy.cropHint}</p></div>}
          </Section>

          {isTicket ? <Section number="04" title={copy.ticketContent}>
            <TicketContent value={draft.concertTicket} copy={copy} onChange={concertTicket => update({ concertTicket })} />
            <ConcertTicketEditor value={draft.concertTicket} copy={copy} onChange={concertTicket => update({ concertTicket })} />
          </Section> : isCover ? <Section number="04" title={copy.coverLayout}>
            <div className="zoom-heading"><label htmlFor="cover-split">{copy.coverSplit}</label><span>{draft.albumCover.split}%</span></div>
            <input id="cover-split" type="range" min="20" max="80" step="1" value={draft.albumCover.split} onChange={event => update({ albumCover: { ...draft.albumCover, split: Number(event.target.value) } })} />
            <p className="field-hint">{copy.coverLayoutHint}</p>
          </Section> : <Section number="04" title={copy.music}>
            <label className="field-label" htmlFor="title">{copy.title}</label><input id="title" maxLength={120} value={draft.title} onChange={event => update({ title: event.target.value })} placeholder={copy.titlePlaceholder} />
            <label className="field-label" htmlFor="artist">{copy.artist}</label><input id="artist" maxLength={100} value={draft.artist} onChange={event => update({ artist: event.target.value })} placeholder={copy.artistPlaceholder} />
            <div className="time-fields"><div><label className="field-label" htmlFor="elapsed">{copy.elapsed}</label><input id="elapsed" maxLength={6} value={draft.elapsed} onChange={event => update({ elapsed: event.target.value })} placeholder="0:42" aria-invalid={!timeValid} aria-describedby={!timeValid ? 'time-error' : undefined} /></div><span>/</span><div><label className="field-label" htmlFor="duration">{copy.duration}</label><input id="duration" maxLength={6} value={draft.duration} onChange={event => update({ duration: event.target.value })} placeholder="4:18" aria-invalid={!timeValid} aria-describedby={!timeValid ? 'time-error' : undefined} /></div></div>
            {!timeValid && <p id="time-error" className="field-error">{copy.timeError}</p>}
            {isPolaroid && <><Toggle checked={draft.polaroid.showProgress} onChange={showProgress => update({ polaroid: { ...draft.polaroid, showProgress } })}>{copy.showProgress}</Toggle>
            <Toggle checked={draft.polaroid.showPauseGlyph} onChange={showPauseGlyph => update({ polaroid: { ...draft.polaroid, showPauseGlyph } })}>{copy.showPauseGlyph}</Toggle>
            <PolaroidEditor value={draft.polaroid} copy={copy} onChange={polaroid => update({ polaroid })} /></>}
            {isPlayer && <PlayerEditor value={draft.player} copy={copy} ink={foreground} onChange={player => update({ player })} />}
          </Section>}

          <Section number="05" title={copy.colors} extra={<span className="mini-label">{image ? copy.extractedColors : copy.palette}</span>}>
            {isPlayer && <PlayerBackground value={draft.player} copy={copy} onChange={player => update({ player })} />}
            {!autoBackground && <><div className="swatches">{draft.palette.map((color, index) => <button key={`${index}-${color}`} className={draft.background.toLowerCase() === color.toLowerCase() ? 'selected' : ''} onClick={() => update({ background: color })} aria-label={`${copy.chooseBackground} ${color}`} aria-pressed={draft.background.toLowerCase() === color.toLowerCase()}><span style={{ background: color, color: automaticForeground(color) }}>{draft.background.toLowerCase() === color.toLowerCase() && <Check size={17} />}</span><small>{color.slice(1).toUpperCase()}</small></button>)}</div>
            <div className="color-row"><label htmlFor="background">{copy.background}</label><span>{draft.background.toUpperCase()}</span><input id="background" type="color" value={draft.background} onChange={event => update({ background: event.target.value })} /></div>
            </>}
            {!isTicket && <div className="color-row"><label htmlFor="foreground">{copy.foreground}</label><button className={`auto-button ${customForeground === null ? 'active' : ''}`} aria-pressed={customForeground === null} onClick={() => updateForeground(null)}>{copy.automatic}</button><input id="foreground" type="color" value={foreground} onChange={event => updateForeground(event.target.value)} /></div>}
            {isTicket && <TicketPaper value={draft.concertTicket} copy={copy} palette={draft.palette} onChange={concertTicket => update({ concertTicket })} />}
            {draft.templateId === 'polaroid' && <p className="field-hint">{copy.colorsPolaroidHint}</p>}
            {!isCover && !isTicket && <Toggle checked={draft.showPalette} onChange={showPalette => update({ showPalette })}>{copy.showPalette}</Toggle>}
          </Section>

          {isTicket ? <Section number="06" title={copy.ticketDecorations}><TicketDecorations value={draft.concertTicket} copy={copy} onChange={concertTicket => update({ concertTicket })} /></Section> : isCover ? <Section number="06" title={copy.coverTypography}><AlbumCoverEditor value={draft.albumCover} ink={foreground} copy={copy} onChange={albumCover => update({ albumCover })} /></Section> : <Section number="06" title={copy.signature}>
            <Toggle checked={draft.showCredit} onChange={showCredit => update({ showCredit })}>{copy.showCredit}</Toggle>
            {draft.showCredit && <><label className="sr-only" htmlFor="credit">{copy.credit}</label><input id="credit" maxLength={80} value={draft.credit} onChange={event => update({ credit: event.target.value })} placeholder={copy.creditPlaceholder} /></>}
          </Section>}
        </fieldset>
        <div className="export-area">
          {error && <div className="error-message" role="alert">{copy[error]}<button className="icon-button" aria-label={copy.dismissError} onClick={() => setError(null)}><X size={15} /></button></div>}
          {download && <div className="download-result" role="status"><strong><Check size={15} /> {copy.pngReady}</strong><p>{copy.downloadRetry} <a href={download.url} download={download.file.name}>{copy.saveAgain}</a></p>{navigator.canShare?.({ files: [download.file] }) && <button className="share-button" onClick={() => void sharePng()}><Share2 size={15} /> {copy.share}</button>}</div>}
          <div className="export-actions"><a className="jump-preview" href="#preview">{copy.viewPreview}</a><button className="export-button" disabled={!ready || (!image && photoRequired) || !timeValid || busy || exporting} onClick={() => void exportPng()}>{exporting ? <LoaderCircle className="spin" size={18} /> : <ArrowDownToLine size={18} />}{exporting ? copy.exporting : copy.download}<span>↗</span></button></div>
          <p className="export-note">{!image && photoRequired ? copy.startHint : !image ? copy.ticketNoPhotoHint : `${device.width} × ${device.height} px · ${copy.noWatermark}`}</p>
        </div>
      </aside>
    </main>
    <footer className="site-footer"><span>ill. <span>{copy.footer}</span></span><span>{copy.footerNote}</span></footer>
  </div>;
}
