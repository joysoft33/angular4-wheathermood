import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  EmptyComponent,
  PlaylistsComponent,
  TracksComponent,
  Error404Component
} from './components';

const routes: Routes = [{
  path: '',
  component: EmptyComponent
}, {
  path: 'playlists/:key',
  component: PlaylistsComponent,
  runGuardsAndResolvers: 'paramsChange'
}, {
  path: 'tracks/:id',
  component: TracksComponent,
  runGuardsAndResolvers: 'paramsChange'
}, {
  path: '**',
  component: Error404Component
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
