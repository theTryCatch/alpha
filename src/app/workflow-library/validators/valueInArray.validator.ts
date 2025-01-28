import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

export function valueInArrayValidator(allowedValue: BehaviorSubject<string[]>, excludeValue: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const allowedList = allowedValue.getValue(); // Get the latest allowed list

    if (!control.value) {
      return null; // Don't validate empty values (use Validators.required for this)
    }

    const isValid = allowedList.includes(control.value) && !excludeValue.includes(control.value);

    return isValid ? null : { valueNotAllowed: { value: control.value, allowedList } };
  };
}
