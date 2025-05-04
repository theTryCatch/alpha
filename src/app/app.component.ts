import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicJsonFormComponent, Metadata } from './dynamic-json-form/dynamic-json-form.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WorkflowComponent } from './workflow/workflow.component';
import { IWorkflowManifest, WorkflowStepExecutionType, WorkflowStepCommandType, WorkflowStepRuntimeType, WorkflowStepActionType } from './workflow-library/interfaces';
import { SelectAddEntryComponent } from './select-add-entry/select-add-entry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `



<form [formGroup]="form" (ngSubmit)="onSubmit()">
<app-select-add-entry
  formControlName="fruit"
  [options]="['Apple', 'Banana', 'Mango']"
  [placeholder]="'Search or add fruit...'"
  [filterOnSearch]="false"
  [canAddNewItem]="false"
></app-select-add-entry>


  <button type="submit" class="btn btn-primary mt-4">Submit</button>
</form>

<p class="mt-4">Form Value: {{ form.value | json }}</p>




  `,
  imports: [CommonModule, FormsModule, RouterModule, SelectAddEntryComponent, ReactiveFormsModule],
})
export class AppComponent {
  form: FormGroup;
  fruitOptions = ['Apple', 'Banana', 'Cherry'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fruit: ['Appldde', Validators.required],
    });
  }

  onOptionAdded(newOption: string) {
    console.log('Added new option:', newOption);
  }

  onOptionSelected(selectedOption: string) {
    console.log('Selected option:', selectedOption);
  }

  onSubmit() {
    console.log('Form submitted:', this.form);
  }
}