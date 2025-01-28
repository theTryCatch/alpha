import { 
    AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild 
  } from '@angular/core';
  import { 
    AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators 
  } from '@angular/forms';
  import { BehaviorSubject } from 'rxjs';
  import { jsonValidator } from '../workflow-library/validators/json.validator';
  import { valueInArrayValidator } from '../workflow-library/validators/valueInArray.validator';
  
  @Component({
    selector: 'workflow-component',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './workflow.component.html',
    styleUrl: './workflow.component.scss'
  })
  export class WorkflowComponent implements OnInit {
    @ViewChild('globalTextarea') globalTextarea!: ElementRef<HTMLTextAreaElement>;
  
    executionTypes = Object.values(WorkflowStepExecutionType);
    runtimeTypes = Object.values(WorkflowStepRuntimeType);
    actionTypes = Object.values(WorkflowStepActionType);
    reservedActionTypes = ["AbortWorkflow", "NotifyFailure", "NotifySuccess", "NotifyTimeout"];
  
    workflow_fg!: FormGroup;
    stepNames$ = new BehaviorSubject<string[]>([]);
  
    constructor(private fb: FormBuilder) {}
  
    ngOnInit(): void {
      this.workflow_fg = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/[a-zA-Z0-9_\s]/), Validators.minLength(3), Validators.maxLength(50)]],
        description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
        workflowId: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.minLength(3), Validators.maxLength(500)]],
        emailAddress: ['', [Validators.required, Validators.email, Validators.pattern(/@(ms|morganstanley)\.com$/)]],
        globals: ['', [jsonValidator]],
        steps: this.fb.array([]) // ✅ Ensures steps FormArray is always initialized
      });
  
      const stepsArray = this.workflow_fg.get('steps') as FormArray;
  
      // ✅ Populate steps dynamically
      this.workflow?.steps?.forEach((step) => {
        stepsArray.push(this.createStepForm(step));
      });
  
      // ✅ Ensure stepNames$ is updated correctly
      this.updateStepNames();
  
      // ✅ Subscribe to valueChanges to update step names dynamically
      stepsArray.valueChanges.subscribe(() => {
        this.updateStepNames();
        stepsArray.controls.forEach((step) => {
          step.get('name')?.updateValueAndValidity();
        });
      });
    }
  
    get steps(): FormArray {
      return this.workflow_fg.get('steps') as FormArray;
    }
  
    private updateStepNames() {
      const stepNames = this.steps.controls.map(step => step.get('name')?.value || '');
      this.stepNames$.next([...stepNames]);
    }
  
    createStepForm(step: WorkflowStep): FormGroup {
      return this.fb.group({
        name: [step.name, [Validators.required, Validators.pattern(/[a-zA-Z0-9_\s]/), Validators.minLength(3), Validators.maxLength(50)]],
        description: [step.description, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
        executionType: [step.executionType, Validators.required],
        environment: this.fb.group({
          commandType: [step.environment.commandType, Validators.required],
          command: [step.environment.command, Validators.required],
          inputs: [step.environment.inputs, jsonValidator],
          outputs: [step.environment.outputs, jsonValidator],
          params: [step.environment.params, jsonValidator]
        }),
        onSuccessSequential: this.createActionGroup(step.onSuccessSequential),
        onUnsuccessfulSequential: this.createActionGroup(step.onUnsuccessfulSequential),
        onError: this.createActionGroup(step.onError),
        onTimeout: this.createActionGroup(step.onTimeout),
        wikiLink: [step.wikiLink, [Validators.required, Validators.pattern(/^(http|https):\/\/([a-zA-Z0-9-]+\.)*(morganstanley)\.com\/?$/)]],
        versionRange: this.fb.group({
          lowestVersion: [step.versionRange.lowestVersion, Validators.required],
          highestVersion: [step.versionRange.highestVersion, Validators.required],
        }),
      });
    }
  
    private createActionGroup(action: any): FormGroup {
      return this.fb.group({
        actionType: [action.actionType, Validators.required],
        step: [action.step, Validators.required],
        trigger: [action.trigger, Validators.required],
        inputValue: [action.inputValue, Validators.required]
      });
    }
  
    onSubmit(): void {
      this.workflow_fg.markAllAsTouched();
      console.log(this.workflow_fg.get('steps')?.value);
    }
  }
  