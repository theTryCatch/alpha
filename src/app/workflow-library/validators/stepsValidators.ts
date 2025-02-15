import { ValidatorFn, AbstractControl, ValidationErrors, FormArray, FormControl } from "@angular/forms";
import { WorkflowStepActionType, WorkflowStepCommandType, WorkflowStepExecutionType, WorkflowStepRuntimeType } from "../interfaces";

export function isValidExecutionType(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        
        const formControl = control as FormControl;
        const valuation = Object.values(WorkflowStepExecutionType).includes(formControl.value);
        if(!valuation) {
            return { InvalidExecutionType: "Provided step execution type '"+formControl.value+"' is invalid." };
        }
        return null;
    };
}
export function isValidCommandType(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        
        const formControl = control as FormControl;
        const valuation = Object.values(WorkflowStepCommandType).includes(formControl.value);
        if(!valuation) {
            return { InvalidCommandType: "Provided step command type '"+formControl.value+"' is invalid." };
        }
        return null;
    };
}
export function isValidRuntime(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        
        const formControl = control as FormControl;
        const valuation = Object.values(WorkflowStepRuntimeType).includes(formControl.value);
        if(!valuation) {
            return { InvalidRuntimeType: "Provided step runtime type '"+formControl.value+"' is invalid." };
        }
        return null;
    };
}
export function isValidActionType(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const formControl = control as FormControl;
        const valuation = Object.values(WorkflowStepActionType).includes(formControl.value);
        if(!valuation) {
            return { InvalidActionType: "Provided step action type '"+formControl.value+"' is invalid." };
        }
        return null;
    };
}