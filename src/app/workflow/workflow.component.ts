import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IWorkflowManifest, IWorkflowStep, WorkflowStepActionType, WorkflowStepCommandType, WorkflowStepExecutionType, WorkflowStepRuntimeType } from '../workflow-library/interfaces';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { jsonValidator } from '../workflow-library/validators/json.validator';
import { valueInArrayValidator } from '../workflow-library/validators/valueInArray.validator';

@Component({
    selector: 'workflow',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './workflow.component.html',
    styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit {
    @ViewChild('globalsTextarea') globalsTextarea!: ElementRef<HTMLTextAreaElement>;
    @Input({ required: true }) workflow!: IWorkflowManifest;

    executionTypes = Object.values(WorkflowStepExecutionType);
    commandTypes = Object.values(WorkflowStepCommandType);
    runtimeTypes = Object.values(WorkflowStepRuntimeType);
    actionTypes = Object.values(WorkflowStepActionType);
    workflowStepActionType = WorkflowStepActionType.workflowStep;
    reservedAction_ActionType = WorkflowStepActionType.reservedAction;
    listOfReservedActions = new BehaviorSubject<string[]>(["AbortWorkflow", "NotifyFailure", "NotifySuccess", "NotifyTimeout"]);
    workflow_fg: FormGroup;
    stepNames = new BehaviorSubject<string[]>([]);

    constructor(private fb: FormBuilder) {
        this.workflow_fg = this.fb.group({
            name: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.minLength(3), Validators.maxLength(50)]),
            description: this.fb.control('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]),
            workflowOwningGroup: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]),
            emailAddress: this.fb.control('', [Validators.required, Validators.email, Validators.pattern(/@(ms|morganstanley)\.com$/)]),
            globals: this.fb.control({}, jsonValidator),
            steps: this.fb.array([]),
        });
    }
    get steps(): FormArray {
        return this.workflow_fg.get('steps') as FormArray;
    }

    createStepForm(step: IWorkflowStep): FormGroup {
        const formGroup = this.fb.group({
            name: this.fb.control(step.name, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.minLength(3), Validators.maxLength(50)]),
            description: this.fb.control(step.description, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]),
            executionType: this.fb.control(step.executionType, [Validators.required]),
            environment: this.fb.group({
                commandType: this.fb.control(step.environment.commandType, [Validators.required]),
                runtime: this.fb.control(step.environment.runtime, [Validators.required]),
                command: this.fb.control(step.environment.command, [Validators.required]),
                inputparams: this.fb.control(step.environment.inputparams, [jsonValidator]),
                outputparams: this.fb.control(step.environment.outputparams, [jsonValidator]),
            }),
            outputVariable: this.fb.control(step.outputVariable, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]),
            successCriteria: this.fb.control(step.successCriteria, [Validators.required]),
            timeout: this.fb.control(step.timeout, [Validators.required, Validators.min(0)]),
            onSuccessSequential: this.fb.group({
                actionType: this.fb.control(step.onSuccessSequential.actionType, [Validators.required]),
                step: this.fb.control(step.onSuccessSequential.step),
                trigger: this.fb.control(step.onSuccessSequential.trigger),
                inputValue: this.fb.control(step.onSuccessSequential.inputValue),
            }),
            onUnsuccessSequential: this.fb.group({
                actionType: this.fb.control(step.onUnsuccessSequential.actionType, [Validators.required]),
                step: this.fb.control(step.onUnsuccessSequential.step),
                trigger: this.fb.control(step.onUnsuccessSequential.trigger),
                inputValue: this.fb.control(step.onUnsuccessSequential.inputValue),
            }),
            onError: this.fb.group({
                actionType: this.fb.control(step.onError.actionType, [Validators.required]),
                step: this.fb.control(step.onError.step),
                trigger: this.fb.control(step.onError.trigger),
                inputValue: this.fb.control(step.onError.inputValue),
            }),
            onTimeout: this.fb.group({
                actionType: this.fb.control(step.onTimeout.actionType, [Validators.required]),
                step: this.fb.control(step.onTimeout.step),
                trigger: this.fb.control(step.onTimeout.trigger),
                inputValue: this.fb.control(step.onTimeout.inputValue),
            }),
            wikiLink: this.fb.control(step.wikiLink, [Validators.required, Validators.pattern(/^(http|https):\/\/([a-zA-Z0-9-]+\.)*(ms|morganstanley)\.com\\?/)]),
            versionRange: this.fb.group({
                lowestVersion: this.fb.control(step.versionRange.lowestVersion, [Validators.required]),
                highestVersion: this.fb.control(step.versionRange.highestVersion, [Validators.required]),
            }),
        });
        // We are adding the essential validators based on the actionType. The additional validators are added in the valueChanges subscription and also a few after patching the values.

        // Scope for we can consolidate all these sections into a single function.

        if (step.onSuccessSequential.actionType === this.workflowStepActionType) {
            formGroup.get('onSuccessSequential.step')?.setValidators(Validators.required);
        }

        if (step.onSuccessSequential.actionType === this.reservedAction_ActionType) {
            formGroup.get('onSuccessSequential.trigger')?.setValidators(Validators.required);
            formGroup.get('onSuccessSequential.inputValue')?.setValidators(Validators.required);
        }

        if (step.onUnsuccessSequential.actionType === this.workflowStepActionType) {
            formGroup.get('onUnsuccessSequential.step')?.setValidators(Validators.required);
        }

        if (step.onUnsuccessSequential.actionType === this.reservedAction_ActionType) {
            formGroup.get('onUnsuccessSequential.trigger')?.setValidators(Validators.required);
            formGroup.get('onUnsuccessSequential.inputValue')?.setValidators(Validators.required);
        }

        if (step.onError.actionType === this.workflowStepActionType) {
            formGroup.get('onError.step')?.setValidators(Validators.required);
        }

        if (step.onError.actionType === this.reservedAction_ActionType) {
            formGroup.get('onError.trigger')?.setValidators(Validators.required);
            formGroup.get('onError.inputValue')?.setValidators(Validators.required);
        }
        if (step.onTimeout.actionType === this.workflowStepActionType) {
            formGroup.get('onTimeout.step')?.setValidators(Validators.required);
        }

        if (step.onTimeout.actionType === this.reservedAction_ActionType) {
            formGroup.get('onTimeout.trigger')?.setValidators(Validators.required);
            formGroup.get('onTimeout.inputValue')?.setValidators(Validators.required);
        }

        return formGroup;
    }
    adjustGlobalsHeight(): void {
        const textArea = this.globalsTextarea.nativeElement;
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
    }

    getStepNames(): BehaviorSubject<string[]> {
        return this.stepNames;
    }

    ngOnInit(): void {
        this.stepNames.next(this.workflow.steps.map(step => step.name));

        this.workflow_fg.patchValue(this.workflow);

        const stepsFromArray = this.workflow_fg.get('steps') as FormArray;

        this.workflow.steps.forEach(step => {
            stepsFromArray.push(this.createStepForm(step));
        });

        this.steps.controls.forEach((step, index) => {
            // Run the code block immediately after patching the values. By this time the controls are expected to have essential validators.
            if (step.get('onSuccessSequential')?.get('actionType')?.value === this.workflowStepActionType) {
                step.get('onSuccessSequential')?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get('name')?.value));
            }

            if (step.get('onSuccessSequential')?.get('actionType')?.value === this.reservedAction_ActionType) {
                step.get('onSuccessSequential')?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get('name')?.value));
            }

            if (step.get('onUnsuccessSequential')?.get('actionType')?.value === this.workflowStepActionType) {
                step.get('onUnsuccessSequential')?.get('step')?.addValidators(valueInArrayValidator(this.getStepNames(), step.get('name')?.value));
            }
            if (step.get('onUnsuccessSequential')?.get('actionType')?.value === this.reservedAction_ActionType) {
                step.get('onUnsuccessSequential')?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get('name')?.value));
            }

            if (step.get('onError')?.get('actionType')?.value === this.workflowStepActionType) {
                step.get('onError')?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get('name')?.value));
            }

            if (step.get('onError')?.get('actionType')?.value === this.reservedAction_ActionType) {
                step.get('onError')?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get('name')?.value));
            }

            if (step.get('onTimeout')?.get('actionType')?.value === this.workflowStepActionType) {
                step.get('onTimeout')?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get('name')?.value));
            }

            if (step.get('onTimeout')?.get('actionType')?.value === this.reservedAction_ActionType) {
                step.get('onTimeout')?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get('name')?.value));
            }

            step.updateValueAndValidity();
        });
        // Subscribe to the value changes of the steps and add the additional validators based on the actionType.
        (this.workflow_fg.get('steps') as FormArray).controls.forEach((step, Index) => {
            step.valueChanges.subscribe((value) => {
                // Updating the stepliames observable with the latest step names..
                this.workflow_fg.get('steps')?.valueChanges.subscribe((value) => {
                    this.stepNames.next(value.map((step: IWorkflowStep) => step.name));
                });

                if (value.onSuccessSequential.actionType === this.workflowStepActionType) {
                    step.get("onSuccessSequential")?.get('step')?.addValidators(Validators.required);
                    step.get("onSuccessSequential")?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get("name")?.value));
                }

                if (value.onSuccessSequential.actionType === this.reservedAction_ActionType) {
                    step.get("onSuccessSequential")?.get('trigger')?.addValidators(Validators.required);
                    step.get("onSuccessSequential")?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get("name")?.value));
                    step.get("onSuccessSequential")?.get('inputValue')?.addValidators(Validators.required);
                }

                if (value.onUnsuccessSequential.actionType === this.workflowStepActionType) {
                    step.get('onUnsuccessSequential')?.get('step')?.addValidators(Validators.required);
                    step.get('onUnsuccessSequential')?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get('name')?.value));
                }

                if (value.onUnsuccessSequential.actionType === this.reservedAction_ActionType) {
                    step.get('onUnsuccessSequential')?.get('trigger')?.addValidators(Validators.required);
                    step.get('onUnsuccessSequential')?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get('name')?.value));
                    step.get('onUnsuccessSequential')?.get('inputValue')?.addValidators(Validators.required);
                }

                if (value.onError.actionType === this.workflowStepActionType) {
                    step.get("onError")?.get('step')?.addValidators(Validators.required);
                    step.get("onError")?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get('name')?.value));
                }

                if (value.onError.actionType === this.reservedAction_ActionType) {
                    step.get("onError")?.get('trigger')?.addValidators(Validators.required);
                    step.get("onError")?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get('name')?.value));
                    step.get("onError")?.get('inputValue')?.addValidators(Validators.required);
                }
                if (value.onTimeout.actionType === this.workflowStepActionType) {
                    step.get("onTimeout")?.get('step')?.addValidators(Validators.required);
                    step.get("onTimeout")?.get('step')?.addValidators(valueInArrayValidator(this.stepNames, step.get("name")?.value));
                }

                if (value.onTimeout.actionType === this.reservedAction_ActionType) {
                    step.get("onTimeout")?.get('trigger')?.addValidators(Validators.required);
                    step.get("onTimeout")?.get('trigger')?.addValidators(valueInArrayValidator(this.listOfReservedActions, step.get("name")?.value));
                    step.get("onTimeout")?.get('inputValue')?.addValidators(Validators.required);
                }
            });
        });
    }

    collectAllErrors() {
        return collectAllErrors(this.workflow_fg);
    }

    onSubmit() {
        this.workflow_fg.markAllAsTouched();
        console.log(this.workflow_fg.get('steps'));
    }
}
function collectAllErrors(control: AbstractControl, path: string=''): Record<string, any> {
    const errors: Record<string, any> = {};

    if (control instanceof FormGroup) {
        for (const key in control.controls) {
            if (control.controls.hasOwnProperty(key)) {
                const controlPath = path ? `${path}.${key}` : key;
                Object.assign(errors, collectAllErrors(control.controls[key], controlPath));
            }
        }
    } else if (control instanceof FormArray) {
        control.controls.forEach((control, index) => {
            const arrayPath = path ? `${path}[${index + 1}]` : `${index + 1}`;
            Object.assign(errors, collectAllErrors(control, arrayPath));
        });
    } else {
        if (control.errors) {
            errors[path] = control.errors
        }
    }
    return errors;
}