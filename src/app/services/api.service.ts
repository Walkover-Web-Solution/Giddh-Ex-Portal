import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiService {
  /** Hold api url */
  private apiUrl: string = environment.apiUrl;

  constructor() {
    this.apiUrl = localStorage.getItem('country-region') === 'uk' ? environment.ukApiUrl : environment.apiUrl;
  }

  /**
   * This will be use for set api url according to region
   *
   * @param {(string | null)} region
   * @memberof ApiService
   */
  public setApiUrl(region: string | null): void {
    if (region === 'uk') {
      this.apiUrl = environment.ukApiUrl;
    } else {
      this.apiUrl = environment.apiUrl;
    }
  }

  /**
   * Getter for Api URL
   *
   * @return {*}  {string}
   * @memberof ApiService
   */
  public getApiUrl(): string {
    return this.apiUrl;
  }
}


