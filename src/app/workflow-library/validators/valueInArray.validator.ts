import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BehaviorSubject, map, Observable } from "rxjs";

export function valueInArrayValidator(allowedValue: BehaviorSubject<string[]>, excludeValue: string[]): ValidatorFn {

  const allowedList: string[] = allowedValue.value;
  // allowedValue.subscribe((items: string[]) => {
  //   items.forEach((item: string) => {
  //     allowedList.push(item);
  //   });
  // });

  return (control: AbstractControl) => {
    if (allowedList.indexOf(control.value) === -1) {
      if (!control.value) {
        return null; // Don't validate empty values (use Validators.required for this)
      }
    }

    const isValid = allowedList.includes(control.value) && !excludeValue.includes(control.value);

    return isValid ? null : { valueNotAllowed: { value: control.value, allowedList } };
  };
};
