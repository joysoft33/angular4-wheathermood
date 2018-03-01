import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule  } from './app-routing.module';

import {
  HomeComponent,
  PlaylistsComponent,
  TracksComponent,
  WeatherComponent,
  Error404Component,
  EmptyComponent
} from './components';

import {
  DeezerService,
  WeatherService,
  EventsService
} from './services';

@NgModule({
  declarations: [
    HomeComponent,
    PlaylistsComponent,
    TracksComponent,
    WeatherComponent,
    Error404Component,
    EmptyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [
    WeatherService,
    DeezerService,
    EventsService
  ],
  bootstrap: [HomeComponent]
})
export class AppModule { }
