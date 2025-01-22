// dynamic-json-form.component.ts
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

export interface Metadata {
  [key: string]:
    | {
        helpMessage?: string;
        maxLength?: number;
        required?: boolean;
        userDefined?: boolean;
        popupMessage?: string;
        nestedMetadata?: Metadata;
      }
    | undefined;
}

@Component({
  selector: 'app-dynamic-json-form',
  standalone: true,
  template: `
    <form [formGroup]="formGroup" class="p-4 space-y-4">
      <ng-container *ngFor="let key of objectKeys(jsonInput)">
        <ng-container *ngIf="!isObject(jsonInput[key]); else nestedObject">
          <div class="form-control">
            <ng-container *ngIf="metadata[key]?.userDefined; else staticKey">
              <div class="flex items-center gap-1">
                <input
                  type="text"
                  class="input input-bordered flex-1"
                  [formControlName]="key + '_key'"
                />
                <div class="relative flex items-center gap-1">
                  <input
                    type="text"
                    class="input input-bordered flex-1"
                    [formControlName]="key"
                    [attr.maxLength]="metadata[key]?.maxLength"
                  />
                  <button
                    *ngIf="metadata[key]?.popupMessage"
                    class="btn btn-circle"
                    (click)="showPopup(metadata[key]?.popupMessage)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                      <path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </ng-container>
            <ng-template #staticKey>
              <label class="label">
                <span class="label-text">{{ formatKey(key) }}</span>
              </label>
              <div class="relative flex items-center gap-1">
                <input
                  type="text"
                  class="input input-bordered flex-1"
                  [formControlName]="key"
                  [attr.maxLength]="metadata[key]?.maxLength"
                />
                <button
                  class="btn btn-circle"
                  *ngIf="metadata[key]?.popupMessage"
                  (click)="showPopup(metadata[key]?.popupMessage)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                    <path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"/>
                  </svg>
                </button>
              </div>
            </ng-template>
            <div
              class="text-sm text-gray-500 mt-1"
              *ngIf="metadata[key]?.helpMessage"
            >
              {{ metadata[key]?.helpMessage }}
            </div>
            <div
              *ngIf="formGroup.get(key)?.hasError('required') && formGroup.get(key)?.touched"
              class="text-red-500 text-sm"
            >
              This field is required.
            </div>
          </div>
        </ng-container>

        <ng-template #nestedObject>
          <div class="collapse collapse-arrow border border-base-300 rounded-box">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-lg font-medium">
              {{ formatKey(key) }}
            </div>
            <div class="collapse-content">
              <app-dynamic-json-form
                [jsonInput]="jsonInput[key]"
                [metadata]="inheritUserDefined(metadata[key]?.nestedMetadata || {})"
              ></app-dynamic-json-form>
              <div class="mt-2" *ngIf="metadata[key]?.userDefined">
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  (click)="addKeyToNested(key)"
                >
                  Add Key
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </form>

    <div
      *ngIf="popupContent"
      class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
      (click)="closePopup()"
    >
      <div
        class="bg-white p-4 rounded shadow-md max-w-lg w-full"
        (click)="$event.stopPropagation()"
      >
        <button
          type="button"
          class="btn btn-outline btn-sm absolute top-2 right-2"
          (click)="closePopup()"
        >
          Close
        </button>
        <div [innerHTML]="popupContent"></div>
      </div>
    </div>
  `,
  styles: [],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DynamicJsonFormComponent {
  @Input() jsonInput: any = {};
  @Input() metadata: Metadata = {};

  formGroup: FormGroup = new FormGroup({});
  popupContent: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createFormControls(this.jsonInput, this.metadata);
    this.addUserDefinedValidators();
  }

  createFormControls(jsonObject: any, metadata: Metadata, parentKey: string = '') {
    Object.keys(jsonObject).forEach((key) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const fieldMetadata = metadata[key] || {};
      if (this.isObject(jsonObject[key])) {
        this.createFormControls(jsonObject[key], this.inheritUserDefined(fieldMetadata?.nestedMetadata || {}), fullKey);
      } else {
        const validators = [];
        if (fieldMetadata?.required) validators.push(Validators.required);
        if (fieldMetadata?.maxLength) validators.push(Validators.maxLength(fieldMetadata.maxLength));
        if (fieldMetadata?.userDefined) {
          this.formGroup.addControl(`${key}_key`, new FormControl(key, Validators.required));
        }
        this.formGroup.addControl(fullKey, new FormControl(jsonObject[key] ?? '', validators));
      }
    });
  }

  inheritUserDefined(metadata: Metadata | undefined): Metadata {
    if (!metadata) return {}; // Return an empty object instead of undefined
  
    const newMetadata: Metadata = {};
    Object.keys(metadata).forEach((key) => {
      const current = metadata[key];
      newMetadata[key] = {
        ...current,
        userDefined: current?.userDefined ?? true,
        nestedMetadata: this.inheritUserDefined(current?.nestedMetadata), // Recursively apply
      };
    });
    return newMetadata;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  addUserDefinedValidators() {
    Object.keys(this.metadata).forEach((key) => {
      if (this.metadata[key]?.userDefined) {
        const keyControl = this.formGroup.get(`${key}_key`);
        const valueControl = this.formGroup.get(key);
        if (keyControl && valueControl) {
          keyControl.addValidators(Validators.required);
          valueControl.addValidators(Validators.required);
          keyControl.updateValueAndValidity();
          valueControl.updateValueAndValidity();
        }
      }
    });
  }

  addKeyToNested(parentKey: string) {
    // Check for existing unfilled controls
    const parentKeys = Object.keys(this.jsonInput[parentKey] || {});
    for (const existingKey of parentKeys) {
      const keyControl = this.formGroup.get(`${parentKey}.${existingKey}_key`);
      const valueControl = this.formGroup.get(`${parentKey}.${existingKey}`);
      if ((keyControl && !keyControl.value) || (valueControl && !valueControl.value)) {
        alert("Please fill in all existing keys and values before adding a new one.");
        return;
      }
    }

    // Prompt user for new key and value
    const newKey = prompt("Enter the key:");
    if (!newKey) {
      alert("Key cannot be empty.");
      return;
    }

    const newValue = prompt("Enter the value:");
    if (newValue === null) {
      alert("Value cannot be empty.");
      return;
    }

    // Update JSON and metadata
    const keyControl = new FormControl(newKey, Validators.required);
    const valueControl = new FormControl(newValue, Validators.required);

    const parentMetadata = this.metadata[parentKey]?.nestedMetadata || {};
    parentMetadata[newKey] = { userDefined: true };

    if (!this.jsonInput[parentKey]) {
      this.jsonInput[parentKey] = {};
    }

    this.jsonInput[parentKey][newKey] = newValue;
    this.metadata[parentKey]!.nestedMetadata = parentMetadata;

    // Add controls
    this.formGroup.addControl(`${parentKey}.${newKey}_key`, keyControl);
    this.formGroup.addControl(`${parentKey}.${newKey}`, valueControl);
  }

  showPopup(content: string | undefined) {
    if (content) {
      this.popupContent = content;
    }
  }

  closePopup() {
    this.popupContent = null;
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1') // Add a space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  }
}
