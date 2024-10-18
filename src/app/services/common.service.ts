import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";
import { API } from "./apiurls/common.api";
import { ApiService } from "./api.service";
@Injectable()
export class CommonService {
    private apiUrl: string = '';
    constructor(private errorHandler: PortalErrorHandler, private http: HttpWrapperService, private apiService: ApiService) {
        this.apiUrl = this.apiService.getApiUrl();
    }
    /**
     * This will be use for page wise count page
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof CommonService
     */
    public getVoucherCountPage(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            vendorUniqueName: model.vendorUniqueName,
            page: model.page
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(
            this.apiUrl + API.GET_COUNT_PAGE
                .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
                .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
                .replace(':vendorUniqueName', encodeURIComponent(data.vendorUniqueName))
                .replace(':page', encodeURIComponent(data.page)),
            '', args
        ).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e))
        );
    }

    /**
     * This will be use for voucher set count page
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof CommonService
     */
    public setVoucherCountPage(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            vendorUniqueName: model.vendorUniqueName,
            page: model.page,
            count: model.count
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(
            this.apiUrl + API.SET_COUNT_PAGE
                .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
                .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
                .replace(':vendorUniqueName', encodeURIComponent(data.vendorUniqueName))
                .replace(':page', encodeURIComponent(data.page))
                .replace(':count', encodeURIComponent(data.count)),
            '', args
        ).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e))
        );
    }
}
