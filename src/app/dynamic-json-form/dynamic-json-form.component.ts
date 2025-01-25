import {
  Component,
  Input,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
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
        readOnly?: boolean;
        type?: 'text' | 'number' | 'date' | 'boolean';
      }
    | undefined;
}

@Component({
  selector: 'app-dynamic-json-form',
  standalone: true,
  template: `
    <form [formGroup]="formGroup" class="p-4 space-y-4">
      <ng-container *ngFor="let key of objectKeys(jsonInput)">
        <ng-container *ngIf="isArray(jsonInput[key]); else handleObjectOrPrimitive">
          <!-- Handle Arrays -->
          <div class="collapse-open collapse-arrow border border-base-300 rounded-box">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-lg font-medium flex justify-between items-center">
              <span (click)="$event.stopPropagation()">{{ formatKey(key) }}</span>
              <button
                *ngIf="metadata[key]?.popupMessage"
                class="btn btn-circle btn-sm"
                (click)="$event.stopPropagation(); showPopup(metadata[key]?.popupMessage || '')"
              >
                ? apple
              </button>
            </div>
            <div class="collapse-content">
              <div
                *ngFor="let item of jsonInput[key]; let i = index"
                class="mb-4 border rounded p-4"
              >
                <div class="collapse-open collapse-arrow border border-base-300 rounded-box">
                  <input type="checkbox" class="peer" />
                  <div class="collapse-title text-lg font-medium">
                    {{ formatKey(key) }} {{ i + 1 }}
                  </div>
                  <div class="collapse-content">
                    <app-dynamic-json-form
                      [jsonInput]="item"
                      [metadata]="metadata[key]?.nestedMetadata || {}"
                    ></app-dynamic-json-form> Nearest parent's parent
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Handle Primitives and Nested Objects -->
        <ng-template #handleObjectOrPrimitive>
          <ng-container *ngIf="!isObject(jsonInput[key]); else nestedObject">
            <!-- Primitive Value -->
            <div class="form-control">
              <label *ngIf="!isUserDefinedField(metadata, key)" class="label">
                <span class="label-text">{{ formatKey(key) }}</span> Absolute control level - {{key}} - {{findParentOfKey(key, jsonInput) | json}}
              </label>
              <div class="relative flex items-center gap-2">
                <ng-container *ngIf="isUserDefinedField(metadata, key); else standardInput">
                  <!-- User-Defined Input -->
                  <input
                    type="text"
                    class="input input-bordered flex-1"
                    [formControl]="getOrCreateFormControl(key + '_key')"
                    placeholder="Enter Key"
                    [value]="key"
                  />
                  <input
                    type="text"
                    class="input input-bordered flex-1"
                    [formControl]="getOrCreateFormControl(key)"
                    placeholder="Enter Value"
                  />
                </ng-container>
                <ng-template #standardInput>
                  <input
                    [type]="metadata[key]?.type || 'text'"
                    class="input input-bordered flex-1"
                    [formControl]="getOrCreateFormControl(key)"
                    [attr.maxLength]="metadata[key]?.maxLength || null"
                    [readonly]="metadata[key]?.readOnly || null"
                  />
                </ng-template>

                <button
                  *ngIf="metadata[key]?.popupMessage"
                  class="btn btn-circle"
                  (click)="showPopup(metadata[key]?.popupMessage || '')"
                >
                  ?
                </button>
              </div>
              <div *ngIf="metadata[key]?.helpMessage" class="text-sm text-gray-500 mt-1">
                {{ metadata[key]?.helpMessage }}
              </div>
              <div *ngIf="formGroup.get(key)?.hasError('required') && formGroup.get(key)?.touched" class="text-red-500 text-sm">
                This field is required.
              </div>
            </div>
          </ng-container>

          <!-- Nested Object -->
          <ng-template #nestedObject>
            <div class="collapse-open collapse-arrow border border-base-300 rounded-box">
              <input type="checkbox" class="peer" />
              <div class="collapse-title text-lg font-medium flex justify-between items-center">
                <span (click)="$event.stopPropagation()">{{ formatKey(key) }}</span>
                <button
                  *ngIf="metadata[key]?.popupMessage"
                  class="btn btn-circle btn-sm"
                  (click)="$event.stopPropagation(); showPopup(metadata[key]?.popupMessage || '')"
                >
                  ?
                </button>
              </div>
              <div class="collapse-content">
                <app-dynamic-json-form
                  [jsonInput]="jsonInput[key]"
                  [metadata]="metadata[key]?.nestedMetadata || {}"
                ></app-dynamic-json-form>Nearest parent - {{key}}
              </div>
            </div>
          </ng-template>
        </ng-template>
      </ng-container>
    </form>

    <!-- Popup Content -->
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
export class DynamicJsonFormComponent implements OnInit {
  @Input() jsonInput: any = {};
  @Input() metadata: Metadata = {};

  formGroup: FormGroup = new FormGroup({});
  popupContent: string | null = null;


  constructor(private fb: FormBuilder) {}

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    this.closePopup();
  }

  ngOnInit() {
    this.createFormControls(this.jsonInput, this.metadata);
  }

  createFormControls(jsonObject: any, metadata: Metadata, parentKey: string = '') {
    Object.keys(jsonObject).forEach((key) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const fieldMetadata = metadata[key] || {};

      if (this.isArray(jsonObject[key])) {
        jsonObject[key].forEach((item: any, index: number) => {
          const arrayMetadata = fieldMetadata['nestedMetadata'] || {};
          this.createFormControls(item, arrayMetadata, `${fullKey}[${index}]`);
        });
      } else if (this.isObject(jsonObject[key])) {
        const nestedMetadata = fieldMetadata['nestedMetadata'] || {};
        this.createFormControls(jsonObject[key], nestedMetadata, fullKey);
      } else {
        const validators = [];
        if (fieldMetadata['required']) validators.push(Validators.required);
        if (fieldMetadata['maxLength']) validators.push(Validators.maxLength(fieldMetadata['maxLength']));

        if (this.isUserDefinedField(metadata, key)) {
          this.formGroup.addControl(fullKey + '_key', new FormControl(key, validators));
          this.formGroup.addControl(fullKey, new FormControl(jsonObject[key] ?? '', validators));
        } else {
          this.formGroup.addControl(fullKey, new FormControl(jsonObject[key] ?? '', validators));
        }
      }
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  getOrCreateFormControl(key: string): FormControl {
    let control = this.formGroup.get(key) as FormControl;

    if (!control) {
      control = new FormControl('');
      this.formGroup.addControl(key, control);
    }
    return control;
  }

  showPopup(content: string | undefined) {
    if (content) {
      this.popupContent = content;
    }
  }

  closePopup() {
    this.popupContent = null;
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\./g, ' > ');
  }

  isUserDefinedField(metadataField: any, parentKey?: string, currentKey?: string): boolean {
    console.log(metadataField, 'sa',parentKey, 'ga', currentKey);
    
    // Check if current field is explicitly marked as userDefined
    if (metadataField?.userDefined === true) {
      return true;
    }
  
    // If parentKey exists, find the parent's metadata
    if (parentKey) {
      
      const parentMetadata = this.metadata[parentKey];
      if (parentMetadata?.userDefined === true) {
        return true;
      }
  
      // If nestedMetadata exists for the parent, look deeper
      if (parentMetadata?.nestedMetadata && currentKey) {
        const immediateParentMetadata = parentMetadata.nestedMetadata[currentKey];
        if (immediateParentMetadata?.userDefined === true) {
          return true;
        }
      }
    }
  
    // Default to false if no userDefined flag is found
    return false;
  }  
  findParentOfKey(keyToFind: string, jsonInput: any): any | null {
    // Recursive helper function to search for the key's parent
    function recursiveSearch(obj: any, parent: any = null): any | null {
      if (typeof obj !== 'object' || obj === null) {
        return null; // Skip non-object types
      }
  
      for (const key in obj) {
        const value = obj[key];
  
        // If the key is found, return the parent
        if (key === keyToFind) {
          return parent;
        }
  
        // If the value is an array, search each element
        if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'object' && item !== null) {
              const found = recursiveSearch(item, obj);
              if (found) {
                return found;
              }
            }
          }
        }
  
        // If the value is a nested object, search it
        if (typeof value === 'object' && value !== null) {
          const found = recursiveSearch(value, obj);
          if (found) {
            return found;
          }
        }
      }
  
      return null; // Key not found in this branch
    }
  
    return recursiveSearch(jsonInput);
  }
  
}