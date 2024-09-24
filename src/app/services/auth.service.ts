import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { API } from "./apiurls/auth.api";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiService } from "./api.service";

@Injectable()
export class AuthService {
    private apiUrl: string = '';
    private proxyUrl: string = '';
    constructor(private errorHandler: PortalErrorHandler, private http: HttpWrapperService, private apiService: ApiService) {
        this.apiUrl = this.apiService.getApiUrl();
        this.proxyUrl = environment.proxyUrl;
    }

    /**
     * This will be use for authentication with proxy
     *
     * @param {string} proxyAuthToken
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof AuthService
     */
    public authenticateProxy(proxyAuthToken: string): Observable<BaseResponse<any, any>> {
        return this.http.portalLogin(this.proxyUrl + API.GET_PROXY, proxyAuthToken).pipe(
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
        return this.http.post(this.apiUrl + API.VERIFY_PORTAL, model).pipe(
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
        return this.http.post(this.apiUrl + API.SAVE_PORTAL_SESSION, model).pipe(
            map((res) => {
                let data: BaseResponse<any, any> = res;
                data.request = model;
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
        );
    }

    /**
     * This will be use for renew session token
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof AuthService
     */
    public logoutUser(model: any): Observable<BaseResponse<any, any>> {
        let request = {
            accountUniqueName: model?.accountUniqueName,
            companyUniqueName: model?.companyUniqueName,
            sessionId: model?.sessionId
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = request?.sessionId;
        return this.http.delete(this.apiUrl + API.LOGOUT_USER?.replace(':companyUniqueName', encodeURIComponent(request.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(request.accountUniqueName)), '', args).pipe(map((res) => {
            let data: BaseResponse<any, any> = res;
            data.request = request;
            return data;
        }), catchError((e) => this.errorHandler.HandleCatch<string, any>(e, request)));
    }

    /**
     * This will be use for renew user session
     *
     * @param {string} userUniqueName
     * @param {string} sessionId
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof AuthService
     */
    public renewSession(userUniqueName: string, sessionId: string): Observable<BaseResponse<any, any>> {
        let args: any = { headers: {} };
        args.headers['Session-id'] = sessionId;
        return this.http.put(this.apiUrl + API.RENEW_SESSION?.replace(':userUniqueName', encodeURIComponent(userUniqueName)), null, args).pipe(map((res) => {
            let data: BaseResponse<string, any> = res;
            return data;
        }), catchError((e) => this.errorHandler.HandleCatch<string, any>(e)));
    }

}
