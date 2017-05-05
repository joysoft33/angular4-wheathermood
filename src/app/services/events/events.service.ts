import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AppEvent } from './events.declarations';

@Injectable()
export class EventsService {

  // Observable event source
  private emitSource = new Subject<AppEvent>();
  // Observable event stream
  events$ = this.emitSource.asObservable();

  // Service message commands
  emit = (event: AppEvent): void => {
    this.emitSource.next(event);
  };
  
}