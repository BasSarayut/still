import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import { Camera, Flashlight, CloudSun, Move } from 'lucide-react';
import { automaticForeground, clamp, cropRect, playerColors, type Crop, type Draft } from './model';
import { composition, prepareFonts, renderWallpaper } from './renderer';
import type { Device } from './devices';
import type { Messages } from './i18n';
import { coverCropRect, coverPhotoFrame } from './albumCover';
import { playerLayout } from './musicPlayer';
import { photoDragDelta, polaroidLayout } from './polaroid';

type Props = { copy: Messages; draft: Draft; image: HTMLImageElement | null; device: Device; onCrop: (crop: Crop) => void; onUpload: () => void };

export default function Preview({ copy, draft, image, device, onCrop, onUpload }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<{ x: number; y: number; crop: Crop } | null>(null);
  const height = 470 * device.height / device.width;
  const standardFrame = draft.templateId === 'custom' ? playerLayout(height, draft.player, draft.showPalette) : composition(height);
  const polaroid = draft.templateId === 'polaroid' ? polaroidLayout(height, draft.polaroid, draft.showPalette) : null;
  const frame = polaroid ?? (draft.templateId === 'albumCover' ? coverPhotoFrame(height, draft.albumCover.split) : { ...standardFrame, width: standardFrame.size, height: standardFrame.size });
  useEffect(() => {
    let cancelled = false;
    if (canvas.current) renderWallpaper(canvas.current, draft, image, device, 940, copy.emptyImage);
    void prepareFonts(draft).then(() => {
      if (!cancelled && canvas.current) renderWallpaper(canvas.current, draft, image, device, 940, copy.emptyImage);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [draft, image, device, copy]);

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!dragging.current || !image) return;
    const wallpaper = event.currentTarget.parentElement!.getBoundingClientRect();
    const rectangle = { width: wallpaper.width * frame.width / 470, height: wallpaper.height * frame.height / height };
    const squareCrop = cropRect(image.naturalWidth, image.naturalHeight, dragging.current.crop);
    const crop = draft.templateId !== 'custom' ? coverCropRect(image.naturalWidth, image.naturalHeight, dragging.current.crop, frame.width / frame.height) : { ...squareCrop, width: squareCrop.size, height: squareCrop.size };
    const delta = photoDragDelta(event.clientX - dragging.current.x, event.clientY - dragging.current.y, polaroid ? draft.polaroid.rotation : 0);
    const horizontalRange = image.naturalWidth - crop.width;
    const verticalRange = image.naturalHeight - crop.height;
    onCrop({
      zoom: dragging.current.crop.zoom,
      x: horizontalRange > 0 ? clamp(dragging.current.crop.x - delta.x * crop.width / rectangle.width / horizontalRange) : 0.5,
      y: verticalRange > 0 ? clamp(dragging.current.crop.y - delta.y * crop.height / rectangle.height / verticalRange) : 0.5,
    });
  }

  const ink = draft.templateId === 'custom' ? playerColors(draft).foreground : draft.foreground ?? automaticForeground(draft.background);
  const description = draft.templateId === 'albumCover' ? draft.albumCover.texts.filter(text => text.visible).map(text => text.text).join(' — ') : `${draft.title} — ${draft.artist}`;
  return <div className="wallpaper" style={{ aspectRatio: `${device.width}/${device.height}`, '--wallpaper-ink': ink } as CSSProperties}>
    <canvas ref={canvas} aria-label={`${copy.previewLabel} ${description}`} />
    <button className={`artwork-hit ${image ? 'has-image' : ''}`} style={{ left: `${frame.left / 470 * 100}%`, top: `${frame.top / height * 100}%`, width: `${frame.width / 470 * 100}%`, height: `${frame.height / height * 100}%`, borderRadius: polaroid ? `${draft.polaroid.photoRadius / draft.polaroid.photoWidth * 100}% / ${draft.polaroid.photoRadius / polaroid.photoHeight * 100}%` : draft.templateId === 'custom' ? `${draft.player.artworkRadius / frame.width * 100}%` : undefined,
      transform: polaroid ? `rotate(${draft.polaroid.rotation}deg)` : undefined,
      transformOrigin: polaroid ? `${(polaroid.centerX - frame.left) / frame.width * 100}% ${(polaroid.centerY - frame.top) / frame.height * 100}%` : undefined }}
      aria-label={image ? copy.dragPhoto : copy.uploadPhoto}
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
      {image && <span className="drag-hint"><Move size={13} /> {copy.dragHint}</span>}
    </button>
    {draft.showGuides && !(draft.templateId === 'albumCover' && draft.albumCover.format === 'square') && <div className="lock-guides" aria-label={copy.guidesLabel}>
      <div className="lock-date">{copy.previewDate}</div>
      <div className="lock-time">9:41</div>
      <div className="lock-widgets"><span><CloudSun /><b>28°</b></span><span className="widget-placeholder" /><span className="widget-placeholder" /></div>
      <div className="lock-shortcuts"><span><Flashlight /></span><span><Camera /></span></div>
      <div className="home-indicator" />
    </div>}
  </div>;
}
