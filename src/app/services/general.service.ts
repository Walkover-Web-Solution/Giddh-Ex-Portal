import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { GiddhErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/general.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";

@Injectable()
export class GeneralService {

  constructor(private errorHandler: GiddhErrorHandler, private http: HttpWrapperService) {
  }

  public getLastPaymentMade(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    };
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.post(
      API.VOUCHERS_WITH_LAST_PAYMENT_MODE
        .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
        .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
        .replace(':type', encodeURIComponent(model.type))
        .replace(':page', encodeURIComponent(model.page))
        .replace(':count', encodeURIComponent(model.count))
        .replace(':sort', encodeURIComponent(''))
        .replace(':sortBy', encodeURIComponent(model.sortBy)),
      '', // This is the request body, you can replace it with the actual body if needed
      args
    ).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e))
    );
  }

  public getInvoiceList(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    };
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.post(
      API.VOUCHERS_WITH_LAST_PAYMENT_MODE
        .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
        .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
        .replace(':type', encodeURIComponent(model.type))
        .replace(':page', encodeURIComponent(model.page))
        .replace(':count', encodeURIComponent(model.count))
        .replace(':sort', encodeURIComponent(model.sort))
        .replace(':sortBy', encodeURIComponent(model.sortBy)),
      model, // This is the request body, you can replace it with the actual body if needed
      args
    ).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        data.request = model;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e))
    );
  }

  public getCompanyDetails(model: any): Observable<BaseResponse<any, any>> {
    let data = {
      companyUniqueName: model.companyUniqueName,
      accountUniqueName: model.accountUniqueName,
    }
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.get(API.GET_COMPANY_DETAILS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
      map((res) => {
        let data: BaseResponse<any, string> = res;
        data.queryString = { data };
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
  }

  public downloadVoucher(model: any): Observable<BaseResponse<any, any>> {
    let voucherUniqueName = [model.voucherUniqueName];
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.post(API.DOWNLOAD_VOUCHER?.replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName)), voucherUniqueName, args).pipe(
      map((res) => {
        let data: BaseResponse<any, any> = res;
        data.request = voucherUniqueName;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
    );
  }

  public base64ToBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    let offset = 0;
    if (byteCharacters && byteCharacters.length > 0) {
      while (offset < byteCharacters?.length) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);
        let byteNumbers = new Array(slice?.length);
        let i = 0;
        while (i < slice?.length) {
          byteNumbers[i] = slice.charCodeAt(i);
          i++;
        }
        let byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
        offset += sliceSize;
      }
    }
    return new Blob(byteArrays, { type: contentType });
  }

  public getVoucherDetails(model: any): Observable<BaseResponse<any, any>> {
    let args: any = { headers: {} };
    args.headers['Session-id'] = model?.sessionId;
    return this.http.post(API.GET_VOUCHER_DETAILS?.replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName)), [model.voucherUniqueName], args).pipe(
      map((res) => {
        let data: BaseResponse<any, any> = res;
        return data;
      }),
      catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
    );
  }


}
