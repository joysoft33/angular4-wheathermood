import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  PlaylistsComponent,
  TracksComponent,
  Error404Component,
  EmptyComponent
} from './components';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: EmptyComponent },
  { path: 'playlists/:key', component: PlaylistsComponent, runGuardsAndResolvers: 'always' },
  { path: 'tracks/:id', component: TracksComponent, runGuardsAndResolvers: 'always' },
  { path: '**', component: Error404Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
