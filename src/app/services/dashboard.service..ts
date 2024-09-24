import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/dashboard.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable()
export class DashboardService {
    private apiUrl: string = '';
    constructor(private errorHandler: PortalErrorHandler, private http: HttpWrapperService, private apiService: ApiService) {
        this.apiUrl = this.apiService.getApiUrl();
    }

    /**
     * This will be use for port user balance summary
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof DashboardService
     */
    public getBalanceSummary(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(this.apiUrl + API.BALANCE_SUMMARY?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
    }

    /**
     * This will be use for get account details
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof DashboardService
     */
    public getAccountDetails(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(this.apiUrl + API.ACCOUNT_DETAILS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
    }

    /**
     * This will be use for get accounts only
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof DashboardService
     */
    public getAccounts(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(this.apiUrl + API.GET_ACCOUNTS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
    }

}
