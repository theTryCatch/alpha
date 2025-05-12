import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, RowGroupingModule } from 'ag-grid-community';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 600px; height: 400px;"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [autoGroupColumnDef]="autoGroupColumnDef"
      [groupDisplayType]="'groupRows'"
      [groupDefaultExpanded]="1"
      [modules]="modules"
      [animateRows]="true"
    ></ag-grid-angular>
  `
})
export class AppComponent {
  columnDefs: ColDef[] = [
    { field: 'make', rowGroup: true, hide: true },
    { field: 'model' },
    { field: 'price' }
  ];

  autoGroupColumnDef: ColDef = {
    headerName: 'Make Group',
    cellRendererParams: {
      suppressCount: false
    }
  };

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Toyota', model: 'Corolla', price: 25000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Ford', model: 'Focus', price: 29000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ];

  modules = [ClientSideRowModelModule, RowGroupingModule]; // ✅ Important for v33.2.4
}
