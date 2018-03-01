import { Component, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';

import 'rxjs/add/operator/first';

import { EventsService, MeteoEvent, LoadEvent, ToastEvent } from '../../services/events';
import { WeatherService, WeatherInfo } from '../../services/weather';

@Component({
  selector: 'weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent {

  info: WeatherInfo;

  constructor(
    private zone: NgZone,
    private weather: WeatherService,
    private events: EventsService
  ) {
  }

  /**
   * Get current weather for the supplied city
   */
  getWeather = (form: NgForm): void => {
    this.events.emit(new LoadEvent(true));
    // Get meteo data for the requested city
    this.weather
      .get(form.value.query)
      .first()
      .subscribe((info): void => {
        this.zone.run(() => this.info = info);
        // Request music playlists based on this weather
        this.events.emit(new MeteoEvent(this.info.meteo));
      }, (error): void => {
        this.events.emit(new ToastEvent(error));
      }, (): void => {
        this.events.emit(new LoadEvent(false));
      });
  };

}
