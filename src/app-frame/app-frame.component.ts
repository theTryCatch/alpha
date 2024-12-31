import { ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit, Type } from '@angular/core';
import { Theme, ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { FaviconService } from '../services/favicon.service';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeftSidenavItemsComponent } from '../left-sidenav-items/left-sidenav-items.component';
import { filter, map, Observable, Subscription } from 'rxjs';

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
export class AppFrameComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config?: IAppFrame;

  public leftSidenavState: SidebarStates = SidebarStates.expanded;
  public rightSidenavState: SidebarStates = SidebarStates.expanded;
  public userProfileMenuItems: IAppUserProfileMenuItem[] = [{ label: 'Settings' }];
  public dynamicComponent?: Type<Component>;
  public currentMenuItemIdentity: string = "";

  private subscriptions: Subscription[] = [];

  //#region These properties are created to use them in the template as we can't access the enum types in the template directly.
  public sidebarClosed: SidebarStates = SidebarStates.closed;
  public sidebarExpanded: SidebarStates = SidebarStates.expanded;
  public sidebarIcons: SidebarStates = SidebarStates.icons;

  public sidebarLeftPostion: SidebarPosition = SidebarPosition.left;
  public sidebarRightPostion: SidebarPosition = SidebarPosition.right;
  //#endregion


  isSmallScreen(): boolean {
    return window.innerWidth < 640;
  }
  isMediumScreen(): boolean {
    return window.innerWidth >= 640 && window.innerWidth < 1024;
  }
  //#region Recursively finding the items
  findMenuItem(menuIdentity?: string): ISidenavMenuItem | undefined {
    if (!menuIdentity) return undefined;
    return this.findItemInMenu(this.config?.leftSidenavMenuItems, menuIdentity);
  }

  private findItemInMenu(menuItems?: ISidenavMenuItem[], menuIdentity?: string): ISidenavMenuItem | undefined {
    if (!menuItems) return undefined;
    for (const item of menuItems) {
      if (item.identity === menuIdentity) {
        return item;
      }
      if (item.children) {
        const found = this.findItemInMenu(item.children, menuIdentity);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }
  //#endregion

  getDynamicComponent(): Type<Component> {
    return this.dynamicComponent as Type<Component>;
  }
  setSidenavState(left: SidebarStates, right: SidebarStates): void {
    this.leftSidenavState = left;
    this.rightSidenavState = right;
  }
  setSidenavToInitialSize(): void {
    if (this.isSmallScreen()) {
      this.setSidenavState(SidebarStates.closed, SidebarStates.closed);
    } else if (this.isMediumScreen()) {
      this.setSidenavState(SidebarStates.icons, SidebarStates.closed);
    }
    else {
      this.setSidenavState(SidebarStates.expanded, SidebarStates.expanded);
    }
  }
  toggleSidenav(side: SidebarPosition): void {
    const isLeft = side === SidebarPosition.left;
    let leftNextState: SidebarStates = this.leftSidenavState;
    let rightNextState: SidebarStates = this.rightSidenavState;
    if (isLeft) {
      leftNextState = this.getNextSidenavState(this.leftSidenavState, SidebarPosition.left).nextState;
    } else {
      rightNextState = this.getNextSidenavState(this.rightSidenavState, SidebarPosition.right).nextState;
    }
    this.setSidenavState(leftNextState, rightNextState);
  }
  getNextSidenavState(currentState: SidebarStates, side: SidebarPosition): ISidebarStatus {
    let result: SidebarStates;
    if (side === SidebarPosition.right || this.isSmallScreen()) {
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
    return resultTemp;
  }
  getInitialTheme(): Theme {
    if (this.config?.defaultTheme) {
      return this.config?.defaultTheme;
    } else {
      return "light" as Theme;
    }
  }
  cacheSelectedTheme(theme: Theme) {
    localStorage.setItem("ftui-app-frame-theme", theme)
  }
  getRightSidenavMargin(): string {
    if (this.rightSidenavState === SidebarStates.expanded && !this.isSmallScreen()) {
      return '16rem';
    }
    return '0';
  }
  getLeftSidenavWidth(): string | undefined {
    if (this.leftSidenavState === this.sidebarExpanded && !this.isSmallScreen()) {
      return this.config?.leftSidenavWidth.expanded;
    } else if (this.leftSidenavState === this.sidebarIcons && !this.isSmallScreen()) {
      return this.config?.leftSidenavWidth.icons;
    } else if (this.leftSidenavState === this.sidebarExpanded && this.isSmallScreen()) {
      return '100%';
    } else {
      return '0px';
    }
  }
  getRightSidenavWidth(): string | undefined {
    if (this.rightSidenavState === this.sidebarExpanded && !this.isSmallScreen()) {
      return this.config?.rightSidenavWidth;
    } else if (this.rightSidenavState === this.sidebarExpanded && this.isSmallScreen()) {
      return '100%';
    } else {
      return '0px';
    }
  }
  getMenuItemPath(): Observable<ISidenavMenuItem[]> {
    return this.route.queryParams.pipe(
      map((id: any) => {
        let path: ISidenavMenuItem[] = [];
        this.findItemPath(this.config?.leftSidenavMenuItems, id['id'])?.forEach((item) => {
          path.push(item);
        });
        return path;
      })
    );
  }
  findItemPath(menuItems?: ISidenavMenuItem[], identity?: string): ISidenavMenuItem[] | undefined {
    if (menuItems)
      for (const item of menuItems) {
        // If the current item's identity matches, return its path as a single-item array.
        if (item.identity === identity) {
          return [item];
        }

        // If the current item has children, search recursively in the children.
        if (item.children) {
          const childPath = this.findItemPath(item.children, identity);

          // If a matching path is found in the children, prepend the current item's identity to the path.
          if (childPath) {
            return [item, ...childPath];
          }
        }
      }

    // If no matching identity is found in this branch, return undefined.
    return undefined;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.setSidenavToInitialSize();
  }
  constructor(
    private title: Title,
    private faviconService: FaviconService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit(): void {
    //#region  Updating the changes when route changes
    this.subscriptions.push(this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        const queryParams = this.route.snapshot.queryParams;
        this.currentMenuItemIdentity = queryParams['id'];
        this.dynamicComponent = this.findMenuItem(this.currentMenuItemIdentity)?.rightSidenavComponent;
        this.setSidenavToInitialSize();
      }));

    //#endregion

    //#region Setting the browser title and favicon
    if (this.config?.browserTitlebar.title) {
      this.title.setTitle(this.config?.browserTitlebar.title);
    }

    if (this.config?.browserTitlebar.iconPath) {
      this.faviconService.changeFavicon(this.config?.browserTitlebar.iconPath);
    }
    //#endregion
  }
}
export interface IAppFrame {
  browserTitlebar: IAppFrameHeader;
  brandingbar: IAppBrandingbar;
  defaultTheme: Theme,
  leftSidenavMenuItems?: ISidenavMenuItem[];
  leftSidenavWidth: leftSidenavWidth,
  rightSidenavWidth: string;
}
export interface leftSidenavWidth {
  expanded: string;
  icons: string;
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
  route: string;
  googleIconName?: string;
  tooltip: string;
  rightSidenavComponent?: Type<Component>;
  children?: ISidenavMenuItem[];
}
