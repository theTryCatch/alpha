import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { jsonValidator } from '../workflow-library/validators/json.validator';
import { valueInArrayValidator } from '../workflow-library/validators/valueInArray.validator';
import { IWorkflowManifest, WorkflowStepCommandType, WorkflowStepRuntimeType, WorkflowStepActionType, IWorkflowManifestFormGroup, IStringOfAny, IWorkflowStepForm, IWorkflowStep, IEnvironmentForm, IVersionRangeForm, IActionHandlerForm, WorkflowStepExecutionType } from '../workflow-library/interfaces';
import { isValidActionType, isValidCommandType, isValidExecutionType, isValidRuntime } from '../workflow-library/validators/stepsValidators';

@Component({
    selector: 'workflow',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: "./workflow.component.html",
    styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild('globalsTextarea') globalsTextarea!: ElementRef<HTMLTextAreaElement>;
    @Input() workflow?: any;

    stepNames = new BehaviorSubject<string[]>([]);
    executionTypes = Object.values(WorkflowStepExecutionType);
    commandTypes = Object.values(WorkflowStepCommandType);
    runtimeTypes = Object.values(WorkflowStepRuntimeType);
    actionTypes = Object.values(WorkflowStepActionType);
    workflowStepActionType = WorkflowStepActionType.workflowStep;
    reservedAction_ActionType = WorkflowStepActionType.reservedAction;
    listOfReservedActions = new BehaviorSubject<string[]>(['AbortWorkflow', 'NotifyFailure', 'NotifySuccess', 'NotifyTimeout']);
    workflow_fg!: FormGroup<IWorkflowManifestFormGroup>;

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.initializeForm();
        this.populateForm(this.workflow);
    }
    ngAfterViewInit(): void {
        this.adjustGlobalsHeight();
    }
    getStepReferences(stepName: string | null | undefined): { step: string, path: string, key: string }[] {
        if (!stepName) return [];

        const references: { step: string, path: string, key: string }[] = [];
        this.steps.controls.forEach((step, index) => {
            const stepDisplayName: { step: string, path: string, key: string } = { step: `Step ${index + 1}`, path: `${step.get('name')?.value || 'Unnamed Step'}`, key: "" };
            const handlers = ['onSuccessSequential', 'onUnsuccessSequential', 'onError', 'onTimeout'];

            handlers.forEach(handlerKey => {
                const actionHandlerGroup = step.get(handlerKey) as FormGroup<IActionHandlerForm>;
                if (actionHandlerGroup) {
                    const stepControl = actionHandlerGroup.get('step');
                    if (stepControl && stepControl.value === stepName) {
                        stepDisplayName.key = handlerKey;
                        references.push(stepDisplayName);
                    }
                }
            });
        });

        return references;
    }

    adjustGlobalsHeight(): void {
        if (this.globalsTextarea) {
            this.globalsTextarea.nativeElement.style.height = 'auto';
            this.globalsTextarea.nativeElement.style.height = `${this.globalsTextarea.nativeElement.scrollHeight}px`;
        }

        try {
            // Get the globals form control
            const globalsControl = this.workflow_fg.get('globals') as FormControl<string | null>;

            if (globalsControl && globalsControl.value) {
                // Ensure valid JSON before parsing
                const parsedGlobals = JSON.parse(globalsControl.value);

                // Format the JSON with indentation (pretty print)
                globalsControl.setValue(JSON.stringify(parsedGlobals, null, 2), { emitEvent: false });
            }
        } catch (e) {
            // Do nothing, let the validator handle invalid JSON
        }
    }
    private initializeForm(): void {
        this.workflow_fg = this.fb.group<IWorkflowManifestFormGroup>({
            name: this.fb.control('', {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.pattern(/^[a-zA-Z0-9_]+$/),
                    Validators.minLength(3),
                    Validators.maxLength(50),
                ],
            }),
            description: this.fb.control('', {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(500),
                ],
            }),
            workflowOwningGroup: this.fb.control('', {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.pattern(/^[a-zA-Z0-9_]+$/),
                    Validators.minLength(3),
                ],
            }),
            emailAddress: this.fb.control('', {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.email,
                    Validators.pattern(/@(ms|morganstanley)\.com$/),
                ],
            }),
            globals: this.fb.control<string | null>(null, {
                nonNullable: true,
                validators: [jsonValidator],
            }),
            steps: this.fb.array<FormGroup<IWorkflowStepForm>>([], { validators: [minArrayLengthValidator(2)] }),
        });
        this.trackStepNames();
    }
    private trackStepNames(): void {
        this.steps.valueChanges.subscribe(() => {
            const names = this.steps.controls.map(step => step.get('name')?.value || '');
            this.stepNames.next(names);

            this.steps.controls.forEach(stepGroup => {
                const handlers = ['onSuccessSequential', 'onUnsuccessSequential', 'onError', 'onTimeout'];
                handlers.forEach(handlerKey => {
                    const actionHandlerGroup = stepGroup.get(handlerKey) as FormGroup<IActionHandlerForm>;
                    if (actionHandlerGroup) {
                        const stepControl = actionHandlerGroup.get('step');
                        if (stepControl) {
                            stepControl.updateValueAndValidity({ emitEvent: false });
                        }
                    }
                });
            });
        });
    }

    private populateForm(workflowData?: IWorkflowManifest): void {
        if (!workflowData) {
            return; // No data to populate
        }

        this.workflow_fg.patchValue({
            name: workflowData.name,
            description: workflowData.description,
            workflowOwningGroup: workflowData.workflowOwningGroup,
            emailAddress: workflowData.emailAddress,
        });

        if (workflowData.globals) {
            const formattedGlobals = JSON.stringify(workflowData.globals, null, 2);
            this.workflow_fg.get('globals')?.setValue(formattedGlobals, { emitEvent: false });
        } else {
            this.workflow_fg.get('globals')?.setValue(null, { emitEvent: false });
        }

        const stepsArray = this.workflow_fg.get('steps') as FormArray;
        stepsArray.clear(); // Clear existing steps before adding new ones

        workflowData.steps.forEach((step) => {
            const stepGroup = this.createStepFormGroup(step);
            stepsArray.push(stepGroup);
        });

        // Force Validation for Initial Load
        this.workflow_fg.markAllAsTouched();
        this.workflow_fg.updateValueAndValidity();
    }

    private createStepFormGroup(step?: IWorkflowStep): FormGroup<IWorkflowStepForm> {
        const stepGroup = this.fb.group<IWorkflowStepForm>({
            name: this.fb.control(step?.name ?? '', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.minLength(3), Validators.maxLength(50)] }),
            description: this.fb.control(step?.description ?? '', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)] }),
            executionType: this.fb.control(step?.executionType ?? WorkflowStepExecutionType.sequential, { nonNullable: true, validators: [isValidExecutionType()] }),
            outputVariable: this.fb.control(step?.outputVariable ?? '', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)] }),
            successCriteria: this.fb.control(step?.successCriteria ?? '', { nonNullable: true, validators: [Validators.required] }),
            timeout: this.fb.control(step?.timeout ?? 30, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
            environment: this.fb.group<IEnvironmentForm>({
                commandType: this.fb.control(step?.environment?.commandType ?? WorkflowStepCommandType.script, { nonNullable: true, validators: [Validators.required, isValidCommandType()] }),
                runtime: this.fb.control(step?.environment?.runtime ?? WorkflowStepRuntimeType.PowerShell, { nonNullable: true, validators: [Validators.required, isValidRuntime()] }),
                command: this.fb.control(step?.environment?.command ?? '', { nonNullable: true, validators: [Validators.required] }),
                inputparams: this.fb.control<string | null>(step?.environment?.inputparams ? step.environment.inputparams : null),
                outputparams: this.fb.control<string | null>(step?.environment?.outputparams ? step.environment.outputparams : null),
            }),

            onSuccessSequential: this.createActionHandlerForm("onSuccessSequential", step),
            onUnsuccessSequential: this.createActionHandlerForm("onUnsuccessSequential", step),
            onError: this.createActionHandlerForm("onError", step),
            onTimeout: this.createActionHandlerForm("onTimeout", step),

            versionRange: this.fb.group<IVersionRangeForm>({
                lowestVersion: this.fb.control(step?.versionRange?.lowestVersion ?? '', { nonNullable: true, validators: [Validators.required] }),
                highestVersion: this.fb.control(step?.versionRange?.highestVersion ?? '', { nonNullable: true, validators: [Validators.required] }),
            }),
            wikiLink: this.fb.control(step?.wikiLink ?? '', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w.-]+\.)?(ms\.com|morganstanley\.com)(\/.*)?$/)] }),
        });

        stepGroup.get('name')?.valueChanges.subscribe(() => this.trackStepNames());

        return stepGroup;
    }
    getFilteredStepNames(currentStepName: string): Observable<string[]> {
        return this.stepNames.pipe(
            map((stepNames) => stepNames.filter((name) => name && name !== currentStepName))
        );
    }
    createActionHandlerForm(
        actionTypeKey: "onSuccessSequential" | "onUnsuccessSequential" | "onError" | "onTimeout",
        step?: IWorkflowStep
    ): FormGroup<IActionHandlerForm> {
        const actionData = step ? step[actionTypeKey] : null;

        const actionTypeControl = this.fb.control(actionData?.actionType ?? WorkflowStepActionType.workflowStep, {
            nonNullable: true,
            validators: [Validators.required, isValidActionType()],
        });

        const stepControl = this.fb.control<string | null>(
            actionData?.step ?? null
        );

        const triggerControl = this.fb.control<string | null>(actionData?.trigger ?? null);
        const inputValueControl = this.fb.control<string | null>(actionData?.inputValue ?? null);

        // Apply Correct Validation Rules Immediately
        this.applyActionTypeValidation(
            actionTypeControl.value,
            stepControl,
            triggerControl,
            inputValueControl,
            step?.name // Pass the step's own name to exclude it from the allowed values
        );

        actionTypeControl.valueChanges.subscribe((value) => {
            this.applyActionTypeValidation(value, stepControl, triggerControl, inputValueControl, step?.name);
        });

        return this.fb.group<IActionHandlerForm>({
            actionType: actionTypeControl,
            step: stepControl,
            trigger: triggerControl,
            inputValue: inputValueControl,
        });
    }
    private applyActionTypeValidation(
        actionType: WorkflowStepActionType,
        stepControl: FormControl<string | null>,
        triggerControl: FormControl<string | null>,
        inputValueControl: FormControl<string | null>,
        currentStepName?: string // New: Pass current step name to exclude it from allowed values
    ): void {
        if (actionType === WorkflowStepActionType.workflowStep) {
            // Step must be in the list of step names excluding itself
            stepControl.setValidators([
                Validators.required,
                valueInArrayValidator(this.stepNames, currentStepName), // Ensures value is in the list excluding itself
            ]);
            triggerControl.clearValidators();
            inputValueControl.clearValidators();
        } else if (actionType === WorkflowStepActionType.reservedAction) {
            stepControl.clearValidators();
            triggerControl.setValidators([Validators.required]);
            inputValueControl.setValidators([Validators.required]);
        } else {
            console.log(actionType);
            stepControl.clearValidators();
            triggerControl.clearValidators();
            inputValueControl.clearValidators();
        }

        stepControl.updateValueAndValidity();
        triggerControl.updateValueAndValidity();
        inputValueControl.updateValueAndValidity();
    }


    get steps(): FormArray<FormGroup<IWorkflowStepForm>> {
        return this.workflow_fg.get('steps') as FormArray<FormGroup<IWorkflowStepForm>>;
    }
    onSubmit() {
        if (this.workflow_fg.invalid) {
            this.workflow_fg.markAllAsTouched();
            this.workflow_fg.updateValueAndValidity();
            return;
        }
    }

    collectAllErrors() {
        return collectAllErrors(this.workflow_fg);
    }
    addStep(): void {
        this.steps.push(this.createStepFormGroup());
        this.trackStepNames();
    }
    removeStep(index: number): void {
        this.steps.removeAt(index);
        this.trackStepNames();
    }
}
function collectAllErrors(control: AbstractControl, path: string = ''): Record<string, any> {
    const errors: Record<string, any> = {};

    // Capture errors directly on the control (important for FormArray validation!)
    if (control.errors) {
        errors[path] = control.errors;
    }

    if (control instanceof FormGroup) {
        for (const key in control.controls) {
            if (control.controls.hasOwnProperty(key)) {
                const controlPath = path ? `${path}.${key}` : key;
                Object.assign(errors, collectAllErrors(control.controls[key], controlPath));
            }
        }
    } else if (control instanceof FormArray) {
        control.controls.forEach((childControl, index) => {
            const arrayPath = path ? `${path}[${index + 1}]` : `${index + 1}`;
            Object.assign(errors, collectAllErrors(childControl, arrayPath));
        });
    }

    return errors;
}

function minArrayLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control instanceof FormArray && control.length < minLength) {
            return { minArrayLength: { requiredLength: minLength, actualLength: control.length } };
        }
        return null;
    };
}
