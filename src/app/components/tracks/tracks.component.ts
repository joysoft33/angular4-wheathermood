import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { DeezerService, Track } from '../../services/deezer';

import {
  EventsService,
  AppEvent,
  TrackNewEvent,
  TrackPauseEvent,
  TrackPlayEvent,
  StopEvent,
  LoadEvent,
  ToastEvent } from '../../services/events';

@Component({
  selector: 'tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss']
})
export class TracksComponent implements OnInit, OnDestroy {

  pause: boolean;
  show: boolean[];
  tracks: Track[];
  playlistId: number;
  currentTrack: Track;
  subscription: Subscription;

  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private deezer: DeezerService,
    private events: EventsService
  ) {
    this.pause = true;
    this.show = [];
  }

  ngOnInit() {
    // Stay informed of player events
    this.subscription = this.deezer.events$.subscribe((event) => this.onPlayEvent(event));
    // Get the requested playlist tracks
    this.events.emit(new LoadEvent(true));

    this.route.params
      .switchMap(
        (params: Params) => {
          this.playlistId = +params['id'];
          return this.deezer.playlistPlay(this.playlistId);
        }
      )
      .subscribe(
        (tracks) => {
          this.zone.run(() => this.tracks = tracks);
          this.events.emit(new LoadEvent(false));
        },
        (err) => this.events.emit(new ToastEvent(err))
      );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  cancel = (): void => {
    this.deezer.trackPause();
    this.events.emit(new StopEvent());
  };

  trackById = (index, track: Track): number => {
    return track.id;
  };

  /**
   * Start playing the requested playlist's track
   */
  trackPlay = (index: number): void => {

    this.events.emit(new LoadEvent(true));

    this.deezer.playlistPlay(this.playlistId, index)
      .subscribe(
        (data) => this.events.emit(new LoadEvent(false)),
        (err) => this.events.emit(new ToastEvent(err))
      );
  };

  /**
   * Pilot the music player
   */
  trackNext = (): void => {
    this.deezer.trackNext();
  };

  trackPause = (): void => {
    if (this.pause) {
      this.deezer.trackPlay();
    } else {
      this.deezer.trackPause();
    }
  };

  /**
   * Process Deezer service notifications
   */
  onPlayEvent = (event: AppEvent): void => {

    console.log("Deezer event:", event.type);

    this.zone.run(() => {
      if (event instanceof TrackNewEvent) {
        console.log("Playing", event.value.title);
        this.currentTrack = event.value;
      } else if (event instanceof TrackPauseEvent) {
        this.pause = true;
      } else if (event instanceof TrackPlayEvent) {
        this.pause = false;
      } else {
        console.log('Event unknown');
      }
    });
  };

};
