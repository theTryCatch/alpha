import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { jsonValidator } from '../workflow-library/validators/json.validator';
import { valueInArrayValidator } from '../workflow-library/validators/valueInArray.validator';
import { IWorkflowManifest, WorkflowStepCommandType, WorkflowStepRuntimeType, WorkflowStepActionType, IWorkflowManifestFormGroup, IStringOfAny, IWorkflowStepForm, IWorkflowStep, IEnvironmentForm, IVersionRangeForm, IActionHandlerForm, WorkflowStepExecutionType } from '../workflow-library/interfaces';
import { atLeastOneValidStepValidator } from '../workflow-library/validators/atLeastOneValidStepValidator';

@Component({
    selector: 'workflow',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
    <form (ngSubmit)="onSubmit()" [formGroup]="workflow_fg" class="flex flex-col gap-2">
    <div> {{collectAllErrors() | json}}</div>
    <div>{{workflow_fg.valid}}</div>
    <div>{{stepNames|async}}</div>
    <!--region: Name -->
    <label class="label">Name</label>
    <input type="text" placeholder="Name of the workflow" class="input input-bordered w-full" formControlName="name"/>
    <div *ngIf="workflow_fg.controls['name'].invalid && (workflow_fg.controls['name'].dirty || workflow_fg.controls['name'].touched)">
        <div class="text-error" *ngIf="workflow_fg.controls['name'].errors?.['required']">Workflow name is required.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['name'].errors?.['pattern']">Only alphabets, numbers and underscores are allowed.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['name'].errors?.['minlength']">Workflow name should have at least {{workflow_fg.controls['name'].errors?.['minlength'].requiredLength}} characters.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['name'].errors?.['maxlength']">Workflow name can have maximum of {{workflow_fg.controls['name'].errors?.['maxlength'].requiredLength}} characters.</div>
    </div>
    <!-- #endregion -->
    
    <!-- #region: Description -->
    <label class="label">Description</label>
    <textarea class="textarea textarea-bordered w-full" placeholder="Workflow description" formControlName="description"></textarea>
    <div *ngIf="workflow_fg.controls['description'].invalid && (workflow_fg.controls['description'].dirty || workflow_fg.controls['description'].touched)">
        <div class="text-error" *ngIf="workflow_fg.controls['description'].errors?.['required']">Workflow description is required.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['description'].errors?.['minlength']">Workflow description should have at least {{workflow_fg.controls['description'].errors?.['minlength'].requiredLength}} characters.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['description'].errors?.['maxlength']">Workflow description can have maximum of {{workflow_fg.controls['description'].errors?.['maxlength'].requiredLength}} characters.</div>
    </div>
    <!-- #endregion -->
    
    <!-- #region: Workflow Owning Group -->
    <label class="label">Workflow Owning Group</label>
    <input type="text" placeholder="Workflow owning group" class="input input-bordered w-full" formControlName="workflowOwningGroup"/>
    <div *ngIf="workflow_fg.controls['workflowOwningGroup'].invalid && (workflow_fg.controls['workflowOwningGroup'].dirty || workflow_fg.controls['workflowOwningGroup'].touched)">
        <div class="text-error" *ngIf="workflow_fg.controls['workflowOwningGroup'].errors?.['required']">Workflow owning group is required.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['workflowOwningGroup'].errors?.['minlength']">Workflow owning group should have at least {{workflow_fg.controls['workflowOwningGroup'].errors?.['minlength'].requiredLength}} characters.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['workflowOwningGroup'].errors?.['pattern']">Only alphabets, numbers, and underscores are allowed.</div>
    </div>
    <!-- #endregion -->
    
    <!-- #region: Email Address -->
    <label class="label">Email Address</label>
    <input type="text" placeholder="Email Address" class="input input-bordered w-full" formControlName="emailAddress"/>
    <div *ngIf="workflow_fg.controls['emailAddress'].invalid && (workflow_fg.controls['emailAddress'].dirty || workflow_fg.controls['emailAddress'].touched)">
        <div class="text-error" *ngIf="workflow_fg.controls['emailAddress'].errors?.['required']">Workflow owner's email address is required.</div>
        <div class="text-error" *ngIf="workflow_fg.controls['emailAddress'].errors?.['pattern']">Only ms.com or morganstanley.com domain email address is allowed.</div>
    </div>
    <!-- #endregion -->
    
    <!-- #region: Globals -->
    <label class="label">Globals</label>
    <textarea #globalsTextarea class="textarea textarea-bordered w-full" placeholder="Json string" formControlName="globals" (input)="adjustGlobalsHeight()"></textarea>
    <div *ngIf="workflow_fg.controls['globals'].invalid && (workflow_fg.controls['globals'].dirty || workflow_fg.controls['globals'].touched)">
        <div class="text-error" *ngIf="workflow_fg.controls['globals'].errors?.['invalidJson']">Invalid json format.</div>
    </div>
    <!-- #endregion -->

    <!-- #region: Steps -->
     <div class="collapse collapse-arrow border textarea-bordered">
        <input type="checkbox" class="peer" checked/>
        <div class="collapse-title text-sm font-semibold bg-secondary text-secondary-content join items-center gap-4" >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="workflow_fg.get('steps')?.invalid">
                <path d="M440-400v-360h80v360h-80Zm0 200v-80h80v80h-80Z"/>
            </svg>
            
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! workflow_fg.get('steps')?.invalid">
                <path d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"/>
            </svg>
            <span>Steps - {{steps.controls.length}}</span>
        </div>
        <div class="collapse-content overflow-auto">
            <div formArrayName="steps">
                <div *ngFor="let step of steps.controls; let i = index" [formGroupName]="i" class="flex flex-col">
                    <div class="collapse border textarea-bordered collapse-arrow gap-1">
                        <input type="checkbox" class="peer" title="step{{i}}" checked/>
                        <div class="collapse-title text-sm font-semibold bg-base-200 join gap-2 items-center" [ngClass]="{'text-error': step?.invalid}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step?.invalid">
                                <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                            </svg>
                            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step?.invalid">
                                <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                            </svg>
                            Step - {{i+1}} : {{step.get('name')?.value}}
                        </div>
                        <div class="collapse-content overflow-auto flex flex-col">
                            <!-- #region: Name -->
                            <label class="label">Name</label>
                            <input type="text" placeholder="Name of the step" class="input input-bordered w-full" formControlName="name"/>

                            <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('name')?.invalid && (workflow_fg.get('steps')?.get(i.toString())?.get('name')?.dirty || workflow_fg.get('steps')?.get(i.toString())?.get('name')?.touched)">
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('name')?.errors?.['required']">Step name is required.</div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('name')?.errors?.['pattern']">Only alphabets, numbers and underscores are allowed.</div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('name')?.errors?.['minlength']">Step name should have at least {{workflow_fg.get('steps')?.get(i.toString())?.get('name')?.errors?.['minlength'].requiredLength}} characters.</div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('name')?.errors?.['maxlength']">Step name can have a maximum of {{workflow_fg.get('steps')?.get(i.toString())?.get('name')?.errors?.['maxlength'].requiredLength}} characters.</div>
                            </div>

                            <!-- #endregion -->

                            <!-- #region: Description -->

                            <label class="label">Description</label>

                            <textarea class="textarea textarea-bordered w-full" placeholder="Step description" formControlName="description"></textarea>

                            <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('description')?.invalid && (workflow_fg.get('steps')?.get(i.toString())?.get('description')?.dirty || workflow_fg.get('steps')?.get(i.toString())?.get('description')?.touched)">
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('description')?.errors?.['required']">Step description is required.</div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('description')?.errors?.['minlength']">Step description should have at least {{workflow_fg.get('steps')?.get(i.toString())?.get('description')?.errors?.['minlength'].requiredLength}} characters.</div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('description')?.errors?.['maxlength']">Step description can have a maximum of {{workflow_fg.get('steps')?.get(i.toString())?.get('description')?.errors?.['maxlength'].requiredLength}} characters.</div>
                            </div>

                            <!-- #endregion -->

                            <!-- #region: ExecutionType -->

                            <label class="label">Execution Type</label>
                            <select class="select select-bordered w-full" formControlName="executionType">
                                <option disabled selected>Select Execution Type</option>
                                <option *ngFor="let type of executionTypes" [value]="type">{{type}}</option>
                            </select>

                            <!-- #endregion -->

                            <!-- #region: OutputVariable -->

                            <label class="label">Output Variable</label>

                            <input type="text" placeholder="Output variable" class="input input-bordered w-full" formControlName="outputVariable"/>

                            <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('outputVariable')?.invalid && (workflow_fg.get('steps')?.get(i.toString())?.get('outputVariable')?.dirty || workflow_fg.get('steps')?.get(i.toString())?.get('outputVariable')?.touched)">
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('outputVariable')?.errors?.['required']">Output variable is required.</div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('outputVariable')?.errors?.['pattern']">Only alphabets, numbers, and underscores are allowed.</div>
                            </div>

                            <!-- #endregion -->

                            <!-- #region SuccessCriteria -->
                            <label class="label">Success Criteria</label>
                            <textarea class="textarea textarea-bordered w-full" placeholder="success criteria" formControlName="successCriteria"></textarea>
                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('successCriteria')?.invalid && (workflow_fg.get('steps')?.get(i.toString())?.get('successCriteria')?.dirty || workflow_fg.get('steps')?.get(i.toString())?.get('successCriteria')?.touched)">
                                success criteria is required.
                            </div>
                            <!-- #endregion -->

                            <!-- #region Timeout -->
                            <label class="label">Timeout</label>
                            <input type="number" placeholder="Timeout" class="input input-bordered w-full" formControlName="timeout"/>
                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('timeout')?.invalid && (workflow_fg.get('steps')?.get(i.toString())?.get('timeout')?.dirty || workflow_fg.get('steps')?.get(i.toString())?.get('timeout')?.touched)">
                                <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('timeout')?.errors?.['required']">Timeout is required.</div>
                                <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('timeout')?.errors?.['min']">Minimum timeout should be {{workflow_fg.get('steps')?.get(i.toString())?.get('timeout')?.errors?.['min'].min}} or higher.</div>
                            </div>
                            <!-- #endregion -->

                            <!-- #region Environment -->
                            <div class="collapse collapse-arrow border textarea-bordered" formGroupName="environment">
                                <input type="checkbox" class="peer" title="environment" checked/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content join items-center gap-2" [ngClass]="{'text-error': step.get('environment')?.invalid}">
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step.get('environment')?.invalid">
                                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step.get('environment')?.invalid">
                                        <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                                    </svg>
                                    Environment
                                </div>

                                <div class="collapse-content overflow-auto">
                                    <!-- #region CommandType -->
                                    <label class="label">Command Type</label>
                                    <select class="select select-bordered w-full" formControlName="commandType">
                                        <option disabled selected>Select Command Type</option>
                                        <option *ngFor="let type of commandTypes" [value]="type">{{type}}</option>
                                    </select>
                                    <!-- #endregion -->

                                    <!-- #region Runtime -->
                                    <label class="label">Runtime</label>
                                    <select class="select select-bordered w-full" formControlName="runtime">
                                        <option disabled selected>Select Runtime</option>
                                        <option *ngFor="let runtime of runtimeTypes" [value]="runtime">{{runtime}}</option>
                                    </select>
                                    <!-- #endregion -->

                                    <!-- #region Command -->
                                    <label class="label">Command</label>
                                    <input type="text" placeholder="Command" class="input input-bordered w-full" formControlName="command"/>
                                    <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('command')?.invalid && (workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('command')?.dirty || workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('command')?.touched)">
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('command')?.errors?.['required']">Command is required.</div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Inputparams -->
                                    <label class="label">Input Params</label>
                                    <textarea class="textarea textarea-bordered w-full" placeholder="Input parameters" formControlName="inputparams"></textarea>
                                    <!-- #endregion -->

                                    <!-- #region Outputparams -->
                                    <label class="label">Output Params</label>
                                    <textarea #inputParams class="textarea textarea-bordered w-full" placeholder="Output parameters" formControlName="outputparams"></textarea>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->
                        
                            <!-- #region: OnSuccessSequential -->
                             <div class="collapse collapse-arrow border textarea-bordered" formGroupName="onSuccessSequential">
                                <input type="checkbox" class="peer" title="OnSuccessSequential"  checked/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content join items-center gap-2" [ngClass]="{'text-error': step.get('onSuccessSequential')?.invalid}">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step.get('onSuccessSequential')?.invalid">
                                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step.get('onSuccessSequential')?.invalid">
                                        <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                                    </svg>
                                    On Success Sequential
                                </div>
                                <div class="collapse-content overflow-auto">
                                    <!-- #region ActionType -->
                                    <label class="label">Action Type</label>
                                    <select class="select select-bordered w-full" title="Select an option" formControlName="actionType">
                                        <option disabled selected>Select Action Type</option>
                                        <option *ngFor="let type of actionTypes" [value]="type">{{type}}</option>
                                    </select>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('actionType')?.invalid">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('actionType')?.errors?.['required']">
                                            Action type is required.
                                        </div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Based on actionType displaying the step or trigger along with inputValue -->
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('actionType')?.value === workflowStepActionType">
                                        <label class="label">Step</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="step">
                                            <option disabled selected>Select a step</option>
                                            <option *ngFor="let item of (getFilteredStepNames(step.get('name')?.value || '') | async)" [value]="item">
                                                {{ item }}
                                            </option>

                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('step')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('step')?.errors?.['required']">
                                                Step is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('step')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('step')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('step')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                    </div>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('actionType')?.value === reservedAction_ActionType">
                                        <label class="label">Trigger</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="trigger">
                                            <option disabled selected>Select Trigger</option>
                                            <option *ngFor="let type of (listOfReservedActions | async)" [value]="type">{{type}}</option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('trigger')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('trigger')?.errors?.['required']">
                                                Trigger is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('trigger')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('trigger')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('trigger')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                        
                                        <label class="label">Input Value</label>
                                        <textarea title="InputValue" class="textarea textarea-bordered w-full" placeholder="Input value" formControlName="inputValue"></textarea>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('inputValue')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onSuccessSequential')?.get('inputValue')?.errors?.['required']">
                                                Input value is required.
                                            </div>
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                             </div>
                            <!-- #endregion -->
                            
                            <!-- #region onUnsuccessSequential -->
                            <div class="collapse collapse-arrow border textarea-bordered" formGroupName="onUnsuccessSequential">
                                <input type="checkbox" class="peer" title="onUnsuccessSequential"  checked/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content join items-center gap-2" [ngClass]="{'text-error': step.get('onUnsuccessSequential')?.invalid}">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step.get('onUnsuccessSequential')?.invalid">
                                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step.get('onUnsuccessSequential')?.invalid">
                                        <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                                    </svg>
                                        On Unsuccess Sequential
                                </div>
                                <div class="collapse-content overflow-auto">
                                    <!-- #region ActionType -->
                                    <label class="label">Action Type</label>
                                    <select class="select select-bordered w-full" title="Select an option" formControlName="actionType">
                                        <option disabled selected>Select Action Type</option>
                                        <option *ngFor="let type of actionTypes" [value]="type">{{type}}</option>
                                    </select>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('actionType')?.invalid">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('actionType')?.errors?.['required']">
                                            Action type is required.
                                        </div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Based on actionType displaying the step or trigger along with inputValue -->
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('actionType')?.value === workflowStepActionType">
                                        <label class="label">Step</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="step">
                                            <option disabled selected>Select Step</option>
                                            <option *ngFor="let item of (getFilteredStepNames(step.get('name')?.value || '') | async)" [value]="item">
                                                {{ item }}
                                            </option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('step')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('step')?.errors?.['required']">
                                                Step is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('step')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('step')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('step')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                    </div>

                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('actionType')?.value === reservedAction_ActionType">
                                        <label class="label">Trigger</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="trigger">
                                            <option disabled selected>Select Trigger</option>
                                            <option *ngFor="let type of (listOfReservedActions | async)" [value]="type">{{type}}</option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('trigger')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('trigger')?.errors?.['required']">
                                                Trigger is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('trigger')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('trigger')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('trigger')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                        <div>
                                            <label class="label">Input Value</label>
                                            <textarea title="InputValue" class="textarea textarea-bordered w-full" placeholder="Input value" formControlName="inputValue"></textarea>
                                            <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('inputValue')?.invalid">
                                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onUnsuccessSequential')?.get('inputValue')?.errors?.['required']">
                                                    Input value is required.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->
                        
                            <!-- #region onError -->
                            <div class="collapse collapse-arrow border textarea-bordered" formGroupName="onError">
                                <input type="checkbox" class="peer" title="onError"  checked/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content join items-center gap-2" [ngClass]="{'text-error': step.get('onError')?.invalid}">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step.get('onError')?.invalid">
                                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step.get('onError')?.invalid">
                                        <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                                    </svg>
                                        On Error
                                </div>
                                <div class="collapse-content overflow-auto">
                                    <!-- #region ActionType -->
                                    <label class="label">Action Type</label>
                                    <select class="select select-bordered w-full" title="Select an option" formControlName="actionType">
                                        <option disabled selected>Select Action Type</option>
                                        <option *ngFor="let type of actionTypes" [value]="type">{{type}}</option>
                                    </select>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('actionType')?.invalid">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('actionType')?.errors?.['required']">
                                            Action type is required.
                                        </div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Based on actionType displaying the step or trigger along with inputValue -->
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('actionType')?.value === workflowStepActionType">
                                        <label class="label">Step</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="step">
                                            <option disabled selected>Select Step</option>
                                            <option *ngFor="let item of (getFilteredStepNames(step.get('name')?.value || '') | async)" [value]="item">
                                                {{ item }}
                                            </option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('step')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('step')?.errors?.['required']">
                                                Step is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('step')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('step')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('step')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                    </div>

                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('actionType')?.value === reservedAction_ActionType">
                                        <label class="label">Trigger</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="trigger">
                                            <option disabled selected>Select Trigger</option>
                                            <option *ngFor="let type of (listOfReservedActions | async)" [value]="type">{{type}}</option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('trigger')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('trigger')?.errors?.['required']">
                                                Trigger is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('trigger')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('trigger')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('trigger')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>

                                        <label class="label">Input Value</label>
                                        <textarea title="InputValue" class="textarea textarea-bordered w-full" placeholder="Input value" formControlName="inputValue"></textarea>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('inputValue')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('inputValue')?.errors?.['required']">
                                                Input value is required.
                                            </div>
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->
                        
                            <!-- #region onTimeout -->
                            <div class="collapse collapse-arrow border textarea-bordered" formGroupName="onTimeout">
                                <input type="checkbox" class="peer" title="onTimeout"  checked/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content join items-center gap-2" [ngClass]="{'text-error': step.get('onTimeout')?.invalid}">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step.get('onTimeout')?.invalid">
                                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step.get('onTimeout')?.invalid">
                                        <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                                    </svg>
                                        On Timeout
                                </div>
                                <div class="collapse-content overflow-auto">
                                    <!-- #region ActionType -->
                                    <label class="label">Action Type</label>
                                    <select class="select select-bordered w-full" title="Select an option" formControlName="actionType">
                                        <option disabled selected>Select Action Type</option>
                                        <option *ngFor="let type of actionTypes" [value]="type">{{type}}</option>
                                    </select>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('actionType')?.invalid">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('actionType')?.errors?.['required']">
                                            Action type is required.
                                        </div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Based on actionType displaying the step or trigger along with inputValue -->
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('actionType')?.value === workflowStepActionType">
                                        <label class="label">Step</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="step">
                                            <option disabled selected>Select Step</option>
                                            <option *ngFor="let item of (getFilteredStepNames(step.get('name')?.value || '') | async)" [value]="item">
                                                {{ item }}
                                            </option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('step')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('step')?.errors?.['required']">
                                                Step is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('step')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('step')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('step')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                    </div>

                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('actionType')?.value === reservedAction_ActionType">
                                        <label class="label">Trigger</label>
                                        <select class="select select-bordered w-full" title="Select an option" formControlName="trigger">
                                            <option disabled selected>Select Trigger</option>
                                            <option *ngFor="let type of (listOfReservedActions | async)" [value]="type">{{type}}</option>
                                        </select>
                                        <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('trigger')?.invalid">
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('trigger')?.errors?.['required']">
                                                Trigger is required.
                                            </div>
                                            <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('trigger')?.errors?.['valueNotAllowed']">
                                                Value '{{workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('trigger')?.value}}' not allowed. 
                                                Allowed values are {{workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('trigger')?.errors?.['valueNotAllowed']?.allowedList | json}}.
                                            </div>
                                        </div>
                                    </div>

                                    <label class="label">Input Value</label>
                                    <textarea title="InputValue" class="textarea textarea-bordered w-full" placeholder="Input value" formControlName="inputValue"></textarea>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('inputValue')?.invalid">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onTimeout')?.get('inputValue')?.errors?.['required']">
                                            Input value is required.
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->

                            <!-- #region versionRange -->
                            <div class="collapse collapse-arrow border textarea-bordered" formGroupName="versionRange">
                                <input type="checkbox" class="peer" title="versionRange"  checked/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content join items-center gap-2" [ngClass]="{'text-error': step.get('versionRange')?.invalid}">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-error" *ngIf="step.get('versionRange')?.invalid">
                                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
                                    </svg>
                                    
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="fill-success" *ngIf="! step.get('versionRange')?.invalid">
                                        <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"/>
                                    </svg>
                                        On Timeout
                                </div>
                                <div class="collapse-content overflow-auto">
                                    <!-- #region Lowest Version -->
                                    <label class="label">Lowest Version</label>
                                    <input type="text" placeholder="Lowest Version" class="input input-bordered w-full" formControlName="lowestVersion"/>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('lowestVersion')?.invalid && 
                                                (workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('lowestVersion')?.dirty || 
                                                workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('lowestVersion')?.touched)">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('lowestVersion')?.errors?.['required']">
                                            Lowest Version is mandatory.
                                        </div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Highest Version -->
                                    <label class="label">Highest Version</label>
                                    <input type="text" placeholder="Highest Version" class="input input-bordered w-full" formControlName="highestVersion"/>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('highestVersion')?.invalid && 
                                                (workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('highestVersion')?.dirty || 
                                                workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('highestVersion')?.touched)">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('versionRange')?.get('highestVersion')?.errors?.['required']">
                                            Highest Version is mandatory.
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->

                            <!-- #region Wiki link -->
                            <label class="label">Wiki link</label>
                            <input type="text" placeholder="Wiki link" class="input input-bordered w-full" formControlName="wikiLink"/>
                            <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('wikiLink')?.invalid && 
                                        (workflow_fg.get('steps')?.get(i.toString())?.get('wikiLink')?.dirty || 
                                        workflow_fg.get('steps')?.get(i.toString())?.get('wikiLink')?.touched)">
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('wikiLink')?.errors?.['required']">
                                    Wiki link is required.
                                </div>
                                <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('wikiLink')?.errors?.['pattern']">
                                    Only valid internal URLs with the domain ms.com or morganstanley.com is allowed.
                                </div>
                            </div>
                            <!-- #endregion -->

                            <button class="btn btn-error mt-2" (click)="removeStep(i)">❌ Remove - {{ steps.controls[i].get('name')?.value || 'Unnamed step' }}</button>
                        </div>
                    </div>
                </div>
            </div>
            <!--#region Step Actions -->
            <div class="flex justify-between p-2">
                <button class="btn btn-primary ml-auto" (click)="addStep()">➕ Add Step</button>
            </div>
            <div class="flex text-error" *ngIf="workflow_fg.controls['steps'].invalid && (workflow_fg.controls['steps'].dirty || workflow_fg.controls['steps'].touched)">
                <ng-container *ngIf="workflow_fg.controls['steps'].errors?.['minArrayLength']?.requiredLength === 1">
                    <div *ngIf="workflow_fg.controls['steps'].errors?.['minArrayLength']" class="ml-auto">At least {{workflow_fg.controls['steps'].errors?.['minArrayLength']?.requiredLength}} step is required.</div>
                </ng-container>
                <ng-container *ngIf="workflow_fg.controls['steps'].errors?.['minArrayLength']?.requiredLength > 1">
                    <div *ngIf="workflow_fg.controls['steps'].errors?.['minArrayLength']" class="ml-auto">At least {{workflow_fg.controls['steps'].errors?.['minArrayLength']?.requiredLength}} steps are required.</div>
                </ng-container>
            </div>
            <!-- #endregion -->
        </div>
     </div>
    <!-- #endregion -->
    <button type="submit" class="btn btn-primary ml-auto">Submit</button>
</form>

    `,
    styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild('globalsTextarea') globalsTextarea!: ElementRef<HTMLTextAreaElement>;
    @Input() workflow?: IWorkflowManifest;

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
            executionType: this.fb.control(step?.executionType ?? WorkflowStepExecutionType.sequential, { nonNullable: true, validators: [Validators.required] }),
            outputVariable: this.fb.control(step?.outputVariable ?? '', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)] }),
            successCriteria: this.fb.control(step?.successCriteria ?? '', { nonNullable: true, validators: [Validators.required] }),
            timeout: this.fb.control(step?.timeout ?? 30, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
            environment: this.fb.group<IEnvironmentForm>({
                commandType: this.fb.control(step?.environment?.commandType ?? WorkflowStepCommandType.script, { nonNullable: true, validators: [Validators.required] }),
                runtime: this.fb.control(step?.environment?.runtime ?? WorkflowStepRuntimeType.PowerShell, { nonNullable: true, validators: [Validators.required] }),
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
            validators: [Validators.required],
        });

        const stepControl = this.fb.control<string | null>(
            actionData?.step ?? null
        );

        const triggerControl = this.fb.control<string | null>(actionData?.trigger ?? null);
        const inputValueControl = this.fb.control<string | null>(actionData?.inputValue ?? null);

        // ✅ Apply Correct Validation Rules Immediately
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
            // ✅ Step must be in the list of step names excluding itself
            stepControl.setValidators([
                Validators.required,
                valueInArrayValidator(this.stepNames, currentStepName) // Ensures value is in the list excluding itself
            ]);
            triggerControl.clearValidators();
            inputValueControl.clearValidators();
        } else if (actionType === WorkflowStepActionType.reservedAction) {
            stepControl.clearValidators();
            triggerControl.setValidators([Validators.required]);
            inputValueControl.setValidators([Validators.required]);
        } else {
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
