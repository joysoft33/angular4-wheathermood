import { Injectable } from '@angular/core';

import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { AppEvent, TrackNewEvent, TrackPauseEvent, TrackPlayEvent } from '../events/events.declarations';
import { Playlist, Track } from './deezer.declarations';

const CHANNEL_URL = 'http://localhost:8080/channel.html';
const APP_ID = '229702';
const LOGNS = 'DS::';

const EVENTS = [
  'current_track',
  'player_paused',
  'tracklist_changed',
  'player_play'
];

declare var DZ: any;

@Injectable()
export class DeezerService {

  private eventSource = new Subject<AppEvent>();
  private loaded: boolean = false;

  events$ = this.eventSource.asObservable();

  constructor() {
  }

  /**
   * Load and initialize the Deezer JS API
   */
  initialize = (): Observable<boolean> => {
    return Observable.create((observer) => {
      if (!this.loaded) {

        window.dzAsyncInit = () => {

          DZ.init({
            appId: APP_ID,
            channelUrl: CHANNEL_URL,
            player: true
          });

          DZ.Event.subscribe('player_loaded', () => {
            console.log(LOGNS, 'Init done');
            this.loaded = true;
            for (let evt of EVENTS) {
              DZ.Event.subscribe(evt, this.playerNotification);
            }
            observer.next(true);
          });
        };

        const e = document.createElement('script');
        e.src = 'https://e-cdns-files.dzcdn.net/js/min/dz.js';
        e.async = true;
        document.getElementById('dz-root').appendChild(e);
      } else {
        observer.next(true);
      }
    });
  };

  /**
   * Search for playlists corresponding to the given keyword
   */
  playlistSearch = (key: string): Observable<Playlist[]> => {
    console.log(LOGNS, `Searching for playlist with ${key}`);
    return Observable.create((observer) => {
      this.initialize().subscribe((done: boolean) => {
        DZ.api('/search/playlist?q=' + encodeURIComponent(key), (response) => {
          if (response.data) {
            console.log(LOGNS, `${response.data.length} playlists received`);
            // Convert the received data into a Playlist objects list
            const playlists = response.data.map((data) => this.convertPlaylist(data));
            observer.next(playlists);
          } else {
            const message = response.error ? response.error.message : 'error';
            console.log(LOGNS, 'Playlist search error', message);
            observer.throw(message);
          }
        });
      });
    });
  };

  /**
   * Select and play the requested playlist
   */
  playlistPlay = (id: number, index: number = 0): Observable<Track[]> => {
    console.log(LOGNS, `Playing playlist ${id} / ${index}`);
    return Observable.create((observer) => {
      this.initialize().subscribe((done: boolean) => {
        DZ.player.playPlaylist(id, index, (response) => {
          if (response.tracks) {
            // Convert the received data into a Track objects list
            const tracks = response.tracks.map((data) => this.convertTrack(data));
            observer.next(tracks);
          } else {
            const message = response.error ? response.error.message : 'error';
            console.log(LOGNS, 'Playlist play error', message);
            observer.throw(message);
          }
        });
      });
    });
  };

  /**
   * DZ player commands
   */
  trackNext = (): void => {
    this.initialize().subscribe((done: boolean) => {
      DZ.player.next();
    });
  };

  trackPlay = (): void => {
    this.initialize().subscribe((done: boolean) => {
      DZ.player.play();
    });
  };

  trackPause = (): void => {
    this.initialize().subscribe((done: boolean) => {
      DZ.player.pause();
    });
  }

  /**
   * Receive DZ player notifications
   */
  playerNotification = (data: any, event: any): void => {
    console.log(LOGNS, event);
    switch (event) {
      case 'current_track':
        this.eventSource.next(new TrackNewEvent(this.convertTrack(data.track)));
        break;
      case 'player_paused':
        this.eventSource.next(new TrackPauseEvent());
        break;
      case 'player_play':
        this.eventSource.next(new TrackPlayEvent());
        break;
    }
  };

  /**
   * Convert Deezer playlist into internal one
   * @param data
   */
  convertPlaylist = (data): Playlist => {
    const playlist: Playlist = {
      id: data.id,
      title: data.title,
      tracksCount: data.nb_tracks,
      pictureUrl: data.picture_medium
    };
    return playlist;
  };

  /**
   * Convert Deezer track into internal one
   * @param data
   */
  convertTrack = (data): Track => {
    const track: Track = {
      id: data.id,
      title: data.title,
      artistName: data.artist.name,
      albumTitle: data.album.title
    };
    return track;
  };

}