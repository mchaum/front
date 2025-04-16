(window as any).global = window;

import "@angular/compiler"; 
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from "@angular/common/http";
import { importProvidersFrom } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule, provideAnimations } from "@angular/platform-browser/animations";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(FormsModule, BrowserAnimationsModule),
    provideAnimations()
  ]
}).catch(err => console.error(err));