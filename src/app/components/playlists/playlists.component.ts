import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { DeezerService, Playlist } from '../../services/deezer';

import {
  EventsService,
  PlayEvent,
  LoadEvent,
  ToastEvent } from '../../services/events';

@Component({
  selector: 'playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {

  playlists: Playlist[];

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private deezer: DeezerService,
    private events: EventsService
  ) {
  }

  ngOnInit() {    
    this.events.emit(new LoadEvent(true));
    // Get the searched keyword from route parameters
    this.route.params
      .switchMap(
        (params: Params) => this.deezer.playlistSearch(params['key'])
      )
      .subscribe(
        (playlists: Playlist[]) => {
          this.zone.run(() => this.playlists = playlists);
          this.events.emit(new LoadEvent(false));
        },
        (err) => this.events.emit(new ToastEvent(err))
      );
  }

  trackById = (index, playlist: Playlist): number => {
    return playlist.id;
  };

  playTracks = (playlistId: number): void => {
    this.events.emit(new PlayEvent(playlistId));
  };
}
