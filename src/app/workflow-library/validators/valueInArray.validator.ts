import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

export function valueInArrayValidator(stepNames$: BehaviorSubject<string[]>, excludeStepNames?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const stepNames = stepNames$.getValue().filter(i => i !== excludeStepNames); // ✅ Get latest step names
    if (!control.value || stepNames.includes(control.value)) {
      return null; // ✅ Valid: Step exists in the list
    }
    return { valueNotAllowed: { allowedList: stepNames } }; // ❌ Invalid step reference
  };
}