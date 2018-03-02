import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/first';

import { DeezerService, Playlist } from '../../services/deezer';

import {
  EventsService,
  PlayEvent,
  LoadEvent,
  ToastEvent
} from '../../services/events';

@Component({
  selector: 'playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  playlists: Playlist[];

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private deezer: DeezerService,
    private events: EventsService
  ) {
    this.subscription = this.router.events.subscribe(this.onRouterEvent);
  }

  ngOnInit() {
    console.log('Playlists component init');
  };

  ngOnDestroy() {
    console.log('Playlists component destroy');
    this.subscription.unsubscribe();
  }

  onRouterEvent = (evt: any) => {
    console.log('Router event:', evt);
    if (evt instanceof NavigationEnd) {
      this.events.emit(new LoadEvent(true));
      // Get the searched keyword from route parameters
      this.deezer
        .playlistSearch(this.route.snapshot.paramMap.get('key'))
        .first()
        .subscribe((playlists: Playlist[]) => {
          this.zone.run((): void => {
            this.playlists = playlists;
          });
        }, (err): void => {
          this.events.emit(new ToastEvent(err))
        }, (): void => {
          this.events.emit(new LoadEvent(false));
        });
    }
  };

  trackById = (index, playlist: Playlist): number => {
    return playlist.id;
  };

  playTracks = (playlistId: number): void => {
    this.events.emit(new PlayEvent(playlistId));
  };
}
