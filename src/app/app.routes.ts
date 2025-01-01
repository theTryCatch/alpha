import { Routes } from '@angular/router';
import { FooComponent } from '../foo/foo.component';

export const routes: Routes = [
    { path: 'foo', component: FooComponent },
    { path: 'home', component: FooComponent },
    { path: '**', redirectTo: 'home' }
];
