import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { ISidebarStatus, ISidenavMenuItem, SidebarPosition, SidebarStates } from '../app-frame/app-frame.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'left-sidenav-items',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './left-sidenav-items.component.html',
  styles: `
  `
})
export class LeftSidenavItemsComponent implements OnInit {
  @Input({ required: true }) config!: ISidenavMenuItem;
  @Input({ required: true }) sidebarStatus!: ISidebarStatus;
  @Output() menuItemClicked: EventEmitter<ISidenavMenuItem> = new EventEmitter<ISidenavMenuItem>();

  public sidebarClosed: SidebarStates = SidebarStates.closed;
  public sidebarExpanded: SidebarStates = SidebarStates.expanded;
  public sidebarIcons: SidebarStates = SidebarStates.icons;
  public sidebarLeftPostion: SidebarPosition = SidebarPosition.left;
  public sidebarRightPostion: SidebarPosition = SidebarPosition.right;
  public currentMenuItemIdentity: string = '';

  private subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {

  }
  ngOnInit(): void {
    this.subscriptions.push(this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        const queryParams = this.route.snapshot.queryParams;
        this.currentMenuItemIdentity = queryParams['id'];
      }));
  }
  emitMenuItemClick(item: ISidenavMenuItem) {
    // if (item?.rightSidenavComponent) {
    //   this.menuItemClicked.emit(item);
    // } else {
    //   this.menuItemClicked.emit();
    // }
    this.menuItemClicked.emit(item);
  }
}
