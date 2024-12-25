import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFrameComponent, IAppFrame, ISidenavMenuItem } from '../app-frame/app-frame.component';
import { CommonModule } from '@angular/common';
import { LeftSidenavItemsComponent } from '../left-sidenav-items/left-sidenav-items.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppFrameComponent, LeftSidenavItemsComponent, CommonModule],
  template: `
    <app-frame [config]="appFrame" />
  `,
  styles: [],
})
export class AppComponent {
  public sidenavMenuItems: ISidenavMenuItem[] = [
    {
      "label": "A1z2b3c4",
      "googleIconName": "access_alarm",
      "route": "foo"
    },
    {
      "label": "B1c2d3e4",
      "googleIconName": "settings",
      "children": [
        {
          "label": "R5s6t7u8",
          "googleIconName": "lock",
          "children": [
            { "label": "F9g0h1i2", "googleIconName": "live_tv" },
            { "label": "V1w2x3y4", "googleIconName": "mail" },
            { "label": "A4b5c6d7", "googleIconName": "map" }
          ]
        },
        {
          "label": "W1x2y3z4",
          "googleIconName": "memory",
          "children": [
            { "label": "N5o6p7q8", "googleIconName": "music_note" },
            { "label": "U1v2w3x4", "googleIconName": "people" },
          ]
        },
        {
          "label": "G5h6i7j8",
          "googleIconName": "phone",
          "children": [
            { "label": "R9s0t1u2", "googleIconName": "picture_in_picture" },
            { "label": "P1q2r3s4", "googleIconName": "power_settings_new" },
            { "label": "L4m5n6o7", "googleIconName": "query_builder" },
            { "label": "H5i6j7k8", "googleIconName": "replay" }
          ]
        },
        {
          "label": "B9c0d1e2",
          "googleIconName": "restore",
          "children": [
            { "label": "J4k5l6m7", "googleIconName": "search" },
            { "label": "T8u9v0w1", "googleIconName": "security" },
            { "label": "V2x3y4z5", "googleIconName": "share" },
            { "label": "A1b2c3d4", "googleIconName": "shopping_cart" },
            { "label": "X6y7z8a0", "googleIconName": "star" }
          ]
        },
        {
          "label": "F7g8h9i0",
          "googleIconName": "subtitles",
          "children": [
            { "label": "R3s4t5u6", "googleIconName": "text_fields" },
            { "label": "V7w8x9y0", "googleIconName": "thumb_up" },
            { "label": "K1l2m3n4", "googleIconName": "timer" },
            { "label": "P9q0r1s2", "googleIconName": "vpn_key" },
            { "label": "S4t5u6v7", "googleIconName": "watch_later" }
          ]
        }
      ]
    }
  ];
  public appFrame: IAppFrame = {
    browserTitlebar: {
      iconPath: "favicon.icon",
      title: "App Frame"
    },
    brandingbar: {
      applicationName: "Workflow",
      organizationLogo: "ms_white.png",
      userProfileImagePath: "ak.jpg"
    },
    leftSidenavMenuItems: this.sidenavMenuItems,
    defaultTheme: 'MorganStanley_Dark'
  };
}