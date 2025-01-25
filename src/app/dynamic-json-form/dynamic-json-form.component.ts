import { Component, Input, HostListener } from '@angular/core';
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
        <ng-container *ngIf="isArray(jsonInput[key]); else handleObjectOrPrimitive">
          <!-- Handle Arrays -->
          <div class="collapse collapse-arrow border border-base-300 rounded-box">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-lg font-medium flex justify-between items-center">
              <span (click)="$event.stopPropagation()">{{ formatKey(key) }}</span>
              <button
                *ngIf="metadata[key]?.popupMessage"
                class="btn btn-circle btn-sm"
                (click)="$event.stopPropagation(); showPopup(metadata[key]?.popupMessage || '')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                  <path
                    d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"
                  />
                </svg>
              </button>
            </div>
            <div class="collapse-content">
              <div *ngFor="let item of jsonInput[key]; let i = index" class="mb-4 border rounded p-4">
                <div class="collapse collapse-arrow border border-base-300 rounded-box">
                  <input type="checkbox" class="peer" />
                  <div class="collapse-title text-lg font-medium">
                    {{ formatKey(key) }} {{ i + 1 }}
                  </div>
                  <div class="collapse-content">
                    <app-dynamic-json-form
                      [jsonInput]="item"
                      [metadata]="metadata[key]?.nestedMetadata || {}"
                    ></app-dynamic-json-form>
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
              <label *ngIf="!isUserDefinedField(metadata[key])" class="label">
                <span class="label-text">{{ formatKey(key) }}</span>
              </label>
              <div class="relative flex items-center gap-2">
                <input
                  type="text"
                  class="input input-bordered flex-1"
                  [formControl]="getOrCreateFormControl(key)"
                  [attr.maxLength]="metadata[key]?.maxLength || null"
                  *ngIf="!isUserDefinedField(metadata[key]); else userDefinedInput"
                />
                <ng-template #userDefinedInput>
                  <input
                    type="text"
                    class="input input-bordered flex-1"
                    [formControl]="getOrCreateFormControl(key + '_key')"
                    placeholder="Enter Key"
                  />
                  <input
                    type="text"
                    class="input input-bordered flex-1"
                    [formControl]="getOrCreateFormControl(key)"
                    placeholder="Enter Value"
                  />
                </ng-template>

                <button
                  *ngIf="metadata[key]?.popupMessage"
                  class="btn btn-circle"
                  (click)="showPopup(metadata[key]?.popupMessage || '')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                    <path
                      d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"
                    />
                  </svg>
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
            <div class="collapse collapse-arrow border border-base-300 rounded-box">
              <input type="checkbox" class="peer" />
              <div class="collapse-title text-lg font-medium flex justify-between items-center">
                <span (click)="$event.stopPropagation()">{{ formatKey(key) }}</span>
                <button
                  *ngIf="metadata[key]?.popupMessage"
                  class="btn btn-circle btn-sm"
                  (click)="$event.stopPropagation(); showPopup(metadata[key]?.popupMessage || '')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                    <path
                      d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"
                    />
                  </svg>
                </button>
              </div>
              <div class="collapse-content">
                <app-dynamic-json-form
                  [jsonInput]="jsonInput[key]"
                  [metadata]="metadata[key]?.nestedMetadata || {}"
                ></app-dynamic-json-form>
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
export class DynamicJsonFormComponent {
  @Input() jsonInput: any = {};
  @Input() metadata: Metadata = {};

  formGroup: FormGroup = new FormGroup({});
  popupContent: string | null = null;

  constructor(private fb: FormBuilder) { }

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

      // Determine if the current or parent level is userDefined
      const isUserDefined = this.isUserDefinedField(fieldMetadata) || this.isUserDefinedField(metadata);
      console.log(`Processing key: ${fullKey}, isUserDefined: ${isUserDefined}`);

      if (this.isArray(jsonObject[key])) {
        jsonObject[key].forEach((item: any, index: number) => {
          const arrayMetadata = fieldMetadata['nestedMetadata'] || {};
          this.createFormControls(item, arrayMetadata, `${fullKey}[${index}]`);
        });
      } else if (this.isObject(jsonObject[key])) {
        const nestedMetadata = fieldMetadata['nestedMetadata'] || {};
        this.createFormControls(
          jsonObject[key],
          isUserDefined ? this.markMetadataUserDefined(nestedMetadata) : nestedMetadata,
          fullKey
        );
      } else {
        const validators = [];
        if (fieldMetadata['required']) validators.push(Validators.required);
        if (fieldMetadata['maxLength']) validators.push(Validators.maxLength(fieldMetadata['maxLength']));

        if (isUserDefined) {
          // Create editable key-value pair for userDefined fields
          console.log(`Adding userDefined control for key: ${fullKey}`);
          this.formGroup.addControl(fullKey + '_key', new FormControl(key, validators));
          this.formGroup.addControl(fullKey, new FormControl(jsonObject[key] ?? '', validators));
        } else {
          // Standard form control
          console.log(`Adding standard control for key: ${fullKey}`);
          this.formGroup.addControl(fullKey, new FormControl(jsonObject[key] ?? '', validators));
        }
      }
    });
  }

  markMetadataUserDefined(metadata: Metadata): Metadata {
    const updatedMetadata: Metadata = {};
    Object.keys(metadata).forEach((key) => {
      updatedMetadata[key] = {
        ...metadata[key],
        userDefined: true,
        nestedMetadata: metadata[key]?.nestedMetadata
          ? this.markMetadataUserDefined(metadata[key]?.nestedMetadata)
          : undefined,
      };
      console.log(`Marked metadata for key: ${key} as userDefined`);
    });
    return updatedMetadata;
  }

  isUserDefinedField(metadataField: any): boolean {
    const isUserDefined = metadataField && typeof metadataField === 'object' && metadataField['userDefined'] === true;
    console.log(`isUserDefinedField check: ${isUserDefined}`);
    return isUserDefined;
  }

  getOrCreateFormControl(key: string): FormControl {
    let control = this.formGroup.get(key) as FormControl;

    if (!control) {
      control = new FormControl('');
      this.formGroup.addControl(key, control);
    }
    return control;
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

  showPopup(content: string | undefined) {
    if (content) {
      this.popupContent = content;
    }
  }

  closePopup() {
    this.popupContent = null;
  }

  formatKey(key: string): string {
    return key;
  }
}