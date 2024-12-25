import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormattingService {

  constructor() { }
  getHexColorCode(className: string): string {
    // Create a temporary element
    const tempElement = document.createElement('div');

    // Apply the Tailwind class
    tempElement.className = className;

    // Append to DOM
    document.body.appendChild(tempElement);

    // Get the computed background color (in rgb format)
    const rgbColor = getComputedStyle(tempElement).backgroundColor;

    // Remove the temporary element
    document.body.removeChild(tempElement);

    // Convert rgb to hex
    return this.rgbToHex(rgbColor);
  }
  rgbToHex(rgb: string): string {
    // Extract the RGB values using regex
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) {
      return '#000000'; // Fallback to black if invalid
    }

    const [r, g, b] = match.map(Number);

    // Convert to hexadecimal and return
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }
}
