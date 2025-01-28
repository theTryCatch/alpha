import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator function to check if a string is a valid JSON
export function jsonValidator(control: AbstractControl): ValidationErrors | null {
  try {
    let parsedJson = "";
    if(control.value === null || control.value === undefined || control.value === ''){
      return null;
    } else if(typeof control.value === 'string'){
      parsedJson = JSON.parse(control.value);
    } else {
      parsedJson = JSON.parse(JSON.stringify(control.value));
    }
    if (typeof parsedJson === 'object' && !Array.isArray(parsedJson)) {
      const keys = Object.keys(parsedJson);
      const invalidKeys = keys.filter(key => typeof key !== 'string');
      if (invalidKeys.length > 0) {
        return { invalidJson: true }; // invalid JSON keys
      }
    } else {
      return { invalidJson: true }; // invalid JSON
    }
    return null; // valid JSON
  } catch (e) {
    return { invalidJson: true }; // invalid JSON
  }
}
