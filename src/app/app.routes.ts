import { Routes } from '@angular/router';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { AppFrameComponent } from '../app-frame/app-frame.component';
import { FooComponent } from '../foo/foo.component';

export const routes: Routes = [
    { path: 'foo', component: FooComponent },
    { path: 'home', component: FooComponent },
];
