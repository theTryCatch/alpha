function hexToRgb(hex: string): [number, number, number] | null {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return null;

  const bigint = parseInt(hex, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function isDarkTheme(hexColor: string): boolean {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return false;
  const luminance = getLuminance(...rgb);
  return luminance < 0.5;
}
