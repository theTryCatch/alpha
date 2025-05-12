import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

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
      [modules]="modules"
      [groupDisplayType]="'groupRows'"
      [animateRows]="true"
      [pagination]="true"
    ></ag-grid-angular>
  `
})
export class AppComponent {
  columnDefs: ColDef[] = [
    { headerName: 'Make', field: 'make', rowGroup: true },
    { headerName: 'Model', field: 'model' },
    { headerName: 'Price', field: 'price' }
  ];

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Ford', model: 'Focus', price: 29000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ];

  modules = [ClientSideRowModelModule];
}
