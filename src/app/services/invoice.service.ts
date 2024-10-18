import { Injectable } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from './catch-manager/catchmanger';
import { catchError, map } from "rxjs/operators";
import { BaseResponse } from "../models/BaseResponse";
import { Observable } from "rxjs";
import { WELCOME_API } from "./apiurls/welcome.api";
import { API } from "./apiurls/invoice.api";
import { ApiService } from "./api.service";
@Injectable()
export class InvoiceService {
    private apiUrl: string = '';
    constructor(private errorHandler: PortalErrorHandler, private http: HttpWrapperService, private apiService: ApiService) {
        this.apiUrl = this.apiService.getApiUrl();
    }

    /**
    *
    *
    * @param {*} model
    * @return {*}  {Observable<BaseResponse<any, any>>}
    * @memberof InvoiceService
    */
    public getInvoiceList(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            balanceStatus: model.balanceStatus,
            uniqueNames: model.uniqueNames ? [model.uniqueNames] : []
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
                .replace(':sort', encodeURIComponent(model.sort))
                .replace(':sortBy', encodeURIComponent(model.sortBy)),
            data,
            args
        ).pipe(
            map((res) => {
                let data: BaseResponse<any, string> = res;
                data.queryString = { data };
                data.request = data.body;
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<any, any>(e))
        );
    }

    /**
     * This will be use for donwload voucher
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public downloadVoucher(model: any): Observable<BaseResponse<any, any>> {
        let voucherUniqueName = [model.voucherUniqueName];
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.post(this.apiUrl + API.DOWNLOAD_VOUCHER?.replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName)), voucherUniqueName, args).pipe(
            map((res) => {
                let data: BaseResponse<any, any> = res;
                data.request = voucherUniqueName;
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
        );
    }

    /**
     * This will be use for get voucher details
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public getVoucherDetails(model: any): Observable<BaseResponse<any, any>> {
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId ?? '';
        if (!model.paymentId) {
            model.paymentId = "";
        }

        return this.http.post(this.apiUrl + API.GET_VOUCHER_DETAILS?.replace(':companyUniqueName', encodeURIComponent(model.companyUniqueName))?.replace(':accountUniqueName', encodeURIComponent(model.accountUniqueName))?.replace(':paymentMethod', encodeURIComponent(model.paymentMethod))?.replace(':paymentId', encodeURIComponent(model.paymentId)), model.voucherUniqueName, args).pipe(
            map((res) => {
                let data: BaseResponse<any, any> = res;
                return data;
            }),
            catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
        );
    }

    /**
     * This will be use for get comments
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public getInvoiceComments(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            voucherUniqueName: model.voucherUniqueName
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.get(
            this.apiUrl + API.GET_COMMENTS
                .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
                .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
                .replace(':voucherUniqueName', encodeURIComponent(data.voucherUniqueName)),
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
     * This will be use for get comments
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public getPaymentMethods(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId ?? '';
        return this.http.get(
            this.apiUrl + API.GET_PAYMENT_METHODS
                .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
                .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName)),
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
     * This will be use for add comments
     *
     * @param {*} model
     * @param {string} comment
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public addComments(model: any, comment: string): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            voucherUniqueName: model.voucherUniqueName
        }
        let request = {
            description: comment
        }
        let args: any = { headers: {} };
        args.headers['Session-id'] = model?.sessionId;
        return this.http.post(this.apiUrl + API.ADD_COMMENTS
            .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
            .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
            .replace(':voucherUniqueName', encodeURIComponent(data.voucherUniqueName)),
            request, args).pipe(
                map((res) => {
                    let data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                }),
                catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
            );
    }

    /**
     * This will be use for pay  voucher
     *
     * @param {*} model
     * @param {*} request
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public payInvoice(model: any, request: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            paymentId: model.paymentId
        }
        return this.http.post(this.apiUrl + API.PAY_VOUCHER
            .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
            .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
            .replace(':paymentId', encodeURIComponent(data.paymentId)),
            request).pipe(
                map((res) => {
                    let data: BaseResponse<any, any> = res;
                    data.request = request;
                    return data;
                }),
                catchError((e) => this.errorHandler.HandleCatch<string, any>(e))
            );
    }

    /**
     * This will be use for get voucher details if user is not logged in
     *
     * @param {*} model
     * @return {*}  {Observable<BaseResponse<any, any>>}
     * @memberof InvoiceService
     */
    public getVoucherDetailsFromWithoutSession(model: any): Observable<BaseResponse<any, any>> {
        let data = {
            companyUniqueName: model.companyUniqueName,
            accountUniqueName: model.accountUniqueName,
            voucherUniqueName: model.voucherUniqueName
        }
        return this.http.get(
            this.apiUrl + API.GET_VOUCHER_LIST
                .replace(':companyUniqueName', encodeURIComponent(data.companyUniqueName))
                .replace(':accountUniqueName', encodeURIComponent(data.accountUniqueName))
                .replace(':voucherUniqueName', encodeURIComponent(data.voucherUniqueName)),
            '', ''
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
