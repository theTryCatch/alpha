import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-root',
  template: `
    <ag-grid-angular
      style="width: 600px; height: 400px;"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [frameworkComponents]="frameworkComponents"
      [context]="{ componentParent: this }"
      rowSelection="single"
    ></ag-grid-angular>
  `
})
export class AppComponent {
  rowData = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ];

  columnDefs = [
    { field: 'name' },
    { field: 'age' },
    {
      headerName: '',
      cellRenderer: 'actionMenuRenderer',
      width: 60,
      suppressMenu: true,
      suppressSorting: true
    }
  ];

  frameworkComponents = {
    actionMenuRenderer: ActionMenuRenderer
  };

  onEditRow(data: any) {
    alert('Edit: ' + JSON.stringify(data));
  }

  onDeleteRow(data: any) {
    alert('Delete: ' + JSON.stringify(data));
  }
}

@Component({
  selector: 'app-action-menu-renderer',
  template: `
    <div style="position: relative;">
      <button (click)="toggleMenu($event)">⋮</button>
      <ul *ngIf="menuOpen" style="
        position: absolute;
        right: 0;
        top: 100%;
        background: white;
        border: 1px solid #ccc;
        list-style: none;
        padding: 0;
        margin: 4px 0;
        width: 100px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      ">
        <li style="padding: 6px; cursor: pointer;" (click)="edit()">Edit</li>
        <li style="padding: 6px; cursor: pointer;" (click)="delete()">Delete</li>
      </ul>
    </div>
  `
})
export class ActionMenuRenderer implements ICellRendererAngularComp {
  public params: any;
  public menuOpen = false;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  edit(): void {
    this.menuOpen = false;
    this.params.context.componentParent.onEditRow(this.params.data);
  }

  delete(): void {
    this.menuOpen = false;
    this.params.context.componentParent.onDeleteRow(this.params.data);
  }
}















import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-action-menu-renderer',
  standalone: true,
  template: `
    <div class="relative" (click)="stopPropagation($event)">
      <button (click)="toggleMenu($event)">⋮</button>

      <ul *ngIf="menuOpen" class="absolute right-0 top-full bg-white border rounded shadow w-24 z-50">
        <li class="p-2 hover:bg-gray-100 cursor-pointer" (click)="edit()">Edit</li>
        <li class="p-2 hover:bg-gray-100 cursor-pointer" (click)="delete()">Delete</li>
      </ul>
    </div>
  `,
  styles: []
})
export class ActionMenuRendererComponent implements ICellRendererAngularComp {
  params: any;
  menuOpen = false;

  agInit(params: any): void {
    this.params = params;
    document.addEventListener('click', this.onOutsideClick);
  }

  refresh(): boolean {
    return false;
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  edit() {
    this.menuOpen = false;
    this.params.context.componentParent.onEdit(this.params.data);
  }

  delete() {
    this.menuOpen = false;
    this.params.context.componentParent.onDelete(this.params.data);
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  onOutsideClick = () => {
    this.menuOpen = false;
  };

  // Cleanup
  destroy() {
    document.removeEventListener('click', this.onOutsideClick);
  }
}
















import { ActionReducer, createAction, MetaReducer, Store } from '@ngrx/store';

// Define the reset action
export const resetStore = createAction('[Store] Reset');

// Array of action types that should NOT trigger store reset (even if dispatched after reset)
const EXCLUDED_ACTION_TYPES = [
  '[User] Login Success',
  '[Settings] Persist',
  // Add more action types you want to preserve
];

// Meta-reducer with exclusion logic
export const resetMetaReducer: (reducer: ActionReducer<any>) => ActionReducer<any> =
  (reducer) => (state, action) => {
    // Only reset if it's the reset action and NOT in excluded list
    if (action.type === resetStore.type && !EXCLUDED_ACTION_TYPES.includes(action.type)) {
      state = undefined;
    }
    return reducer(state, action);
  };

// Export as part of metaReducers array
export const metaReducers: MetaReducer<any>[] = [resetMetaReducer];

// Helper to dispatch the reset action
export const resetNgrxReduxStore = (store: Store): void => store.dispatch(resetStore());
