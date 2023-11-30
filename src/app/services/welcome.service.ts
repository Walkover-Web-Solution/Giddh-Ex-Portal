import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";
import { WELCOME_API } from "./apiurls/welcome.api";
import { environment } from "src/environments/environment";

@Injectable()
export class WelcomeService {

    private apiUrl: string = '';

    constructor(private errorHandler: PortalErrorHandler, private http: HttpWrapperService) {
        this.apiUrl = environment.apiUrl;
    }

    /**
     * This will be use for get last payment made
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof GeneralService
     */
    public getLastPaymentMade(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
        };
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.post(
            this.apiUrl + WELCOME_API.VOUCHERS_WITH_LAST_PAYMENT_MODE
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

    /**
     * This will be use for get company details
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof GeneralService
     */
    public getCompanyDetails(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(this.apiUrl + WELCOME_API.GET_COMPANY_DETAILS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)), '', args).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
    }

    /**
 * This will be use for get portal user details
 *
 * @param {*} model
 * @return {*}  {Observable<BaseResponse<any, any>>}
 * @memberof GeneralService
 */
    public getPortalUserDetails(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            vendorUniqueName: model.vendorUniqueName
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(this.apiUrl + WELCOME_API.GET_PORTAL_USER_DETAILS?.replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))?.replace(':vendorUniqueName', encodeURIComponent(data.vendorUniqueName)), '', args).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e)));
    }
}
