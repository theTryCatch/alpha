import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type Theme =
  "MorganStanley_Light" | "MorganStanley_Dark" | "Luminara" | "Nebula" | "Clay" | "Lagoon" | "Fantasy" | "Forest" | "Blush" | "Inferno" | "Harbor" | "Lemonade" | "Coffee";
@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn hover:bg-neutral border-none bg-transparent shadow-none">
        <svg class="fill-accent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M346-140 100-386q-10-10-15-22t-5-25q0-13 5-25t15-22l230-229-106-106 62-65 400 400q10 10 14.5 22t4.5 25q0 13-4.5 25T686-386L440-140q-10 10-22 15t-25 5q-13 0-25-5t-22-15Zm47-506L179-432h428L393-646Zm399 526q-36 0-61-25.5T706-208q0-27 13.5-51t30.5-47l42-54 44 54q16 23 30 47t14 51q0 37-26 62.5T792-120Z"/></svg>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl max-h-[50vh] overflow-auto"
      >
      <li *ngFor="let theme of themes">
          <input
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start peer-checked:bg-[red]"
            [attr.aria-label]="theme"
            [value]="theme"
            [checked]="theme === currentTheme"
            (click)="applyTheme(theme)"
          />
        </li>
      </ul>
    </div>
  `,
  styles: ``
})
export class ThemeSelectorComponent implements OnInit {
  @Input() initialTheme: Theme = 'MorganStanley_Light';
  @Output() themeChange: EventEmitter<Theme> = new EventEmitter<Theme>();

  themes: Theme[] = [
    "MorganStanley_Light", "MorganStanley_Dark", "Luminara", "Nebula", "Clay", "Lagoon", "Fantasy", "Forest", "Blush", "Inferno", "Harbor", "Lemonade", "Coffee",];
  currentTheme: Theme = this.initialTheme;

  ngOnInit() {
    if (!this.themes.includes(this.initialTheme)) {
      throw new Error(
        `Invalid initial theme: "${this.initialTheme
        }". It must be one of the predefined themes: ${this.themes.join(', ')}.`
      );
    }
    if (localStorage.getItem("ftui-app-frame-theme")) {
      this.applyTheme(localStorage.getItem("ftui-app-frame-theme") as Theme);
    } else {
      this.applyTheme(this.initialTheme);
    }
  }

  applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.themeChange.emit(this.currentTheme);
  }
}
