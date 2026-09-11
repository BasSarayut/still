import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowUpRight, Check, CheckCheck, ChevronDown, CircleHelp, ImagePlus, LoaderCircle, LockKeyhole, Minus, Music2, Plus, RotateCcw, Share2, ShieldCheck, Smartphone, X } from 'lucide-react';
import { devices, getDevice } from './devices';
import { automaticForeground, initialCrop, initialDraft, validTimes, type Draft } from './model';
import { canvasBlob, decodeImage, importImage } from './images';
import { loadDraft, saveDraft } from './storage';
import { prepareFonts, renderWallpaper } from './renderer';
import Preview from './Preview';

function Toggle({ checked, onChange, children, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; disabled?: boolean }) {
  return <label className="toggle-label"><span>{children}</span><input type="checkbox" role="switch" disabled={disabled} checked={checked} onChange={event => onChange(event.target.checked)} /><span className="toggle-track" aria-hidden="true" /></label>;
}

function Section({ number, title, children, extra }: { number: string; title: string; children: ReactNode; extra?: ReactNode }) {
  return <section className="control-section"><div className="section-heading"><h2><span>{number}</span>{title}</h2>{extra}</div>{children}</section>;
}

export default function App() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('กำลังเปิดงาน…');
  const [download, setDownload] = useState<{ url: string; file: File } | null>(null);
  const [help, setHelp] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const latest = useRef(draft);
  const revision = useRef(0);
  const importRevision = useRef(0);
  const device = getDevice(draft.device);
  const timeValid = validTimes(draft.elapsed, draft.duration);
  const foreground = draft.foreground ?? automaticForeground(draft.background);
  latest.current = draft;

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const restored = await loadDraft();
        let restoredImage: HTMLImageElement | null = null;
        if (restored.image) restoredImage = await decodeImage(restored.image);
        if (!cancelled) { setDraft(restored); setImage(restoredImage); setSaveStatus('บันทึกในเครื่องแล้ว'); }
      } catch {
        if (!cancelled) setSaveStatus('เปิดงานเดิมไม่ได้ · แต่งและดาวน์โหลดได้');
      } finally { if (!cancelled) setReady(true); }
    }
    void restore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const current = ++revision.current;
    const timer = window.setTimeout(() => {
      setSaveStatus('กำลังบันทึก…');
      void saveDraft(draft).then(() => {
        if (revision.current === current) setSaveStatus('บันทึกในเครื่องแล้ว');
      }).catch(() => {
        if (revision.current === current) setSaveStatus('บันทึกไม่ได้ · กรุณาดาวน์โหลดเก็บไว้');
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
    setSaveStatus('กำลังบันทึก…');
    setDraft(previous => ({ ...previous, ...patch }));
    setDownload(null);
  }

  async function upload(file?: File) {
    if (!file || !ready || exporting) return;
    const current = ++importRevision.current;
    setBusy(true); setError(''); setDownload(null);
    try {
      const imported = await importImage(file);
      if (current !== importRevision.current) return;
      setImage(imported.image);
      update({ image: imported.blob, crop: initialCrop, palette: imported.palette, background: imported.palette[0], foreground: null });
    } catch (failure) {
      if (current === importRevision.current) setError(failure instanceof Error ? failure.message : 'เปิดรูปไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally { if (current === importRevision.current) setBusy(false); }
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    void upload(event.target.files?.[0]);
    event.target.value = '';
  }

  async function exportPng() {
    if (!image || !timeValid || busy || exporting) return;
    setExporting(true); setError('');
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
      setError(failure instanceof Error ? failure.message : 'สร้าง PNG ไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally { setExporting(false); }
  }

  async function sharePng() {
    if (!download) return;
    try { await navigator.share({ files: [download.file] }); }
    catch (failure) { if (!(failure instanceof DOMException && failure.name === 'AbortError')) setError('แชร์รูปไม่สำเร็จ ใช้ปุ่มดาวน์โหลด PNG ได้เลย'); }
  }

  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="#main" aria-label="still. Wallpaper studio"><span className="brand-mark"><i /><i /></span><span>still<span className="brand-dot">.</span></span></a>
      <span className="brand-description">A WALLPAPER, A LITTLE MORE YOU.</span>
      <button className="help-button" onClick={() => setHelp(!help)} aria-expanded={help}><CircleHelp size={17} /><span>วิธีใช้งาน</span></button>
    </header>

    {help && <aside className="help-panel"><button className="icon-button close-help" onClick={() => setHelp(false)} aria-label="ปิดวิธีใช้งาน"><X size={18} /></button>
      <h2>จากรูปโปรด สู่หน้าจอของคุณ</h2><ol><li>เลือกรุ่น iPhone แล้วอัปโหลดรูป</li><li>ลากรูปในพรีวิวและปรับซูม ใส่ข้อความและเลือกสี</li><li>ดาวน์โหลด PNG แล้วเปิดรูปบน iPhone กดแชร์ → ใช้เป็นภาพพื้นหลัง</li></ol>
      <p>บน iPhone หากไฟล์อยู่ใน Downloads ให้เปิดไฟล์ กดแชร์ แล้วเลือกบันทึกรูปภาพก่อนตั้งวอลเปเปอร์ นาฬิกาจำลองไม่ติดใน PNG และตำแหน่งจริงขึ้นกับการตั้งค่า iOS</p>
      <p>งานล่าสุดเก็บเฉพาะเบราว์เซอร์นี้ การล้างข้อมูลเว็บไซต์หรือโหมดส่วนตัวอาจทำให้งานหาย</p>
    </aside>}

    <main id="main" className="studio">
      <div className="workspace">
        <div className="workspace-heading"><div><span className="eyebrow">YOUR PERSONAL WALLPAPER STUDIO</span><h1>รูปของคุณ <span>เพลงของคุณ</span></h1><p>เก็บความรู้สึกดี ๆ ไว้บนหน้าจอ</p></div><span className="template-badge"><Music2 size={13} /> THE MUSIC PLAYER <span>01</span></span></div>
        <div className="preview-toolbar" id="preview"><span className="preview-label"><span className="live-dot" /> ภาพตัวอย่าง</span><span>{device.width} × {device.height} <span className="pixels">PX</span></span></div>
        <div className="preview-stage">
          <div className="side-note">MADE OF YOUR FAVORITE THINGS</div>
          <div className="preview-wrap"><Preview draft={draft} image={image} device={device} onCrop={crop => { if (ready && !busy && !exporting) update({ crop }); }} onUpload={() => { if (ready && !busy && !exporting) uploadRef.current?.click(); }} /></div>
          <div className="stage-caption"><span>01 / MUSIC PLAYER</span><span>MAKE IT YOURS.</span></div>
        </div>
        <div className="preview-bottom"><Toggle disabled={!ready || busy || exporting} checked={draft.showGuides} onChange={showGuides => update({ showGuides })}><LockKeyhole size={14} /> จำลอง Lock Screen</Toggle><span>นาฬิกาและวิดเจ็ตไม่ติดในไฟล์ PNG</span></div>
        <p className="privacy-note"><ShieldCheck size={13} /> รูปของคุณอยู่บนเครื่องของคุณเสมอ</p>
      </div>

      <aside className="inspector" aria-label="เครื่องมือแต่งวอลเปเปอร์">
        <div className="inspector-heading"><div><span className="eyebrow">LET’S MAKE IT PERSONAL</span><h2>แต่งวอลเปเปอร์</h2></div><span className="tiny-music"><Music2 size={20} /></span></div>
        <div className="save-status" role="status"><CheckCheck size={13} />{saveStatus}</div>
        <fieldset disabled={!ready || busy || exporting} className="editor-fields">
          <Section number="01" title="หน้าจอของคุณ">
            <label className="sr-only" htmlFor="device">รุ่น iPhone</label>
            <div className="select-wrap"><Smartphone size={16} /><select id="device" value={device.name} onChange={event => update({ device: event.target.value })}>{devices.map(item => <option key={item.name}>{item.name}</option>)}</select><ChevronDown size={15} /></div>
            <div className="field-footnote"><span>{device.width} × {device.height} px</span><a href={device.source} target="_blank" rel="noreferrer">ขนาดจาก Apple <ArrowUpRight size={11} /></a></div>
          </Section>

          <Section number="02" title="รูปโปรดของคุณ" extra={image && <button className="text-button" onClick={() => { setImage(null); update({ image: null, crop: initialCrop }); }}>ลบรูป</button>}>
            <input ref={uploadRef} className="sr-only" id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={chooseFile} tabIndex={-1} />
            <button className={`upload-zone ${dragOver ? 'drag-over' : ''} ${image ? 'with-image' : ''}`} onClick={() => uploadRef.current?.click()}
              onDragOver={event => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onDrop={event => { event.preventDefault(); setDragOver(false); void upload(event.dataTransfer.files[0]); }}>
              {busy ? <LoaderCircle className="spin" size={24} /> : <ImagePlus size={25} strokeWidth={1.4} />}
              <strong>{busy ? 'กำลังเตรียมรูป…' : image ? 'เปลี่ยนรูปภาพ' : 'เลือกหรือลากรูปมาวาง'}</strong><span>JPG, PNG, WebP · สูงสุด 30 MB</span>
            </button>
            {image && <div className="crop-controls"><div className="zoom-heading"><label htmlFor="zoom">ซูมรูป</label><span>{draft.crop.zoom.toFixed(2)}×</span><button className="text-button" onClick={() => update({ crop: initialCrop })}><RotateCcw size={12} /> จัดกึ่งกลาง</button></div><div className="range-row"><Minus size={13} /><input id="zoom" type="range" min="1" max="4" step="0.01" value={draft.crop.zoom} onChange={event => update({ crop: { ...draft.crop, zoom: Number(event.target.value) } })} /><Plus size={13} /></div><p className="field-hint">ลากรูปในภาพตัวอย่างเพื่อจัดตำแหน่ง</p></div>}
          </Section>

          <Section number="03" title="เพลงที่เป็นคุณ">
            <label className="field-label" htmlFor="title">ชื่อเพลง / ข้อความ</label><input id="title" maxLength={120} value={draft.title} onChange={event => update({ title: event.target.value })} placeholder="เพลงโปรดของคุณ" />
            <label className="field-label" htmlFor="artist">ศิลปิน</label><input id="artist" maxLength={100} value={draft.artist} onChange={event => update({ artist: event.target.value })} placeholder="ชื่อศิลปิน หรือใครสักคน" />
            <div className="time-fields"><div><label className="field-label" htmlFor="elapsed">เวลาปัจจุบัน</label><input id="elapsed" maxLength={6} value={draft.elapsed} onChange={event => update({ elapsed: event.target.value })} placeholder="0:42" aria-invalid={!timeValid} aria-describedby={!timeValid ? 'time-error' : undefined} /></div><span>/</span><div><label className="field-label" htmlFor="duration">ความยาวเพลง</label><input id="duration" maxLength={6} value={draft.duration} onChange={event => update({ duration: event.target.value })} placeholder="4:18" aria-invalid={!timeValid} aria-describedby={!timeValid ? 'time-error' : undefined} /></div></div>
            {!timeValid && <p id="time-error" className="field-error">ใช้รูปแบบนาที:วินาที เช่น 0:42 โดยเวลาปัจจุบันไม่เกินความยาวเพลง และความยาวต้องมากกว่า 0:00</p>}
          </Section>

          <Section number="04" title="สีและบรรยากาศ" extra={<span className="mini-label">{image ? 'สีจากรูปของคุณ' : 'PALETTE'}</span>}>
            <div className="swatches">{draft.palette.map((color, index) => <button key={`${index}-${color}`} className={draft.background.toLowerCase() === color.toLowerCase() ? 'selected' : ''} onClick={() => update({ background: color })} aria-label={`เลือกสีพื้นหลัง ${color}`} aria-pressed={draft.background.toLowerCase() === color.toLowerCase()}><span style={{ background: color, color: automaticForeground(color) }}>{draft.background.toLowerCase() === color.toLowerCase() && <Check size={17} />}</span><small>{color.slice(1).toUpperCase()}</small></button>)}</div>
            <div className="color-row"><label htmlFor="background">สีพื้นหลัง</label><span>{draft.background.toUpperCase()}</span><input id="background" type="color" value={draft.background} onChange={event => update({ background: event.target.value })} /></div>
            <div className="color-row"><label htmlFor="foreground">ข้อความและไอคอน</label><button className={`auto-button ${draft.foreground === null ? 'active' : ''}`} aria-pressed={draft.foreground === null} onClick={() => update({ foreground: null })}>อัตโนมัติ</button><input id="foreground" type="color" value={foreground} onChange={event => update({ foreground: event.target.value })} /></div>
            <Toggle checked={draft.showPalette} onChange={showPalette => update({ showPalette })}>แสดง Color Palette</Toggle>
          </Section>

          <Section number="05" title="ลายเซ็นของคุณ">
            <Toggle checked={draft.showCredit} onChange={showCredit => update({ showCredit })}>แสดงเครดิตด้านล่าง</Toggle>
            {draft.showCredit && <><label className="sr-only" htmlFor="credit">ข้อความเครดิต</label><input id="credit" maxLength={80} value={draft.credit} onChange={event => update({ credit: event.target.value })} placeholder="@yourname หรือข้อความสั้น ๆ" /></>}
          </Section>
        </fieldset>
        <div className="export-area">
          {error && <div className="error-message" role="alert">{error}<button className="icon-button" aria-label="ปิดข้อความผิดพลาด" onClick={() => setError('')}><X size={15} /></button></div>}
          {download && <div className="download-result" role="status"><strong><Check size={15} /> PNG พร้อมแล้ว</strong><p>หากดาวน์โหลดไม่เริ่ม <a href={download.url} download={download.file.name}>กดบันทึกอีกครั้ง</a></p>{navigator.canShare?.({ files: [download.file] }) && <button className="share-button" onClick={() => void sharePng()}><Share2 size={15} /> แชร์ / บันทึกรูปภาพ</button>}</div>}
          <div className="export-actions"><a className="jump-preview" href="#preview">ดูตัวอย่าง</a><button className="export-button" disabled={!ready || !image || !timeValid || busy || exporting} onClick={() => void exportPng()}>{exporting ? <LoaderCircle className="spin" size={18} /> : <ArrowDownToLine size={18} />}{exporting ? 'กำลังสร้างวอลเปเปอร์…' : 'ดาวน์โหลด PNG'}<span>↗</span></button></div>
          <p className="export-note">{!image ? 'เลือกรูปโปรดของคุณเพื่อเริ่มต้น' : `${device.width} × ${device.height} px · ไม่มีลายน้ำ`}</p>
        </div>
      </aside>
    </main>
    <footer className="site-footer"><span>still. <span>Little moments. Yours to keep.</span></span><span>สร้างด้วยรูปของคุณ และความรู้สึกของคุณ</span></footer>
  </div>;
}
