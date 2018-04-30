import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import 'rxjs/add/operator/first';

import { DeezerService, Track } from '../../services/deezer';

import {
  EventsService,
  AppEvent,
  TrackNewEvent,
  TrackPauseEvent,
  TrackPlayEvent,
  StopEvent,
  LoadEvent,
  ToastEvent
} from '../../services/events';

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
    // Stay informed of player events
    this.subscription = this.deezer.events$.subscribe((event) => this.onPlayEvent(event));
    this.pause = true;
    this.show = [];
  }

  ngOnInit() {
    console.log('Tracks component init');
    // Save the playlist identifier
    this.playlistId = +(this.route.snapshot.paramMap.get('id'));
    // Get the requested playlist tracks
    this.events.emit(new LoadEvent(true));
    this.deezer
      .playlistPlay(this.playlistId)
      .first()
      .subscribe((tracks): void => {
        this.zone.run(() => this.tracks = tracks);
      }, (err): void => {
        this.events.emit(new ToastEvent(err));
      }, (): void => {
        this.events.emit(new LoadEvent(false));
      });
  }

  ngOnDestroy() {
    console.log('Tracks component destroy');
    this.subscription.unsubscribe();
    if (!this.pause) {
      this.deezer.trackPause();
    }
  }

  cancel = (): void => {
    if (!this.pause) {
      this.deezer.trackPause();
    }
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
      .first()
      .subscribe((data): void => {
        console.log(data);
      }, (err): void => {
        this.events.emit(new ToastEvent(err));
      }, (): void => {
        this.events.emit(new LoadEvent(false));
      });
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
    this.zone.run((): void => {
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
