import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

// ✅ Importing ag-grid-enterprise enables enterprise features
import 'ag-grid-enterprise';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 800px; height: 500px;"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [animateRows]="true"
      [rowGroupPanelShow]="'always'"
      [groupIncludeFooter]="true"
      [groupIncludeTotalFooter]="true"
    ></ag-grid-angular>
  `
})
export class AppComponent {
  columnDefs: ColDef[] = [
    { field: 'make', rowGroup: true, enableRowGroup: true },
    { field: 'model' },
    { field: 'price', aggFunc: 'sum' }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Toyota', model: 'Corolla', price: 25000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Ford', model: 'Focus', price: 29000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ];
}
