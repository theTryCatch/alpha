import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISidebarStatus, ISidenavMenuItem, SidebarPosition, SidebarStates } from '../app-frame/app-frame.component';

@Component({
  selector: 'left-sidenav-items',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './left-sidenav-items.component.html',
  styles: `
  `
})
export class LeftSidenavItemsComponent {
  @Input({ required: true }) config!: ISidenavMenuItem;
  @Input({ required: true }) sidebarStatus!: ISidebarStatus;
  @Output() menuItemClicked: EventEmitter<ISidenavMenuItem> = new EventEmitter<ISidenavMenuItem>();

  public sidebarClosed: SidebarStates = SidebarStates.closed;
  public sidebarExpanded: SidebarStates = SidebarStates.expanded;
  public sidebarIcons: SidebarStates = SidebarStates.icons;
  public sidebarLeftPostion: SidebarPosition = SidebarPosition.left;
  public sidebarRightPostion: SidebarPosition = SidebarPosition.right;

  emitMenuItemClick(item: ISidenavMenuItem) {
    // if (item?.rightSidenavComponent) {
    //   this.menuItemClicked.emit(item);
    // } else {
    //   this.menuItemClicked.emit();
    // }
    this.menuItemClicked.emit(item);
  }
}
