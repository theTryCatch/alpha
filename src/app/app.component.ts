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
    steps: [
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
    zindagi: {
      helpMessage: 'Please enter your full name.',
      required: true,
      popupMessage: "<b>hi</b>"
    },
    name: {
      helpMessage: 'Please enter your full name.',
      maxLength: 50,
      required: true,
    },
    age: {
      helpMessage: 'Please enter your age.',
      required: true,
    },
    address: {
      nestedMetadata: {
        street: {
          helpMessage: 'Enter the street name.',
          maxLength: 100,
        },
        city: {
          helpMessage: 'Enter the city name.',
          required: true,
        },
        country: {
          nestedMetadata: {
            name: {
              helpMessage: 'Enter the country name.',
              required: true,
            },
            code: {
              helpMessage: 'Enter the country code.',
              maxLength: 2,
              userDefined: true,
              popupMessage: "sagar"
            },
          },
        },
      },
    },
    preferences: {
      nestedMetadata: {
        theme: {
          helpMessage: 'Select your theme preference.',
        },
        notifications: {
          helpMessage: 'Enable or disable notifications.',

        },
      },
      userDefined: true
    },
  };
}
