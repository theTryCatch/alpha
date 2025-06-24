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
