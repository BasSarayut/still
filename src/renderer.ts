import type { Draft } from './model';
import type { Device } from './devices';
import { renderMusicPlayer } from './renderers/musicPlayer';
import { renderPolaroid } from './renderers/polaroid';
import { renderAlbumCover } from './renderers/albumCover';

export { composition, fontFamily, prepareFonts } from './renderers/shared';

const renderers = { custom: renderMusicPlayer, polaroid: renderPolaroid, albumCover: renderAlbumCover } as const;

export function renderWallpaper(canvas: HTMLCanvasElement, draft: Draft, image: HTMLImageElement | null, device: Device, outputWidth = 940, emptyLabel = 'ใส่รูปที่เป็นคุณ') {
  const render = renderers[draft.templateId] ?? renderMusicPlayer;
  render(canvas, draft, image, device, outputWidth, emptyLabel);
}
