import { FormControl, FormGroup, FormArray } from "@angular/forms";

export interface IEnvironmentForm {
    commandType: FormControl<WorkflowStepCommandType>;
    runtime: FormControl<WorkflowStepRuntimeType>;
    command: FormControl<string>;
    inputparams: FormControl<string | null>;
    outputparams: FormControl<string | null>;
}
export interface IActionHandlerForm {
    actionType: FormControl<WorkflowStepActionType>;
    step: FormControl<string | null>;
    trigger: FormControl<string | null>;
    inputValue: FormControl<string | null>;
}
export interface IVersionRangeForm {
    lowestVersion: FormControl<string>;
    highestVersion: FormControl<string>;
}
export interface IWorkflowStepForm {
    name: FormControl<string>;
    description: FormControl<string>;
    executionType: FormControl<WorkflowStepExecutionType>;
    outputVariable: FormControl<string>;
    successCriteria: FormControl<string>;
    timeout: FormControl<number>;
    environment: FormGroup<IEnvironmentForm>;
    onSuccessSequential: FormGroup<IActionHandlerForm>;
    onUnsuccessSequential: FormGroup<IActionHandlerForm>;
    onError: FormGroup<IActionHandlerForm>;
    onTimeout: FormGroup<IActionHandlerForm>;
    versionRange: FormGroup<IVersionRangeForm>;
    wikiLink: FormControl<string>;
}
export interface IWorkflowManifestFormGroup {
    name: FormControl<string>;
    description: FormControl<string>;
    workflowOwningGroup: FormControl<string>;
    emailAddress: FormControl<string>;
    globals: FormControl<IStringOfAny | null>;
    steps: FormArray<FormGroup<IWorkflowStepForm>>;
}
export interface IStringOfAny {
    [key: string]: any;
}
export interface IWorkflowManifest {
    name: string;
    workflowOwningGroup: string;
    emailAddress: string;
    globals: IStringOfAny;
    description: string;
    steps: IWorkflowStep[];
}
export interface IStringOfString {
    [key: string]: string;
}
export interface IWorkflowStep {
    name: string;
    description: string;
    executionType: WorkflowStepExecutionType;
    environment: IEnvironment;
    outputVariable: string;
    successCriteria: string;
    timeout: number;
    onSuccessSequential: IOnEventSequential;
    onUnsuccessSequential: IOnEventSequential;
    onError: IOnEventSequential;
    onTimeout: IOnEventSequential;
    wikiLink: string;
    versionRange: IVersionRange;
}
export interface IEnvironment {
    commandType: WorkflowStepCommandType;
    runtime: WorkflowStepRuntimeType;
    command: string;
    inputparams: IStringOfAny;
    outputparams: IStringOfAny;
}
export interface IOnEventSequential {
    actionType: WorkflowStepActionType;
    step?: string;
    trigger?: string;
    inputValue?: string;
}
export interface IVersionRange {
    lowestVersion: string;
    highestVersion: string;
}
export enum WorkflowStepExecutionType {
    sequential = "sequential",
}
export enum WorkflowStepActionType {
    workflowStep = "workflowStep",
    reservedAction = "reservedAction"
}
export enum WorkflowStepCommandType {
    script = "script"
}
export enum WorkflowStepRuntimeType {
    PowerShell = "PowerShell"
}
export type PropertyMetadata<T> = {
    [K in keyof T]: {
        helpMessage: string;
        isReadOnly: boolean;
    };
}