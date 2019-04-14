import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppVehicleInfo } from './app.vehicle-info';

@NgModule({
  declarations: [
    AppVehicleInfo
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppVehicleInfo]
})
export class AppModule { }
