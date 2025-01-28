import { Routes } from '@angular/router';
import { FooComponent } from '../foo/foo.component';
import { WorkflowComponent } from './workflow/workflow.component';

export const routes: Routes = [
    { path: 'foo', component: FooComponent },
    { path: 'home', component: WorkflowComponent },
    { path: '**', redirectTo: 'home' }
];
