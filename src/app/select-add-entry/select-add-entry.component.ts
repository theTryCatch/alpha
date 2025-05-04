import {
  Component, Input, Output, EventEmitter, forwardRef, OnInit
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup,
  ReactiveFormsModule, AbstractControl, ValidationErrors, Validator, NG_VALIDATORS
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-add-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAddEntryComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectAddEntryComponent),
      multi: true
    }
  ],
  template: `
    <form [formGroup]="form">
        <div class="relative">
          <input
            type="text"
            formControlName="search"
            class="input input-bordered w-full pr-10"
            [placeholder]="placeholder"
            [disabled]="form.disabled"
            (focus)="onTouched()"
            (input)="onTouched()"
            (blur)="onBlur()"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div *ngIf="form.get('search')?.hasError('invalidOption') && form.get('search')?.touched"
             class="text-red-500 text-sm mt-1">
          Please select a valid option from the list.
        </div>

        <ul *ngIf="showDropdown"
            class="absolute z-10 w-full mt-1 max-h-60 overflow-auto border rounded shadow bg-base-100 border-base-300">
          <li
            *ngFor="let option of filteredOptions"
            (mousedown)="selectOption(option)"
            [ngClass]="{
              'font-bold text-base-content': isSelected(option),
              'text-base-content': !isSelected(option)
            }"
            class="px-4 py-2 flex justify-between items-center hover:bg-base-200 cursor-pointer"
          >
            <span>{{ option }}</span>
          </li>

          <li *ngIf="canAddNew"
              (mousedown)="triggerAddNew()"
              class="px-4 py-2 text-primary hover:bg-base-200 cursor-pointer">
            ➕ Add "{{ form.value.search }}"
          </li>
        </ul>
    </form>

    <div *ngIf="showPopup"
          class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded shadow-lg w-80">
        <h3 class="font-bold text-lg mb-4">Add New Option</h3>
        <p class="mb-2 break-words whitespace-normal">
          Are you sure you want to add
          <span class="font-semibold text-neutral break-words">
            "{{ form.value.search }}"
          </span>?
        </p>
        <div class="flex justify-end space-x-2 mt-4">
          <button class="btn btn-outline" type="button" (click)="closePopup()">Cancel</button>
          <button class="btn btn-primary" type="button" (click)="onPopupSubmit()">Add</button>
        </div>
      </div>
    </div>
  `
})
export class SelectAddEntryComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() set options(value: string[]) {
    this._options = value || [];
    this._optionsInitialized = true;
    this.validateIfReady();
    this.onValidatorChange();
  }

  @Input() get placeholder(): string {
    return this.canAddNewItem ? 'Type to search or add' : 'Type to search';
  }
  set placeholder(value: string) {
    this._placeholder = value;
  }
  @Input() filterOnSearch: boolean = false;
  @Input({ required: true }) canAddNewItem: boolean = false;

  @Output() optionAdded = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<string>();
  @Output() dropdownOpened = new EventEmitter<void>();
  @Output() dropdownClosed = new EventEmitter<void>();
  @Output() popupOpened = new EventEmitter<void>();
  @Output() popupClosed = new EventEmitter<void>();

  form!: FormGroup;
  showDropdown = false;
  showPopup = false;

  private _placeholder: string = 'Type to search';
  private _options: string[] = [];
  private _initialValue: any = null;
  private _optionsInitialized = false;
  private _valueInitialized = false;

  private onChange: (value: any) => void = () => { };
  private onTouchedCallback: () => void = () => { };
  private onValidatorChange: () => void = () => { };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      search: ['', this.validateOption.bind(this)]
    });

    this.form.get('search')?.valueChanges.subscribe(val => {
      this.onChange(val);
      this.form.get('search')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  get filteredOptions(): string[] {
    const query = this.form.value.search?.toLowerCase() || '';
    return this.filterOnSearch && query
      ? this._options.filter(opt => opt.toLowerCase().includes(query))
      : this._options;
  }

  get canAddNew(): boolean {
    if (!this.canAddNewItem) return false;
    const value = this.form.value.search?.trim();
    return !!value && !this._options.includes(value);
  }

  writeValue(value: any): void {
    this._initialValue = value ?? '';
    this._valueInitialized = true;
    this.form.get('search')?.setValue(this._initialValue, { emitEvent: false });
    this.validateIfReady();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.form.disable({ emitEvent: false })
      : this.form.enable({ emitEvent: false });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.form.get('search')?.errors || null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  validateOption(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();
    return !value || this._options.includes(value) ? null : { invalidOption: true };
  }

  onTouched(): void {
    this.onTouchedCallback();
    this.showDropdown = true;
    this.dropdownOpened.emit();
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;
      this.dropdownClosed.emit();
    }, 150);
  }

  selectOption(option: string): void {
    this.form.get('search')?.setValue(option, { emitEvent: false });
    this.onChange(option);
    this.showDropdown = false;
    this.optionSelected.emit(option);
  }

  triggerAddNew(): void {
    this.showPopup = true;
    this.showDropdown = false;
    this.popupOpened.emit();
  }

  onPopupSubmit(): void {
    const newOption = this.form.value.search?.trim();
    if (newOption && !this._options.includes(newOption)) {
      this._options.push(newOption);
      this.optionAdded.emit(newOption);
      this.form.get('search')?.setValue(newOption, { emitEvent: false });
      this.onChange(newOption);
    }
    this.closePopup();
  }

  closePopup(): void {
    this.showPopup = false;
    this.popupClosed.emit();
  }

  isSelected(option: string): boolean {
    return this.form.get('search')?.value?.trim() === option;
  }

  private validateIfReady(): void {
    if (this._valueInitialized && this._optionsInitialized && this.form) {
      const control = this.form.get('search');
      control?.setValue(this._initialValue, { emitEvent: false });
      control?.markAsTouched();
      control?.updateValueAndValidity({ emitEvent: false });
    }
  }
}
