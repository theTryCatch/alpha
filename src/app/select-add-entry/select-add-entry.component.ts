import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-select-add-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full max-w-xs mx-auto">
      <form [formGroup]="form" class="space-y-4">
        <div>
          <label class="label">
            <span class="label-text">Select or Add New</span>
          </label>
          <select
            formControlName="selectedOption"
            class="select select-bordered w-full"
            (change)="onOptionChange($event)"
          >
            <option *ngFor="let option of options" [value]="option">
              {{ option }}
            </option>
            <option value="__add_new__">Add New</option>
          </select>
        </div>

        <div *ngIf="showPopup" class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Add New Option</h3>
            <input
              type="text"
              formControlName="newOption"
              class="input input-bordered w-full mt-4"
              placeholder="Enter new value"
            />
            <div class="modal-action">
              <button class="btn btn-primary" (click)="onPopupSubmit()">
                Save
              </button>
              <button class="btn" (click)="closePopup()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAddEntryComponent),
      multi: true,
    },
  ],
})
export class SelectAddEntryComponent implements ControlValueAccessor {
  @Input() options: string[] = [];
  @Output() optionAdded = new EventEmitter<string>();

  form: FormGroup;
  showPopup = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      selectedOption: [''],
      newOption: [''],
    });

    this.form.get('selectedOption')?.valueChanges.subscribe((value) => {
      this.onChange(value);
      this.onTouched();
    });
  }

  writeValue(value: any): void {
    this.form.get('selectedOption')?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onOptionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.showPopup = value === '__add_new__';
    if (!this.showPopup) {
      this.form.get('newOption')?.setValue('');
    }
  }

  onPopupSubmit(): void {
    const newOption = this.form.value.newOption;
    if (newOption) {
      this.optionAdded.emit(newOption);
      this.options.push(newOption);
      this.form.get('selectedOption')?.setValue(newOption);
      this.closePopup();
    }
  }

  closePopup(): void {
    this.showPopup = false;
    this.form.get('newOption')?.setValue('');
  }
}
