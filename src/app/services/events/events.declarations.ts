export class AppEvent {
  
  public type: string;
  public value: any;

  constructor(type: string, value: any = null) {
    this.type = type;
    this.value = value;
  }
};

export class MeteoEvent extends AppEvent {  
  constructor(key: string) {
    super('meteo', key);
  }
};

export class PlayEvent extends AppEvent {  
  constructor(id: number) {
    super('play', id);
  }
};

export class StopEvent extends AppEvent {  
  constructor() {
    super('stop');
  }
};

export class LoadEvent extends AppEvent {  
  constructor(load: boolean) {
    super('load', load);
  }
};

export class ToastEvent extends AppEvent {  
  constructor(message: string) {
    super('toast', message);
  }
};

export class TrackNewEvent extends AppEvent {
  constructor(track: any) {
    super('track', track);
  }
};

export class TrackPauseEvent extends AppEvent {
  constructor() {
    super('pause');
  }
};

export class TrackPlayEvent extends AppEvent {
  constructor() {
    super('play');
  }
};
