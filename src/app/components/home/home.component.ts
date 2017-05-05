import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

import { 
  EventsService,
  AppEvent,
  MeteoEvent,
  PlayEvent,
  StopEvent,
  ToastEvent,
  LoadEvent } from '../../services/events';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  subscription: Subscription;
  loading: boolean;

  constructor(
    private zone: NgZone,
    private router: Router,
    private events: EventsService
  ) {
  }

  ngOnInit() {
    this.subscription = this.events.events$.subscribe(this.onEvent);
    this.loading = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onEvent = (event: AppEvent): void => {

    console.log('Event:', event.type, event.value);

    if (event instanceof MeteoEvent) {
      this.router.navigate(['/playlists', event.value]);
    } else if (event instanceof PlayEvent) {
      this.router.navigate(['/tracks', event.value]);
    } else if (event instanceof StopEvent) {
      this.router.navigate(['/']);
    } else if (event instanceof ToastEvent) {
      this.showToast(event.value);
      this.showLoading(false);
    } else if (event instanceof LoadEvent) {
      this.showLoading(event.value);
    } else {
      console.log('Event unknown');
    }
  };

  showLoading = (show: boolean): void => {
    this.zone.run(() => this.loading = show);
  };

  showToast = (message: string): void => {
    var snackbarContainer: any = document.querySelector('.mdl-snackbar');
    if (snackbarContainer && snackbarContainer.MaterialSnackbar) {
      snackbarContainer.MaterialSnackbar.showSnackbar({
        message: message
      });
    }
  };
}
