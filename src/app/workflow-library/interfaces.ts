export interface IWorkflowManifest {
    name: string;
    workflowOwningGroup: string;
    emailAddress: string;
    globals: IStringOfAny;
    description: string;
    steps: IWorkflowStep[];
}

export interface IStringOfAny {
    [key: string]: any;
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
