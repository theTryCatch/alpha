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
    template: `
    <form (ngSubmit)="onSubmit()" [formGroup]="workflow_fg">
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
        <div class="text-error" *ngIf="workflow_fg.controls['workflowOwningGroup'].errors?.['pattern']">Only alphabets, numbers, and underscores are allowed. No spaces are allowed.</div>
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
        <div class="text-error" *ngIf="workflow_fg.controls['globals'].errors?.['invalidJson']">Invalid json. You should have at least one key specified, and all key name types should be strings.</div>
    </div>
    <!-- #endregion -->

    <!-- #region: Steps -->
     <div class="collapse-open collapse-arrow border textarea-bordered">
        <input type="checkbox" class="peer" />
        <div class="collapse-title text-sm font-semibold bg-secondary text-secondary-content">
            Steps - {{steps.controls.length}}
        </div>
        <div class="collapse-content overflow-auto flex flex-col">
            <div formArrayName="steps">
                <div *ngFor="let step of steps.controls; let i = index" [formGroupName]="i">
                    <div class="collapse-open border textarea-bordered collapse-arrow gap-1">
                        <input type="checkbox" class="peer" title="step{{i}}" />
                        <div class="collapse-title text-sm font-semibold bg-base-200">
                            Step - {{i+1}} : {{step.get('name')?.value}}
                        </div>
                        <div class="collapse-content overflow-auto">
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
                                <input type="checkbox" class="peer" title="environment"/>
                                <div class="collapse-title text-sm font-semibold bg-primary-content">
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
                                    <textarea class="textarea textarea-bordered w-full" placeholder="Json string" formControlName="inputparams"></textarea>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('inputparams')?.invalid && 
                                                (workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('inputparams')?.dirty || 
                                                workflow_fg.get('steps')?.get(i.toString())?.get('inputparams')?.touched)">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('inputparams')?.errors?.['invalidJson']">
                                            Invalid json. You should have at least key specified and all key name types should be only string.
                                        </div>
                                    </div>
                                    <!-- #endregion -->

                                    <!-- #region Outputparams -->
                                    <label class="label">Output Params</label>
                                    <textarea #inputParams class="textarea textarea-bordered w-full" placeholder="Json string" formControlName="outputparams"></textarea>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('outputparams')?.invalid && 
                                                (workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('outputparams')?.dirty || 
                                                workflow_fg.get('steps')?.get(i.toString())?.get('outputparams')?.touched)">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('environment')?.get('outputparams')?.errors?.['invalidJson']">
                                            Invalid json. You should have at least key specified and all key name types should be only string.
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->
                        
                            <!-- #region: OnSuccessSequential -->
                             <div class="collapse-open collapse-arrow-border textarea-bordered" formGroupName="onSuccessSequential">
                                <input type="checkbox" class="peer" title="OnSuccessSequential" />
                                <div class="collapse-title text-sm font-semibold bg-primary-content">
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
                                            <ng-container *ngFor="let item of (stepNames | async)">
                                                <option [value]="item" *ngIf="item !== step.get('name')?.value">{{item}}</option>
                                            </ng-container>
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
                                <input type="checkbox" class="peer" title="onUnsuccessSequential" />
                                <div class="collapse-title text-sm font-semibold bg-primary-content">
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
                                            <ng-container *ngFor="let item of (stepNames | async)">
                                                <option [value]="item" *ngIf="item !== step.get('name')?.value">{{item}}</option>
                                            </ng-container>
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
                            <div class="collapse-open collapse-arrow border textarea-bordered" formGroupName="onError">
                                <input type="checkbox" class="peer" title="onError" />
                                <div class="collapse-title text-sm font-semibold bg-primary-content">
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
                                            <ng-container *ngFor="let item of (stepNames | async)">
                                                <option [value]="item" *ngIf="item !== step.get('name')?.value">{{item}}</option>
                                            </ng-container>
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
                                    </div>

                                    <label class="label">Input Value</label>
                                    <textarea title="InputValue" class="textarea textarea-bordered w-full" placeholder="Input value" formControlName="inputValue"></textarea>
                                    <div *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('inputValue')?.invalid">
                                        <div class="text-error" *ngIf="workflow_fg.get('steps')?.get(i.toString())?.get('onError')?.get('inputValue')?.errors?.['required']">
                                            Input value is required.
                                        </div>
                                    </div>
                                    <!-- #endregion -->
                                </div>
                            </div>
                            <!-- #endregion -->
                        
                            <!-- #region onTimeout -->
                            <div class="collapse collapse-arrow border textarea-bordered" formGroupName="onTimeout">
                                <input type="checkbox" class="peer" title="onTimeout" />
                                <div class="collapse-title text-sm font-semibold bg-primary-content">
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
                                            <ng-container *ngFor="let item of (stepNames | async)">
                                                <option [value]="item" *ngIf="item !== step.get('name')?.value">{{item}}</option>
                                            </ng-container>
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
                                <input type="checkbox" class="peer" title="versionRange" />
                                <div class="collapse-title text-sm font-semibold bg-primary-content">
                                    Version Range
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

                        </div>
                    </div>
                </div>
            </div>
        </div>
     </div>
    <!-- #endregion -->
    <input type="submit" class="btn-primary btn" />
</form>
    `,
    styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild('globalsTextarea') globalsTextarea!: ElementRef<HTMLTextAreaElement>;
    @Input({ required: true }) workflow!: IWorkflowManifest;

    executionTypes = Object.values(WorkflowStepExecutionType);
    commandTypes = Object.values(WorkflowStepCommandType);
    runtimeTypes = Object.values(WorkflowStepRuntimeType);
    actionTypes = Object.values(WorkflowStepActionType);
    workflowStepActionType = WorkflowStepActionType.workflowStep;
    reservedAction_ActionType = WorkflowStepActionType.reservedAction;
    listOfReservedActions = new BehaviorSubject<string[]>(['AbortWorkflow', 'NotifyFailure', 'NotifySuccess', 'NotifyTimeout']);
    workflow_fg!: FormGroup;
    stepNames = new BehaviorSubject<string[]>([]);

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.initializeForm();
        this.populateForm();
        // this.setupValidatorsAndSubscriptions();
    }

    ngAfterViewInit(): void {
        this.adjustGlobalsHeight();
    }

    private initializeForm(): void {
        this.workflow_fg = this.fb.group({
            name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.minLength(3), Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
            workflowOwningGroup: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
            emailAddress: ['', [Validators.required, Validators.email, Validators.pattern(/@(ms|morganstanley)\.com$/)]],
            globals: this.fb.control({}, [jsonValidator]),
            steps: this.fb.array([]),
        });
    }

    private populateForm(): void {
        if (this.workflow) {
            // Populate root-level fields
            this.workflow_fg.patchValue({
                name: this.workflow.name || '',
                description: this.workflow.description || '',
                workflowOwningGroup: this.workflow.workflowOwningGroup || '',
                emailAddress: this.workflow.emailAddress || '',
                globals: JSON.stringify(this.workflow.globals || {}, null, 2),
            });

            // Populate steps
            const stepsFormArray = this.workflow_fg.get('steps') as FormArray;
            this.workflow.steps.forEach((step) => {
                const stepForm = this.createStepForm(step);
                stepForm.updateValueAndValidity({ emitEvent: false });
                stepsFormArray.push(stepForm);
                listAllValidatorsRecursive(stepForm);
                
            });

            // Initialize step names
            this.stepNames.next(this.workflow.steps.map((step) => step.name));
        }
    }
    private setupValidatorsAndSubscriptions(): void {
        // Re-validate steps when step names change
        this.stepNames.subscribe(() => {
            this.updateValidators();
        });

        // Update step names when step values change
        this.workflow_fg.get('steps')?.valueChanges.subscribe(() => {
            const stepNames = (this.workflow_fg.get('steps') as FormArray).controls.map((step) => step.get('name')?.value);
            this.stepNames.next(stepNames);
        });

        // Add subscriptions for actionType changes
        this.steps.controls.forEach((step) => {
            this.addActionTypeSubscriptions(step, 'onSuccessSequential');
            this.addActionTypeSubscriptions(step, 'onUnsuccessSequential');
            this.addActionTypeSubscriptions(step, 'onError');
            this.addActionTypeSubscriptions(step, 'onTimeout');
        });
    }
    private addActionTypeSubscriptions(step: AbstractControl, groupName: string): void {
        const group = step.get(groupName) as FormGroup;
        if (!group) return; // Prevent errors in case of undefined form group
    
        const actionTypeControl = group.get('actionType');
        const stepControl = group.get('step');
        const triggerControl = group.get('trigger');
        const inputValueControl = group.get('inputValue');
    
        actionTypeControl?.valueChanges.subscribe((value) => {
            console.log(`ActionType changed to: ${value}`);
    
            if (value === this.workflowStepActionType) {
                console.log(`Setting 'step' as required (no empty strings)`);
                stepControl?.setValidators([Validators.required, Validators.minLength(1)]);
                stepControl?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
                triggerControl?.clearValidators();
                inputValueControl?.clearValidators();
            } else if (value === this.reservedAction_ActionType) {
                console.log(`Setting 'trigger' and 'inputValue' as required`);
                triggerControl?.setValidators([Validators.required, Validators.minLength(1)]);
                inputValueControl?.setValidators([Validators.required, Validators.minLength(1)]);
    
                triggerControl?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
                inputValueControl?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
                stepControl?.clearValidators();
            } else {
                console.log(`Clearing all validators`);
                stepControl?.clearValidators();
                triggerControl?.clearValidators();
                inputValueControl?.clearValidators();
            }
    
            // Explicitly force Angular to recognize the changes
            stepControl?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
            triggerControl?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
            inputValueControl?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
            // Explicitly mark fields as touched and dirty
            stepControl?.markAsTouched();
            stepControl?.markAsDirty();
            triggerControl?.markAsTouched();
            triggerControl?.markAsDirty();
            inputValueControl?.markAsTouched();
            inputValueControl?.markAsDirty();
    
            // Force the overall form to revalidate
            this.workflow_fg.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    
            // Debugging logs
            console.log(`Step Control Value:`, stepControl?.value);
            console.log(`Step Control Valid?`, stepControl?.valid);
            console.log(`Step Control Errors:`, stepControl?.errors);
            console.log(`Overall Form Valid?`, this.workflow_fg.valid);
        });
    
        // Ensure initial validation fires
        actionTypeControl?.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
    private createStepForm(step: IWorkflowStep): FormGroup {
        return this.fb.group({
            name: [step.name, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/), Validators.minLength(3), Validators.maxLength(50)]],
            description: [step.description, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
            executionType: [step.executionType, [Validators.required]],
            environment: this.fb.group({
                commandType: [step.environment.commandType, [Validators.required]],
                runtime: [step.environment.runtime, [Validators.required]],
                command: [step.environment.command, [Validators.required]],
                inputparams: [step.environment.inputparams, [jsonValidator]],
                outputparams: [step.environment.outputparams, [jsonValidator]],
            }),
            outputVariable: [step.outputVariable, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
            successCriteria: [step.successCriteria, [Validators.required]],
            timeout: [step.timeout, [Validators.required, Validators.min(0)]],
            onSuccessSequential: this.fb.group({
                actionType: [step.onSuccessSequential.actionType, [Validators.required]],
                step: [step.onSuccessSequential.step],
                trigger: [step.onSuccessSequential.trigger],
                inputValue: [step.onSuccessSequential.inputValue],
            }),
            onUnsuccessSequential: this.fb.group({
                actionType: [step.onUnsuccessSequential.actionType, [Validators.required]],
                step: [step.onUnsuccessSequential.step],
                trigger: [step.onUnsuccessSequential.trigger],
                inputValue: [step.onUnsuccessSequential.inputValue],
            }),
            onError: this.fb.group({
                actionType: [step.onError.actionType, [Validators.required]],
                step: [step.onError.step],
                trigger: [step.onError.trigger],
                inputValue: [step.onError.inputValue],
            }),
            onTimeout: this.fb.group({
                actionType: [step.onTimeout.actionType, [Validators.required]],
                step: [step.onTimeout.step],
                trigger: [step.onTimeout.trigger],
                inputValue: [step.onTimeout.inputValue],
            }),
            wikiLink: [step.wikiLink, [Validators.required, Validators.pattern(/^(http|https):\/\/([a-zA-Z0-9-]+\.)*(ms|morganstanley)\.com\/?.*$/)]],
            versionRange: this.fb.group({
                lowestVersion: [step.versionRange.lowestVersion, [Validators.required]],
                highestVersion: [step.versionRange.highestVersion, [Validators.required]],
            }),
        });
    }

    private updateValidators(): void {
        const steps = this.steps.controls;

        steps.forEach((step) => {
            const stepName = step.get('name')?.value;
            const onSuccessSequentialStep = step.get('onSuccessSequential')?.get('step');
            if (onSuccessSequentialStep) {
                onSuccessSequentialStep.setValidators(valueInArrayValidator(this.stepNames, [stepName]));
                onSuccessSequentialStep.updateValueAndValidity({ emitEvent: false });
            }

            const onUnsuccessSequentialStep = step.get('onUnsuccessSequential')?.get('step');
            if (onUnsuccessSequentialStep) {
                onUnsuccessSequentialStep.setValidators(valueInArrayValidator(this.stepNames, [stepName]));
                onUnsuccessSequentialStep.updateValueAndValidity({ emitEvent: false });
            }

            const onErrorStep = step.get('onError')?.get('step');
            if (onErrorStep) {
                onErrorStep.setValidators(valueInArrayValidator(this.stepNames, [stepName]));
                onErrorStep.updateValueAndValidity({ emitEvent: false });
            }

            const onTimeoutStep = step.get('onTimeout')?.get('step');
            if (onTimeoutStep) {
                onTimeoutStep.setValidators(valueInArrayValidator(this.stepNames, [stepName]));
                onTimeoutStep.updateValueAndValidity({ emitEvent: false });
            }
        });
    }

    get steps(): FormArray {
        return this.workflow_fg.get('steps') as FormArray;
    }

    onSubmit(): void {
        if (this.workflow_fg.valid) {
            const updatedWorkflow = this.workflow_fg.value;
            console.log('Updated Workflow:', updatedWorkflow);
        } else {
            console.log('Form is invalid');
        }
    }

    adjustGlobalsHeight(): void {
        if (this.globalsTextarea) {
            this.globalsTextarea.nativeElement.style.height = 'auto';
            this.globalsTextarea.nativeElement.style.height = `${this.globalsTextarea.nativeElement.scrollHeight}px`;
        }

        try {
            // Parse JSON string to object for validation
            const globalsControl = this.workflow_fg.get('globals');
            if (globalsControl) {
                const parsedGlobals = JSON.parse(globalsControl.value);
                globalsControl.setValue(JSON.stringify(parsedGlobals, null, 2), { emitEvent: false }); // Reformat the JSON
            }
        } catch (e) {
            // Do nothing, let the validator handle invalid JSON
        }
    }

    collectAllErrors() {
        return collectAllErrors(this.workflow_fg);
    }
}
function collectAllErrors(control: AbstractControl, path: string = ''): Record<string, any> {
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
function listAllValidatorsRecursive(control: AbstractControl, path: string = ''): void {
    if (control instanceof FormGroup) {
        // If it's a FormGroup, loop through its controls
        Object.keys(control.controls).forEach((key) => {
            const childControl = control.get(key);
            const fullPath = path ? `${path}.${key}` : key;
            listAllValidatorsRecursive(childControl!, fullPath);
        });
    } else if (control instanceof FormArray) {
        // If it's a FormArray, loop through its controls
        control.controls.forEach((childControl, index) => {
            const fullPath = `${path}[${index}]`;
            listAllValidatorsRecursive(childControl, fullPath);
        });
    } else {
        // If it's a FormControl, list its validators
        console.log(`Field: ${path}, Validators: ${getValidatorNames(control)}`);
    }
}

// Function to get validator names from a FormControl
function getValidatorNames(control: AbstractControl): string[] {
    if (!control.validator) {
        return []; // No validators applied
    }

    const validatorFn = control.validator({} as AbstractControl);
    return Object.keys(validatorFn || {});
}