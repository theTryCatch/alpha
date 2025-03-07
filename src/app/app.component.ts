import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicJsonFormComponent, Metadata } from './dynamic-json-form/dynamic-json-form.component';
import { SelectAddEntryComponent } from './select-add-entry/select-add-entry.component';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WorkflowComponent } from './workflow/workflow.component';
import { IWorkflowManifest, WorkflowStepExecutionType, WorkflowStepCommandType, WorkflowStepRuntimeType, WorkflowStepActionType } from './workflow-library/interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <!-- <workflow />
      <hr> -->
      <workflow [workflow]="sampleJsonFull" />
      <!-- <hr>
      <workflow [workflow]="sampleJsonPartial" /> -->
    </div>
  `,
  imports: [CommonModule, DynamicJsonFormComponent, SelectAddEntryComponent, FormsModule, RouterModule, WorkflowComponent],
})
export class AppComponent {
  sampleJsonFull = {
    "name": "ClearTeamsCache",
    "description": "A workflow to clear the Microsoft Teams client cache in multiple steps.",
    "workflowOwningGroup": "ITSupport",
    "emailAddress": "prodmgtauto@ms.com",
    "globals": {
      "username": "$username",
      "teamsRegPath": "HKLM:\\SOFTWARE\\Morgan Stanley\\AppFootprints",
      "teamsV2CachePath": "C:\\Users\\$username\\AppData\\Local\\Packages\\MSTeams_8wekyb3d8bbwe\\LocalCache\\Microsoft\\MSTeams",
      "teamsV2ProcessName": "ms-teams",
      "teamsV1ProcessName": "teams",
      "teamsV1CachePath": "C:\\Users\\$username\\AppData\\Microsoft\\Teams",
      "teamsV1ProcessPath": "C:\\Users\\$username\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe",
      "maxRetryAttempts": 2,
      "retryDelaySeconds": 5
    },
    "steps": [
      {
        "name": "GetTeamsFootprintV2",
        "description": "Get the V2 MS Teams footprint from registry.",
        "executionType": "sequentials",
        "environment": {
          "commandType": "script",
          "runtime": "PowerShell",
          "command": "KB-CheckRegistry",
          "inputparams": "[pscustomobject] @{path = globals.teamsRegPath; key = 'CachePath'}",
          "outputparams": "sagars"
        },
        "outputVariable": "keyExists",
        "successCriteria": "keyExists -eq true",
        "timeout": 60,
        "onSuccessSequential": {
          "actionType": "workflowStep",
          "step": "CheckTeamsProcessRunningV2",
        },
        "onUnsuccessSequential": {
          "actionType": "workflowStep",
          "step": "CheckTeamsProcessRunningV2",
        },
        "onError": {
          "actionType": "reservedAction",
          "trigger": "AbortWorkflow",
          "inputValue": "GetTeamsFootprintV2 failed aborting workflow."
        },
        "onTimeout": {
          "actionType": "reservedAction",
          "trigger": "AbortWorkflow",
          "inputValue": "GetTeamsFootprintV2 timed out, aborting workflow."
        },
        "wikiLink": "https://wiki.example.ms.com/check_service_running",
        "versionRange": {
          "lowestVersion": "1.0.0",
          "highestVersion": "3.0.0"
        }
      },
      {
        "name": "CheckTeamsProcessRunningV2",
        "description": "Check if the Teams process is running.",
        "executionType": WorkflowStepExecutionType.sequential,
        "environment": {
          "commandType": WorkflowStepCommandType.script,
          "runtime": WorkflowStepRuntimeType.PowerShell,
          "command": "KB-CheckProcess",
          "inputparams": "something",
          "outputparams": "otherthing"
        },
        "outputVariable": "processExists",
        "successCriteria": "processExists -eq true",
        "timeout": 60,
        "onSuccessSequential": {
          "actionType": WorkflowStepActionType.workflowStep,
          "step": "GetTeamsFootprintV2",
        },
        "onUnsuccessSequential": {
          "actionType": WorkflowStepActionType.workflowStep,
          "step": "GetTeamsFootprintV2",
        },
        "onError": {
          "actionType": WorkflowStepActionType.reservedAction,
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV2 failed."
        },
        "onTimeout": {
          "actionType": WorkflowStepActionType.reservedAction,
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV2 timed out, aborting workflow."
        },
        "wikiLink": "https://wiki.example.ms.com/check_service_running",
        "versionRange": {
          "lowestVersion": "1.0.0",
          "highestVersion": "3.0.0"
        }
      },
      {
        "name": "CheckTeamsProcessRunningV1",
        "description": "Check if the Teams process is running.",
        "executionType": WorkflowStepExecutionType.sequential,
        "environment": {
          "commandType": WorkflowStepCommandType.script,
          "runtime": WorkflowStepRuntimeType.PowerShell,
          "command": "KB-CheckProcess",
          "inputparams": "something",
          "outputparams": "otherthing"
        },
        "outputVariable": "processExists",
        "successCriteria": "processExists -eq true",
        "timeout": 60,
        "onSuccessSequential": {
          "actionType": WorkflowStepActionType.workflowStep,
          "step": "GetTeamsFootprintV2",
        },
        "onUnsuccessSequential": {
          "actionType": WorkflowStepActionType.workflowStep,
          "step": "CheckTeamsProcessRunningV2",
        },
        "onError": {
          "actionType": WorkflowStepActionType.reservedAction,
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV1 failed."
        },
        "onTimeout": {
          "actionType": WorkflowStepActionType.reservedAction,
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV1 timed out, aborting workflow."
        },
        "wikiLink": "https://wiki.example.ms.com/check_service_running",
        "versionRange": {
          "lowestVersion": "1.0.0",
          "highestVersion": "3.0.0"
        }
      }
    ]
  }
  sampleJsonPartial: IWorkflowManifest = {
    "name": "ClearTeamsCache",
    "description": "A workflow to clear the Microsoft Teams client cache in multiple steps.",
    "workflowOwningGroup": "ITSupport",
    "emailAddress": "prodmgtauto@ms.com",
    "globals": {
      "username": "$username",
      "teamsRegPath": "HKLM:\\SOFTWARE\\Morgan Stanley\\AppFootprints",
      "teamsV2CachePath": "C:\\Users\\$username\\AppData\\Local\\Packages\\MSTeams_8wekyb3d8bbwe\\LocalCache\\Microsoft\\MSTeams",
      "teamsV2ProcessName": "ms-teams",
      "teamsV1ProcessName": "teams",
      "teamsV1CachePath": "C:\\Users\\$username\\AppData\\Microsoft\\Teams",
      "teamsV1ProcessPath": "C:\\Users\\$username\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe",
      "maxRetryAttempts": 2,
      "retryDelaySeconds": 5
    },
    "steps": []
  }

  isWorkflowManifest() {

  }
}
