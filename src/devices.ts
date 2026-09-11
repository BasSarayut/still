export type Device = { name: string; width: number; height: number; source: string };

const support = (id: string) => `https://support.apple.com/en-us/${id}`;

export const devices: Device[] = [
  { name: 'iPhone 18 Pro Max', width: 1320, height: 2868, source: 'https://www.apple.com/iphone-18-pro/specs/' },
  { name: 'iPhone 18 Pro', width: 1206, height: 2622, source: 'https://www.apple.com/iphone-18-pro/specs/' },
  { name: 'iPhone 17 Pro Max', width: 1320, height: 2868, source: support('125091') },
  { name: 'iPhone 17 Pro', width: 1206, height: 2622, source: support('125090') },
  { name: 'iPhone 17', width: 1206, height: 2622, source: 'https://www.apple.com/iphone-17/specs/' },
  { name: 'iPhone Air', width: 1260, height: 2736, source: 'https://www.apple.com/iphone-air/specs/' },
  { name: 'iPhone 17e', width: 1170, height: 2532, source: 'https://www.apple.com/iphone-17e/specs/' },
  { name: 'iPhone 16 Pro Max', width: 1320, height: 2868, source: support('121032') },
  { name: 'iPhone 16 Pro', width: 1206, height: 2622, source: support('121031') },
  { name: 'iPhone 16 Plus', width: 1290, height: 2796, source: support('121030') },
  { name: 'iPhone 16', width: 1179, height: 2556, source: support('121029') },
  { name: 'iPhone 16e', width: 1170, height: 2532, source: support('122208') },
  { name: 'iPhone 15 Pro Max', width: 1290, height: 2796, source: support('111828') },
  { name: 'iPhone 15 Pro', width: 1179, height: 2556, source: support('111829') },
  { name: 'iPhone 15 Plus', width: 1290, height: 2796, source: support('111830') },
  { name: 'iPhone 15', width: 1179, height: 2556, source: support('111831') },
  { name: 'iPhone 14 Pro Max', width: 1290, height: 2796, source: support('111846') },
  { name: 'iPhone 14 Pro', width: 1179, height: 2556, source: support('111849') },
  { name: 'iPhone 14 Plus', width: 1284, height: 2778, source: support('111854') },
  { name: 'iPhone 14', width: 1170, height: 2532, source: support('111850') },
  { name: 'iPhone 13 Pro Max', width: 1284, height: 2778, source: support('111870') },
  { name: 'iPhone 13 Pro', width: 1170, height: 2532, source: support('111871') },
  { name: 'iPhone 13', width: 1170, height: 2532, source: support('111872') },
  { name: 'iPhone 13 mini', width: 1080, height: 2340, source: support('111873') },
  { name: 'iPhone 12 Pro Max', width: 1284, height: 2778, source: support('111874') },
  { name: 'iPhone 12 Pro', width: 1170, height: 2532, source: support('111875') },
  { name: 'iPhone 12', width: 1170, height: 2532, source: support('111876') },
  { name: 'iPhone 12 mini', width: 1080, height: 2340, source: support('111877') },
];

export function getDevice(name: string) {
  return devices.find(device => device.name === name) ?? devices.find(device => device.name === 'iPhone 16')!;
}
