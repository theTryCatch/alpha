import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicJsonFormComponent, Metadata } from './dynamic-json-form/dynamic-json-form.component';
import { SelectAddEntryComponent } from './select-add-entry/select-add-entry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Dynamic JSON Form</h1>
      <!-- <app-dynamic-json-form [jsonInput]="sampleJson" [metadata]="metadata"></app-dynamic-json-form> -->
      <app-select-add-entry></app-select-add-entry>
    </div>
  `,
  imports: [CommonModule, DynamicJsonFormComponent, SelectAddEntryComponent],
})
export class AppComponent {
  sampleJson = {
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
        "executionType": "sequential",
        "environment": {
          "commandType": "script",
          "runtime": "PowerShell",
          "command": "KB-CheckRegistry",
          "inputparams": {
            "keyPath": "globals.teamsRegPath",
            "keyName": "Teams",
            "Action": "GetValue"
          },
          "outputparams": {}
        },
        "outputVariable": "keyExists",
        "successCriteria": "keyExists -eq true",
        "timeout": 60,
        "onSuccessSequential": {
          "actionType": "workflowStep",
          "step": "CheckTeamsProcessRunningV2",
          "trigger": "onStart"
        },
        "onUnsuccessSequential": {
          "actionType": "workflowStep",
          "step": "CheckTeamsProcessRunningV1",
          "trigger": "NotifyFailure"
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
        "wikiLink": "https://wiki.example.com/check_service_running",
        "versionRange": {
          "lowestVersion": "1.0.0",
          "highestVersion": "3.0.0"
        }
      },
      {
        "name": "CheckTeamsProcessRunningV2",
        "description": "Check if the Teams process is running.",
        "executionType": "sequential",
        "environment": {
          "commandType": "script",
          "runtime": "PowerShell",
          "command": "KB-CheckProcess",
          "inputparams": { "name": "globals.teamsV2ProcessName" },
          "outputparams": { "processname": "processname", "processExists": "processExists" }
        },
        "outputVariable": "processExists",
        "successCriteria": "processExists -eq true",
        "timeout": 60,
        "onSuccessSequential": {
          "actionType": "workflowStep",
          "step": "StopTeamsProcessV2",
          "trigger": "onStart"
        },
        "onUnsuccessSequential": {
          "actionType": "workflowStep",
          "step": "end",
          "trigger": "NotifyFailure"
        },
        "onError": {
          "actionType": "reservedAction",
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV2 failed."
        },
        "onTimeout": {
          "actionType": "reservedAction",
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV2 timed out, aborting workflow."
        },
        "wikiLink": "https://wiki.example.com/check_service_running",
        "versionRange": {
          "lowestVersion": "1.0.0",
          "highestVersion": "3.0.0"
        }
      },
      {
        "name": "CheckTeamsProcessRunningV1",
        "description": "Check if the Teams process is running.",
        "executionType": "sequential",
        "environment": {
          "commandType": "script",
          "runtime": "PowerShell",
          "command": "KB-CheckProcess",
          "inputparams": { "name": "globals.teamsV1ProcessName" },
          "outputparams": { "processname": "processname", "processExists": "processExists" }
        },
        "outputVariable": "processExists",
        "successCriteria": "processExists -eq true",
        "timeout": 60,
        "onSuccessSequential": {
          "actionType": "workflowStep",
          "step": "StopTeamsProcessV1",
          "trigger": "onStart"
        },
        "onUnsuccessSequential": {
          "actionType": "workflowStep",
          "step": "end",
          "trigger": "NotifyFailure"
        },
        "onError": {
          "actionType": "reservedAction",
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV1 failed."
        },
        "onTimeout": {
          "actionType": "reservedAction",
          "trigger": "AbortWorkflow",
          "inputValue": "CheckTeamsProcessRunningV1 timed out, aborting workflow."
        },
        "wikiLink": "https://wiki.example.com/check_service_running",
        "versionRange": {
          "lowestVersion": "1.0.0",
          "highestVersion": "3.0.0"
        }
      }
    ]
  }

  metadata: Metadata = {
    name: {
      helpMessage: "The name of the workflow.",
      required: true,
      maxLength: 50,
      popupMessage: "<b>Name</b> is the name of the workflow.",
      userDefined: true,
    },
    description: {
      userDefined: true,
      helpMessage: "A brief description of the workflow.",
      required: true,
      maxLength: 150,
    },
    workflowOwningGroup: {
      helpMessage: "The group that owns this workflow.",
      required: true,
      maxLength: 100,
    },
    emailAddress: {
      helpMessage: "Email address of the workflow owner.",
      required: true,
      maxLength: 100,
    },
    globals: {
      userDefined: true,
      nestedMetadata: {
        username: {
          helpMessage: "sThe username placeholder used in the workflow.",
          required: true,
        },
        teamsRegPath: {
          helpMessage: "Path to the registry for Teams.",
          maxLength: 200,
        },
        teamsV2CachePath: {
          helpMessage: "Path to the Teams V2 cache directory.",
          maxLength: 200,
        },
        teamsV2ProcessName: {
          helpMessage: "The process name for Teams V2.",
          maxLength: 50,
        },
        teamsV1ProcessName: {
          helpMessage: "The process name for Teams V1.",
          maxLength: 50,
        },
        teamsV1CachePath: {
          helpMessage: "Path to the Teams V1 cache directory.",
          maxLength: 200,
        },
        teamsV1ProcessPath: {
          helpMessage: "Path to the Teams V1 executable.",
          maxLength: 200,
        },
        maxRetryAttempts: {
          helpMessage: "Maximum retry attempts for steps.",
        },
        retryDelaySeconds: {
          helpMessage: "Delay in seconds between retries.",
        },
      },

      popupMessage: "Global variables used in the workflow.",
    },
    steps: {
      popupMessage: "Global variables used in the workflow.",
    
      nestedMetadata: {
        name: {
          helpMessage: "The name of the step.",
          required: true,
          maxLength: 50,
          popupMessage: "The name of the step.",
        },
        description: {
          helpMessage: "A brief description of the step.",
          maxLength: 150,
        },
        executionType: {
          helpMessage: "The execution type of the step (e.g., sequential).",
        },
        environment: {
          nestedMetadata: {
            commandType: {
              helpMessage: "Type of command to execute.",
              maxLength: 50,
            },
            runtime: {
              helpMessage: "Runtime environment for the step (e.g., PowerShell).",
              maxLength: 50,
            },
            command: {
              helpMessage: "Command to execute in the environment.",
              maxLength: 100,
            },
            inputparams: {
              userDefined: true,
              helpMessage: "Input parameters for the command.",
            },
            outputparams: {
              userDefined: true,
              helpMessage: "Output parameters from the command.",
            },
          },
        },
        outputVariable: {
          helpMessage: "Name of the variable to store step output.",
          maxLength: 50,
        },
        successCriteria: {
          helpMessage: "Criteria for determining the success of the step.",
          maxLength: 100,
        },
        timeout: {
          helpMessage: "Timeout in seconds for the step.",
        },
        onSuccessSequential: {
          nestedMetadata: {
            actionType: {
              helpMessage: "Action type on success.",
            },
            step: {
              helpMessage: "The next step to execute on success.",
            },
            trigger: {
              helpMessage: "Trigger condition for the success action.",
            },
          },
        },
        onUnsuccessSequential: {
          nestedMetadata: {
            actionType: {
              helpMessage: "Action type on unsuccessful execution.",
            },
            step: {
              helpMessage: "The next step to execute on failure.",
            },
            trigger: {
              helpMessage: "Trigger condition for the failure action.",
            },
          },
        },
        onError: {
          nestedMetadata: {
            actionType: {
              helpMessage: "Action type on error.",
            },
            trigger: {
              helpMessage: "Trigger condition for the error action.",
            },
            inputValue: {
              helpMessage: "Input value for the error action.",
            },
          },
        },
        onTimeout: {
          nestedMetadata: {
            actionType: {
              helpMessage: "Action type on timeout.",
            },
            trigger: {
              helpMessage: "Trigger condition for the timeout action.",
            },
            inputValue: {
              helpMessage: "Input value for the timeout action.",
            },
          },
        },
        wikiLink: {
          helpMessage: "Link to the documentation for the step.",
          maxLength: 200,
        },
        versionRange: {
          nestedMetadata: {
            lowestVersion: {
              helpMessage: "The lowest supported version.",
              maxLength: 20,
            },
            highestVersion: {
              helpMessage: "The highest supported version.",
              maxLength: 20,
            },
          },
        },
      },
    },
  };
}
