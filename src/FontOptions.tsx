import { coverFontLabels, coverFonts, type CoverPreset } from './albumCover';

type Font = keyof typeof coverFonts;
type Props = { template: 'custom' | 'polaroid' | 'albumCover' | 'concertTicket'; style?: CoverPreset };

const coverSuggestions: Partial<Record<CoverPreset, Font[]>> = {
  minimal: ['dmSans', 'anuphan', 'cormorant'], fullPhoto: ['oswald', 'kanit', 'dmSans'],
  swiss: ['spaceGrotesk', 'oswald', 'kanit'], indie: ['mali', 'handwritten', 'robotoMono'],
  vinyl: ['playfair', 'thaiSerif', 'cormorant'], dreamy: ['cormorant', 'playfair', 'mali'],
  poster: ['oswald', 'kanit', 'spaceGrotesk'], cassette: ['robotoMono', 'kanit'], zine: ['mali', 'robotoMono', 'handwritten'],
};
const suggestions: Record<Props['template'], Font[]> = {
  custom: ['dmSans', 'spaceGrotesk', 'anuphan', 'kanit'],
  polaroid: ['mali', 'handwritten', 'cormorant', 'thaiSerif'],
  albumCover: ['playfair', 'oswald', 'kanit', 'spaceGrotesk'],
  concertTicket: ['oswald', 'robotoMono', 'kanit', 'spaceGrotesk'],
};
const groups: { label: string; fonts: Font[] }[] = [
  { label: 'ไทย · Thai', fonts: ['thai', 'anuphan', 'kanit', 'thaiSerif', 'mali'] },
  { label: 'เรียบ / Modern sans', fonts: ['sans', 'dmSans', 'spaceGrotesk', 'oswald'] },
  { label: 'คลาสสิก / Serif', fonts: ['serif', 'playfair', 'cormorant'] },
  { label: 'ลายมือ / Handwriting', fonts: ['handwritten'] },
  { label: 'พิมพ์ดีด / Monospace', fonts: ['mono', 'robotoMono'] },
  { label: '日本語 / Japanese', fonts: ['japanese'] },
];

export default function FontOptions({ template, style }: Props) {
  const recommended = style && coverSuggestions[style] || suggestions[template];
  const options = (fonts: Font[]) => fonts.map(font => <option key={font} value={font} style={{ fontFamily: coverFonts[font] }}>{coverFontLabels[font]}</option>);
  return <><optgroup label="แนะนำ / Recommended / おすすめ">{options(recommended)}</optgroup>{groups.map(group => {
    const fonts = group.fonts.filter(font => !recommended.includes(font));
    return fonts.length ? <optgroup key={group.label} label={group.label}>{options(fonts)}</optgroup> : null;
  })}</>;
}
