import { Injectable } from '@angular/core';

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
  'player_loaded',
  'current_track',
  'player_paused',
  'tracklist_changed',
  'player_play'
];

declare var DZ: any;

@Injectable()
export class DeezerService {

  private eventSource = new Subject<AppEvent>();
  private initialized: boolean = false;
  private loaded: boolean = false;

  events$ = this.eventSource.asObservable();
  
  constructor() {

    if (!this.initialized) {

      console.debug(LOGNS, 'Initializing');
      this.initialized = true;
     
      DZ.init({
        appId: APP_ID,
        channelUrl: CHANNEL_URL,
        player: true
      });

      for (let evt of EVENTS) {
        DZ.Event.subscribe(evt, (data, event) => this.playerNotification(data, event));
      }

      console.debug(LOGNS, 'Init done');
    }
  }

  /**
   * Log to the DZ service (not used for the moment)
   */
  login = (): Observable<any> => {
    var observable = Observable.create((observer) => {

      DZ.login((response) => {
        if (response.authResponse) {
          console.debug(LOGNS, 'logged');
          observer.next(response.data);
        } else {
          console.debug(LOGNS, 'not logged');
          observer.throw(response.data);
        }
      }, {
        scope: 'manage_library,basic_access'
      });
    });

    return observable;
  };

  /**
   * Search for playlists corresponding to the given keyword
   */
  playlistSearch = (key: string): Observable<Playlist[]> => {

    console.debug(LOGNS, `Searching for playlist with ${key}`);

    var observable = Observable.create((observer) => {

      var get = () => {
        DZ.api('/search/playlist?q=' + encodeURIComponent(key), (response) => {
          if (response.data) {
            console.debug(LOGNS, `${response.data.length} playlists received`);
            // Convert the received data into a Playlist objects list
            let playlists = response.data.map((data) => {
              return this.convertPlaylist(data);
            });
            observer.next(playlists);
          } else {
            var message = response.error ? response.error.message : 'error';
            console.debug(LOGNS, 'Playlist search error', message);
            observer.throw(message);
          }
        });
      };

      if (this.loaded) {
        get();
      } else {
        console.debug(LOGNS, 'Waiting for player loaded');
        DZ.Event.subscribe('player_loaded', () => get(), true);
      }
    });

    return observable;
  };

  /**
   * Select and play the requested playlist
   */
  playlistPlay = (id: number, index: number = 0): Observable<Track[]> => {

    console.debug(LOGNS, `Playing playlist ${id} / ${index}`);

    var observable = Observable.create((observer) => {

      var get = () => {
        DZ.player.playPlaylist(id, index, (response) => {
          if (response.tracks) {
            // Convert the received data into a Track objects list
            let tracks = response.tracks.map((data) => {
              return this.convertTrack(data);
            });
            observer.next(tracks);
          } else {
            var message = response.error ? response.error.message : 'error';
            console.debug(LOGNS, 'Playlist play error', message);
            observer.throw(message);
          }
        });
      };

      if (this.loaded) {
        get();
      } else {
        console.debug(LOGNS, 'Waiting for player loaded');
        DZ.Event.subscribe('player_loaded', () => get(), true);
      }
    });

    return observable;
  };

  /**
   * DZ player commands
   */
  trackNext = (): void => {
    DZ.player.next();
  };

  trackPlay = (): void => {
    DZ.player.play();
  };

  trackPause = (): void => {
    DZ.player.pause();
  }

  /**
   * Receive DZ player notifications
   */
  playerNotification = (data: any, event: any): void => {

    console.debug(LOGNS, event);

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
      case 'player_loaded':
        this.loaded = true;
        break;
    }
  };

  /**
   * Convert Deezer playlist into internal one
   * @param data
   */
  convertPlaylist = (data): Playlist => {
    let playlist: Playlist = {
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
    let track: Track = {
      id: data.id,
      title: data.title,
      artistName: data.artist.name,
      albumTitle: data.album.title
    };
    return track;    
  };

}