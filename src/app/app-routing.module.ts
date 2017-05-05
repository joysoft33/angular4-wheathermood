import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { 
  EmptyComponent,
  PlaylistsComponent,
  TracksComponent,
  Error404Component } from './components';

const routes: Routes = [
  {
    path: '',
    component: EmptyComponent
  },
  {
    path: 'playlists/:key',
    component: PlaylistsComponent
  },
  {
    path: 'tracks/:id',
    component: TracksComponent
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  { 
    path: '**',
    component: Error404Component
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})

export class AppRoutingModule { }
