import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { GiddhErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/auth.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";

@Injectable()
export class AuthService {
  public options = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'proxy-auth-token': '',
    }
  };
  private companyUniqueName: string;

  constructor(private errorHandler: GiddhErrorHandler, private http: HttpWrapperService) {
  }



  /**
 * This will be use for install shopify app
 *
 * @param {string} shop
 * @param {authRequest} model
 * @return {*}  {Observable<BaseResponse<any, any>>}
 * @memberof GeneralService
 */
  public authenticateProxy(proxyAuthToken: string): Observable<BaseResponse<any, any>> {
    return this.http.portalLogin(API.GET_PROXY, proxyAuthToken).pipe(
      map((res) => {
        let data: BaseResponse<string, any> = res;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e)));
  }

  public verifyPortalLogin(emailId: string, token: string, companyUniqueName: string): Observable<BaseResponse<any, any>> {
    this.options.headers["proxy-auth-token"] = token;
    let dataObj = {
      emailId: emailId
    }
    return this.http.post(API.VERIFY_PORTAL?.replace(':companyUniqueName', encodeURIComponent(companyUniqueName)), dataObj, this.options).pipe(
      map((res) => {
        let data: BaseResponse<string, any> = res;
        data.request = dataObj;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e)));
  }

}
