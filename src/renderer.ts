import type { Draft } from './model';
import type { Device } from './devices';
import { renderCustomPlayer } from './renderers/customPlayer';
import { renderNowPlaying } from './renderers/nowPlaying';

export { composition, fontFamily, prepareFonts } from './renderers/shared';

export function renderWallpaper(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth = 940, emptyLabel = 'ใส่รูปที่เป็นคุณ') {
  const render = draft.templateId === 'nowPlaying' ? renderNowPlaying : renderCustomPlayer;
  render(canvas, draft, image, device, outputWidth, emptyLabel);
}
