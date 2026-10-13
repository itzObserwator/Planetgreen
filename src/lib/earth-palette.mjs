/**
 * Apply Planet Green's daylight palette to the satellite map.
 * The ocean mask preserves coastlines; terrain variations and snow stay visible.
 * This pure function is shared with the texture-generation browser script.
 * @param {Uint8ClampedArray} pixels Satellite RGBA pixels, modified in place.
 * @param {Uint8ClampedArray} mask Ocean mask RGBA pixels (white = water).
 */
export function gradeEarthPixels(pixels, mask) {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i],
      g = pixels[i + 1],
      b = pixels[i + 2];
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const water = mask[i] / 255;
    const snow = Math.max(0, Math.min(1, (Math.min(r, g, b) - 170) / 65));
    const dry = Math.max(0, Math.min(1, ((r - b) / (r + 1) - 0.2) / 0.3));
    const vegetation = 0.78 * (1 - dry * 0.9) * (1 - snow);
    const terrain = [r * 0.83 + 76, g * 0.83 + 77, b * 0.8 + 71];
    const green = [72 + luminance * 0.46, 124 + luminance * 0.43, 54 + luminance * 0.36];
    const sea = [223 + luminance * 0.06, 233 + luminance * 0.075, 220 + luminance * 0.09];
    for (let channel = 0; channel < 3; channel++) {
      const land = terrain[channel] * (1 - vegetation) + green[channel] * vegetation;
      pixels[i + channel] = land * (1 - water) + sea[channel] * water;
    }
  }
}
