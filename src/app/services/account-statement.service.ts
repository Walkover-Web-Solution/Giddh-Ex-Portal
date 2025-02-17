import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { API } from "./apiurls/account-statement.api";

@Injectable()
export class AccountStatementService {
    private apiUrl: string = '';

    constructor(private errorHandler: PortalErrorHandler, private http: HttpWrapperService, private apiService: ApiService) {
        this.apiUrl = this.apiService.getApiUrl();
    }

    /**
    * Get Account Statement List API
    *
    * @param {*} model
    * @return {*}  {Observable<BaseResponse<any, any>>}
    * @memberof AccountStatementService
    */
    public getAccountStatementList(model: any): Observable<BaseResponse<any, any>> {
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(
            this.apiUrl + API.GET_ACCOUNT_STATEMENT
                .replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))
                .replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName))
                .replace(':count', encodeURIComponent(model.count))
                .replace(':page', encodeURIComponent(model.page))
                .replace(':from', encodeURIComponent(model.from))
                .replace(':to', encodeURIComponent(model.to))
                .replace(':sort', encodeURIComponent(model.sort)),
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
