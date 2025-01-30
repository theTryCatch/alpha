import { ValidatorFn, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";

export function atLeastOneValidStepValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const stepsArray = control as FormArray;
        if (!stepsArray || stepsArray.length === 0) {
            return { atLeastOneStep: 'At least one step is required.' };
        }

        // Check if at least one step is valid
        const hasValidStep = stepsArray.controls.some(step => step.valid);
        return hasValidStep ? null : { atLeastOneStep: 'At least one valid step is required.' };
    };
}