import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  public static buildRequestURL(host: string, prefix: string = 'api') {
    return `${host}`;
  }

}
