import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import { Camera, Flashlight, CloudSun, Move } from 'lucide-react';
import { automaticForeground, clamp, cropRect, type Crop, type Draft } from './model';
import { composition, prepareFonts, renderWallpaper } from './renderer';
import type { Device } from './devices';

type Props = { draft: Draft; image: HTMLImageElement | null; device: Device; onCrop: (crop: Crop) => void; onUpload: () => void };

export default function Preview({ draft, image, device, onCrop, onUpload }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<{ x: number; y: number; crop: Crop } | null>(null);
  const height = 470 * device.height / device.width;
  const frame = composition(height);
  useEffect(() => {
    let cancelled = false;
    if (canvas.current) renderWallpaper(canvas.current, draft, image, device);
    void prepareFonts(draft).then(() => {
      if (!cancelled && canvas.current) renderWallpaper(canvas.current, draft, image, device);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [draft, image, device]);

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging.current || !image) return;
    const rectangle = event.currentTarget.getBoundingClientRect();
    const crop = cropRect(image.naturalWidth, image.naturalHeight, dragging.current.crop);
    const horizontalRange = image.naturalWidth - crop.size;
    const verticalRange = image.naturalHeight - crop.size;
    onCrop({
      zoom: dragging.current.crop.zoom,
      x: horizontalRange > 0 ? clamp(dragging.current.crop.x - (event.clientX - dragging.current.x) * crop.size / rectangle.width / horizontalRange) : 0.5,
      y: verticalRange > 0 ? clamp(dragging.current.crop.y - (event.clientY - dragging.current.y) * crop.size / rectangle.height / verticalRange) : 0.5,
    });
  }

  return <div className="wallpaper" style={{ aspectRatio: `${device.width}/${device.height}`, '--wallpaper-ink': draft.foreground ?? automaticForeground(draft.background) } as CSSProperties}>
    <canvas ref={canvas} aria-label={`ตัวอย่างวอลเปเปอร์ ${draft.title} — ${draft.artist}`} />
    <button className={`artwork-hit ${image ? 'has-image' : ''}`} style={{ left: `${frame.left / 470 * 100}%`, top: `${frame.top / height * 100}%`, width: `${frame.size / 470 * 100}%`, aspectRatio: '1' }}
      aria-label={image ? 'เลื่อนรูปปก ใช้ปุ่มลูกศรเพื่อจัดตำแหน่ง' : 'อัปโหลดรูปปก'}
      onClick={() => { if (!image) onUpload(); }}
      onPointerDown={event => { if (image) { event.currentTarget.setPointerCapture(event.pointerId); dragging.current = { x: event.clientX, y: event.clientY, crop: draft.crop }; } }}
      onPointerMove={pointerMove} onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}
      onKeyDown={event => {
        if (!image) return;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          event.preventDefault();
          onCrop({ ...draft.crop, x: clamp(draft.crop.x + (event.key === 'ArrowRight' ? 0.03 : event.key === 'ArrowLeft' ? -0.03 : 0)), y: clamp(draft.crop.y + (event.key === 'ArrowDown' ? 0.03 : event.key === 'ArrowUp' ? -0.03 : 0)) });
        }
      }}>
      {image && <span className="drag-hint"><Move size={13} /> ลากเพื่อจัดรูป</span>}
    </button>
    {draft.showGuides && <div className="lock-guides" aria-label="นาฬิกาและวิดเจ็ตจำลอง ไม่ติดในไฟล์ PNG">
      <div className="lock-date">Monday, 9 September</div>
      <div className="lock-time">9:41</div>
      <div className="lock-widgets"><span><CloudSun /><b>28°</b></span><span className="widget-placeholder" /><span className="widget-placeholder" /></div>
      <div className="lock-shortcuts"><span><Flashlight /></span><span><Camera /></span></div>
      <div className="home-indicator" />
    </div>}
  </div>;
}
