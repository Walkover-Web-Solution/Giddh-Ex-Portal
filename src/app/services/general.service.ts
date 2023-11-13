import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { GiddhErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/auth.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";

@Injectable()
export class GeneralService {

  constructor(private errorHandler: GiddhErrorHandler, private http: HttpWrapperService) {
  }
  public getBalanceSummary(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    }
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.get(API.BALANCE_SUMMARY?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
  }

  public getAccountDetails(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    }
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.get(API.ACCOUNT_DETAILS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
  }

  public getAccounts(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    }
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.get(API.GET_ACCOUNTS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
  }

  public getLastPaymentMade(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    }
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.get(API.LAST_PAYMENT_MODE?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
  }





}
