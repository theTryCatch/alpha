import { Component } from '@angular/core';
import { AppFrameComponent, IAppFrame, ISidenavMenuItem, SidebarStates } from '../app-frame/app-frame.component';
import { CommonModule } from '@angular/common';
import { FooComponent } from '../foo/foo.component';
import { ZooComponent } from '../zoo/zoo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppFrameComponent, CommonModule],
  template: `
    <app-frame [config]="appFrame" />
  `,
  styles: [],
})
export class AppComponent {
  public sidenavMenuItems: ISidenavMenuItem[] = [
    {
      label: "Home",
      tooltip: "Home page",
      route: "home",
      identity: "home",
      googleIconName: "home",
      rightSidenavComponent: FooComponent
    },
    {
      label: "A1z2b3c4",
      tooltip: "A1z2b3c4",
      route: "foo",
      identity: "A1z2b3c4",
      googleIconName: "access_alarm",
      rightSidenavComponent: FooComponent
    },
    {
      label: "Yarp2024",
      tooltip: "Yarp2024",
      route: "foo",
      identity: "Yarp2024",
      googleIconName: "settings",
      rightSidenavComponent: ZooComponent
    },
    {
      label: "B1c2d3e4",
      tooltip: "B1c2d3e4",
      route: "foo",
      identity: "B1c2d3e4",
      googleIconName: "settings",
      children: [
        {
          label: "R5s6t7u8",
          tooltip: "R5s6t7u8",
          route: "foo",
          identity: "R5s6t7u8",
          googleIconName: "lock",

          children: [
            {
              label: "F9g0h1i2",
              tooltip: "F9g0h1i2",
              route: "foo",
              identity: "F9g0h1i2",
              googleIconName: "live_tv",

              children: [{
                label: "V1w2x3y46",
                tooltip: "V1w2x3y46",
                route: "foo",
                identity: "V1w2x3y4",
                googleIconName: "mail",

                children: [
                  {
                    label: "V1w2x3y45",
                    tooltip: "V1w2x3y4",
                    route: "foo",
                    identity: "V1w2x3y45",
                    googleIconName: "mail",
                    rightSidenavComponent: ZooComponent
                  }
                ]
              }]

            },
            {
              label: "V1w2x3y4",
              tooltip: "V1w2x3y4",
              route: "foo",
              identity: "V1w2x3y4",
              googleIconName: "mail",

            },
            {
              label: "A4b5c6d7",
              tooltip: "A4b5c6d7",
              route: "foo",
              identity: "A4b5c6d7",
              googleIconName: "map",

            }
          ]
        },
        {
          label: "W1x2y3z4",
          tooltip: "W1x2y3z4",
          route: "foo",
          identity: "W1x2y3z4",
          googleIconName: "memory",
          children: [
            {
              label: "N5o6p7q8",
              tooltip: "N5o6p7q8",
              route: "foo",
              identity: "N5o6p7q8",
              googleIconName: "music_note",

            },
            {
              label: "U1v2w3x4",
              tooltip: "U1v2w3x4",
              route: "foo",
              identity: "U1v2w3x4",
              googleIconName: "people",
            },
          ]
        },
        {
          label: "G5h6i7j8",
          tooltip: "G5h6i7j8",
          route: "foo",
          identity: "G5h6i7j8",
          googleIconName: "phone",
          children: [
            {
              label: "R9s0t1u2",
              tooltip: "R9s0t1u2",
              route: "foo",
              identity: "R9s0t1u2",
              googleIconName: "picture_in_picture"
            },
            {
              label: "P1q2r3s4",
              tooltip: "P1q2r3s4",
              route: "foo",
              identity: "P1q2r3s4",
              googleIconName: "power_settings_new"
            },
            {
              label: "L4m5n6o7",
              tooltip: "L4m5n6o7",
              route: "foo",
              identity: "L4m5n6o7",
              googleIconName: "query_builder"
            },
            {
              label: "H5i6j7k8",
              tooltip: "H5i6j7k8",
              route: "foo",
              identity: "H5i6j7k8",
              googleIconName: "replay"
            }
          ]
        },
        {
          label: "B9c0d1e2",
          tooltip: "B9c0d1e2",
          route: "foo",
          identity: "B9c0d1e2",
          googleIconName: "restore",
          children: [
            {
              rightSidenavComponent: ZooComponent,
              label: "J4k5l6m7",
              tooltip: "J4k5l6m7",
              route: "foo",
              identity: "J4k5l6m7",
              googleIconName: "search"
            },
            {
              label: "T8u9v0w1",
              tooltip: "T8u9v0w1",
              route: "foo",
              identity: "T8u9v0w1",
              googleIconName: "security"
            },
            {
              label: "V2x3y4z5",
              tooltip: "V2x3y4z5",
              route: "foo",
              identity: "V2x3y4z5",
              googleIconName: "share"
            },
            {
              label: "A1b2c3d4",
              tooltip: "A1b2c3d4",
              route: "foo",
              identity: "A1b2c3d4",
              googleIconName: "shopping_cart"
            },
            {
              label: "X6y7z8a0",
              tooltip: "X6y7z8a0",
              route: "foo",
              identity: "X6y7z8a0",
              googleIconName: "star"
            }
          ]
        },
        {
          label: "F7g8h9i0",
          tooltip: "F7g8h9i0",
          route: "foo",
          identity: "F7g8h9i0",
          googleIconName: "subtitles",
          children: [
            {
              label: "R3s4t5u6",
              tooltip: "R3s4t5u6",
              route: "foo",
              identity: "R3s4t5u6",
              googleIconName: "text_fields"
            },
            {
              label: "V7w8x9y0",
              tooltip: "V7w8x9y0",
              route: "foo",
              identity: "V7w8x9y0",
              googleIconName: "thumb_up"
            },
            {
              label: "K1l2m3n4",
              tooltip: "K1l2m3n4",
              route: "foo",
              identity: "K1l2m3n4",
              googleIconName: "timer"
            },
            {
              label: "P9q0r1s2",
              tooltip: "P9q0r1s2",
              route: "foo",
              identity: "P9q0r1s2",
              googleIconName: "vpn_key"
            },
            {
              label: "S4t5u6v7",
              tooltip: "S4t5u6v7",
              route: "foo",
              identity: "S4t5u6v7",
              googleIconName: "watch_later"
            }
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
    defaultTheme: 'MorganStanley_Dark',
    leftSidenavWidth: {
      expanded: "20rem",
      icons: "10rem"
    },
    rightSidenavWidth: "25rem",
  };
}