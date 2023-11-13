import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { GiddhErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/auth.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";

@Injectable()
export class AuthService {

  constructor(private errorHandler: GiddhErrorHandler, private http: HttpWrapperService) {
  }

  /**
   * This will be use for authentication with proxy 
   *
   * @param {string} proxyAuthToken
   * @return {*}  {Observable<BaseResponse<any, any>>}
   * @memberof AuthService
   */
  public authenticateProxy(proxyAuthToken: string): Observable<BaseResponse<any, any>> {
    return this.http.portalLogin(API.GET_PROXY, proxyAuthToken).pipe(
      map((res) => {
        let data: BaseResponse<string, any> = res;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e)));
  }


  /**
   * This will be use for verify protal login
   *
   * @param {string} emailId
   * @param {string} token
   * @param {string} domain
   * @return {*}  {Observable<BaseResponse<any, any>>}
   * @memberof AuthService
   */
  public verifyPortalLogin(model: any): Observable<BaseResponse<any, any>> {
    return this.http.post(API.VERIFY_PORTAL, model).pipe(
      map((res) => {
        let data: BaseResponse<any, any> = res;
        data.request = model;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
    );
  }

  /**
   * This will be use for save portal user login
   *
   * @param {*} model
   * @return {*}  {Observable<BaseResponse<any, any>>}
   * @memberof AuthService
   */
  public savePortalUserSession(model: any): Observable<BaseResponse<any, any>> {
    return this.http.post(API.SAVE_PORTAL_SESSION, model).pipe(
      map((res) => {
        let data: BaseResponse<any, any> = res;
        data.request = model;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
    );
  }

}
