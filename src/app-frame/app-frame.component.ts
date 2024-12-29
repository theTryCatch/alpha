import { Component, HostListener, Input, OnInit, Type } from '@angular/core';
import { Theme, ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FaviconService } from '../services/favicon.service';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeftSidenavItemsComponent } from '../left-sidenav-items/left-sidenav-items.component';

@Component({
  selector: 'app-frame',
  standalone: true,
  imports: [
    CommonModule,
    ThemeSelectorComponent,
    RouterOutlet,
    FormsModule,
    LeftSidenavItemsComponent
  ],
  templateUrl: './app-frame.component.html',
  styles: ``
})
export class AppFrameComponent implements OnInit {
  @Input({ required: true }) config?: IAppFrame;

  public sidebarClosed: SidebarStates = SidebarStates.closed;
  public sidebarExpanded: SidebarStates = SidebarStates.expanded;
  public sidebarIcons: SidebarStates = SidebarStates.icons;
  public sidebarLeftPostion: SidebarPosition = SidebarPosition.left;
  public sidebarRightPostion: SidebarPosition = SidebarPosition.right;

  public leftSidenavState: SidebarStates = SidebarStates.expanded;
  public rightSidenavState: SidebarStates = SidebarStates.expanded;
  public isSmallScreen: boolean = false;
  userProfileMenuItems: IAppUserProfileMenuItem[] = [{ label: 'Settings' }];
  dynamicComponent?: any;
  constructor(
    private title: Title,
    private faviconService: FaviconService,
  ) {

  }
  ngOnInit(): void {
    this.updateSidenavState(window.innerWidth);

    if (this.config?.browserTitlebar.title) {
      this.title.setTitle(this.config?.browserTitlebar.title);
    }

    if (this.config?.browserTitlebar.iconPath) {
      this.faviconService.changeFavicon(this.config?.browserTitlebar.iconPath);
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateSidenavState(event.target.innerWidth);
  }
  toggleSidenav(side: SidebarPosition) {
    const isLeft = side === SidebarPosition.left;

    if (isLeft) {
      this.leftSidenavState = this.getNextSidenavState(this.leftSidenavState, SidebarPosition.left).nextState;
    } else {
      this.rightSidenavState = this.getNextSidenavState(this.rightSidenavState, SidebarPosition.right).nextState;
    }

    if (this.isSmallScreen && (isLeft ? this.leftSidenavState : this.rightSidenavState) !== SidebarStates.closed) {
      if (isLeft) {
        this.rightSidenavState = SidebarStates.closed;
      } else {
        this.leftSidenavState = SidebarStates.closed;
      }
    }
  }
  getNextSidenavState(currentState: SidebarStates, side: SidebarPosition): ISidebarStatus {

    let result: SidebarStates;

    if (side === SidebarPosition.right || this.isSmallScreen) {
      result = currentState === SidebarStates.expanded ? SidebarStates.closed : SidebarStates.expanded;
    } else {
      switch (currentState) {
        case SidebarStates.expanded:
          result = SidebarStates.icons;
          break;
        case SidebarStates.icons:
          result = SidebarStates.closed;
          break;
        default:
          result = SidebarStates.expanded;
      }
    }

    const resultTemp: ISidebarStatus = { nextState: result, side, currentState };



    /* 
        const logSidebarStatus = (status: ISidebarStatus): Record<string, any> => {
          const enumMap: { [key: string]: any } = {
            side: SidebarPosition,
            currentState: SidebarStates,
            nextState: SidebarStates,
          };
    
          return Object.entries(status).reduce((acc: Record<string, any>, [key, value]) => {
            if (typeof value === "number" && enumMap[key]) {
              acc[key] = enumMap[key][value]; // Map number to enum string
            } else {
              acc[key] = value;
            }
            return acc;
          }, {}); // Initialize as a plain object
        };
        console.log(logSidebarStatus(resultTemp)); */



    return resultTemp;
  }
  updateSidenavState(screenWidth: number) {
    this.isSmallScreen = screenWidth < 640;
    if (this.isSmallScreen) {
      this.leftSidenavState = SidebarStates.closed;
      this.rightSidenavState = SidebarStates.closed;
    }
    // Commenting out this code as this is overwriting the defaults specified. Keeping it for reference.
    /* else if (screenWidth >= 640 && screenWidth < 1024) {
      this.leftSidenavState = SidebarStates.icons;
      this.rightSidenavState = SidebarStates.closed;
    } else {
      this.leftSidenavState = SidebarStates.expanded;
      this.rightSidenavState = SidebarStates.closed;
    } */
  }
  onUserProfileMenuItemClick(_t36: IAppUserProfileMenuItem) {
    throw new Error('Method not implemented.');
  }
  getInitialTheme(): Theme {
    if (this.config?.defaultTheme) {
      return this.config?.defaultTheme;
    } else {
      return "light" as Theme;
    }
  }
  getRightSidenavMargin() {
    if (this.rightSidenavState === SidebarStates.expanded && !this.isSmallScreen) {
      return '16rem'; // Full width (64) on large screens
    }
    return '0'; // No margin for small screens or closed sidenav
  }
  onThemeChange(theme: Theme) {
    localStorage.setItem("ftui-app-frame-theme", theme)
  }
  onMenuItemClick(menuItem: ISidenavMenuItem) {
    if (menuItem) {
      this.dynamicComponent = menuItem.rightSidenavComponent;
      if (this.rightSidenavState === SidebarStates.closed) {
        this.rightSidenavState = SidebarStates.expanded;
      }
    } else {
      this.dynamicComponent = undefined;
    }
  }
}
export interface IAppFrame {
  browserTitlebar: IAppFrameHeader;
  brandingbar: IAppBrandingbar;
  defaultTheme: Theme,
  leftSidenavMenuItems?: ISidenavMenuItem[];
}
export interface IAppFrameHeader {
  title: string;
  iconPath: string;
}
export interface IAppBrandingbar {
  applicationName: string;
  organizationLogo: string;
  userProfileImagePath: string;
}
export interface IAppUserProfileMenuItem {
  label: string;
  badge?: string;
}
export enum SidebarPosition {
  "left",
  "right"
}
export enum SidebarStates {
  "closed",
  "expanded",
  "icons"
}
export interface ISidebarStatus {
  side: SidebarPosition,
  currentState: SidebarStates,
  nextState: SidebarStates
}
export interface ISidenavMenuItem {
  identity: string;
  label: string;
  route?: string;
  googleIconName?: string;
  rightSidenavComponent?: Type<any>;
  children?: ISidenavMenuItem[];
}