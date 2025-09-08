/*
TODO:
  Old imports for legacy Angular app configuration. Check to see if we need imports or additional configuration
  for prod environment setup.
 */
// import { enableProdMode } from '@angular/core';
// import { AppModule } from './app/app.module';
// import { environment } from './environments/environment';

import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {bootstrapApplication} from '@angular/platform-browser';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
