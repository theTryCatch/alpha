import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

export function valueInArrayValidator(list$: BehaviorSubject<string[]>): ValidatorFn {
  return (control: AbstractControl) => {
      const validValues = list$.getValue(); // Get current step names
      if (control.value && !validValues.includes(control.value)) {
          return { valueNotAllowed: { allowedList: validValues, actual: control.value } };
      }
      return null;
  };
}