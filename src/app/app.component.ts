import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicJsonFormComponent, Metadata } from './dynamic-json-form/dynamic-json-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Dynamic JSON Form</h1>
      <app-dynamic-json-form [jsonInput]="sampleJson" [metadata]="metadata"></app-dynamic-json-form>
    </div>
  `,
  imports: [CommonModule, DynamicJsonFormComponent],
})
export class AppComponent {
  sampleJson = {
    name: "Sagar",
    stepssaga: [
      {
        zindagi: 'John Doe',
        name: 'John Doe',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          country: {
            name: 'USA',
            code: 'USs',
          },
        },
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
      {
        zindagi: 'John Doe',
        name: 'John Doe',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          country: {
            name: 'USA',
            code: 'USs',
          },
        },
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      }
    ]
  };

  metadata: Metadata = {
    name: {
      helpMessage: 'Enter your full name.',
      required: true,
      maxLength: 5,
      popupMessage: "hi"
    },
    stepssaga: {
      nestedMetadata: {
        zindagi: {
          helpMessage: 'Main description for the step.',
          required: true,
        },
        name: {
          helpMessage: 'Enter the name for this step.',
          required: true,
        },
        age: {
          helpMessage: 'Provide the age as a number.',
          required: true,
        },
        address: {
          nestedMetadata: {
            street: {
              helpMessage: 'Enter the street name.',
            },
            city: {
              helpMessage: 'Enter the city name.',
            },
            country: {
              nestedMetadata: {
                name: {
                  helpMessage: 'Enter the country name.',
                },
                code: {
                  helpMessage: 'Enter the country code.',
                },
              },
            },
          },
        },
        preferences: {
          nestedMetadata: {
            theme: {
              helpMessage: 'Select your preferred theme.',
            },
            notifications: {
              helpMessage: 'Enable or disable notifications.',
            },
          },
        },
      },
    },
  };
  
}
