import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import {
  EventsService,
  AppEvent,
  MeteoEvent,
  PlayEvent,
  StopEvent,
  ToastEvent,
  LoadEvent
} from '../../services/events';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  subscription: Subscription;
  loading: boolean = false;

  constructor(
    private zone: NgZone,
    private router: Router,
    private events: EventsService
  ) {
    this.subscription = this.events.events$.subscribe(this.onEvent);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onEvent = (event: AppEvent): void => {
    console.log('Event:', event.type, event.value);
    if (event instanceof MeteoEvent) {
      this.router.navigate(['playlists', event.value]);
    } else if (event instanceof PlayEvent) {
      this.router.navigate(['tracks', event.value]);
    } else if (event instanceof StopEvent) {
      this.router.navigate(['']);
    } else if (event instanceof ToastEvent) {
      this.showToast(event.value);
      this.showLoading(false);
    } else if (event instanceof LoadEvent) {
      this.showLoading(event.value);
    } else {
      console.log('Unknown event');
    }
  };

  showLoading = (show: boolean): void => {
    setTimeout(() => this.zone.run(() => this.loading = show));
  }

  showToast = (message: string): void => {
    const snackbarContainer: any = document.querySelector('.mdl-snackbar');
    if (snackbarContainer && snackbarContainer.MaterialSnackbar) {
      snackbarContainer.MaterialSnackbar.showSnackbar({
        message: message
      });
    }
  }
}
