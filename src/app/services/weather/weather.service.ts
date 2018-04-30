import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { WeatherInfo } from './weather.declarations';

const API_URL = "http://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const API_KEY = "2c8c22e7283717b657e8dd338db9fc51";
const LOGNS = 'WS::';

@Injectable()
export class WeatherService {

  constructor(private http: Http) { }

  /**
   * Request the weather for the given city
   */
  get = (city: string): Observable<WeatherInfo> => {

    console.log(LOGNS, `requesting ${city} weather`);

    return this.http.get(API_URL + city + "&APPID=" + API_KEY)

      .map((res: Response): WeatherInfo => {
        let body = res.json() || {};
        let info: WeatherInfo = {
          name: body.name,
          temperature: body.main.temp,
          meteo: body.weather[0].main,
          description: body.weather[0].description,
          icon: `http://openweathermap.org/img/w/${body.weather[0].icon}.png`
        };
        console.log(LOGNS, city, 'weather is', info.meteo);
        return info;
      })

      .catch((error, caught: Observable<WeatherInfo>) => {
        let errMsg: string;
        if (error instanceof Response) {
          const body = error.json() || '';
          if (body.message) {
            errMsg = body.message;
          } else {
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
            if (body.data) {
              errMsg += body.data.message;
            }
          }
        } else {
          errMsg = error.message ? error.message : error.toString();
        }
        console.error(LOGNS, city, 'weather request error', errMsg);
        return Observable.throw(errMsg);
      });
  }

};
