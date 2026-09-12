import type { Draft } from './model';
import type { Device } from './devices';
import { renderCustomPlayer } from './renderers/customPlayer';
import { renderNowPlaying } from './renderers/nowPlaying';
import { renderPolaroid } from './renderers/polaroid';

export { composition, fontFamily, prepareFonts } from './renderers/shared';

const renderers = { custom: renderCustomPlayer, nowPlaying: renderNowPlaying, polaroid: renderPolaroid } as const;

export function renderWallpaper(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth = 940, emptyLabel = 'ใส่รูปที่เป็นคุณ') {
  const render = renderers[draft.templateId] ?? renderCustomPlayer;
  render(canvas, draft, image, device, outputWidth, emptyLabel);
}
