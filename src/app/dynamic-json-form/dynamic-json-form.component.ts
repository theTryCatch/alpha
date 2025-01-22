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
        <ng-container *ngIf="isArray(jsonInput[key]); else handleObjectOrPrimitive">
          <div class="collapse collapse-arrow border border-base-300 rounded-box">
            <input type="checkbox" class="peer" />
            <div class="collapse-title text-lg font-medium">
              {{ formatKey(key) }}
            </div>
            <div class="collapse-content">
              <div *ngFor="let item of jsonInput[key]; let i = index" class="mb-4 border rounded p-4">
                <app-dynamic-json-form
                  [jsonInput]="item"
                  [metadata]="metadata[key]?.nestedMetadata || {}"
                ></app-dynamic-json-form>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #handleObjectOrPrimitive>
          <ng-container *ngIf="!isObject(jsonInput[key]); else nestedObject">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ formatKey(key) }}</span>
              </label>
              <input
                type="text"
                class="input input-bordered"
                [formControlName]="key"
              />
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
                  [metadata]="metadata[key]?.nestedMetadata || {}"
                ></app-dynamic-json-form>
              </div>
            </div>
          </ng-template>
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

      if (this.isArray(jsonObject[key])) {
        jsonObject[key].forEach((item: any, index: number) => {
          const arrayMetadata = fieldMetadata?.nestedMetadata || {};
          this.createFormControls(item, arrayMetadata, `${fullKey}[${index}]`);
        });
      } else if (this.isObject(jsonObject[key])) {
        this.createFormControls(jsonObject[key], fieldMetadata?.nestedMetadata || {}, fullKey);
      } else {
        const validators = [];
        if (fieldMetadata?.required) validators.push(Validators.required);
        if (fieldMetadata?.maxLength) validators.push(Validators.maxLength(fieldMetadata.maxLength));
        this.formGroup.addControl(fullKey, new FormControl(jsonObject[key] ?? '', validators));
      }
    });
  }

  inheritUserDefined(metadata: Metadata | undefined): Metadata {
    if (!metadata) return {}; 

    const newMetadata: Metadata = {};
    Object.keys(metadata).forEach((key) => {
      const current = metadata[key];
      newMetadata[key] = {
        ...current,
        userDefined: current?.userDefined ?? true,
        nestedMetadata: this.inheritUserDefined(current?.nestedMetadata),
      };
    });
    return newMetadata;
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

  showPopup(content: string | undefined) {
    if (content) {
      this.popupContent = content;
    }
  }

  closePopup() {
    this.popupContent = null;
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }
}