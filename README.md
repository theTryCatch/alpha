import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular
      style="width: 600px; height: 300px;"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [pagination]="true"
      [rowSelection]="'multiple'"
      [animateRows]="true"
    ></ag-grid-angular>
  `
})
export class AppComponent {
  columnDefs = [
    { headerName: 'Make', field: 'make', sortable: true, filter: true, checkboxSelection: true },
    { headerName: 'Model', field: 'model', sortable: true, filter: true },
    { headerName: 'Price', field: 'price', sortable: true, filter: true }
  ];

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 }
  ];
}
