import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpWrapperService } from '../http-wrapper.service';
import { BaseResponse } from 'src/app/models/BaseResponse';
import { resetLocalStorage } from 'src/app/store/actions/session.action';
import { Router } from '@angular/router';

@Injectable()
export class PortalErrorHandler {
    /** Hold  store data */
    public storeData: any = {};

    constructor(
        private http: HttpWrapperService,
        private store: Store,
        private router: Router
    ) {
        this.store.pipe(select(state => state)).subscribe((sessionState: any) => {
            this.storeData = sessionState.session;
        });
    }

    public HandleCatch<TResponce, TRequest>(r: HttpErrorResponse, request?: any, queryString?: any): Observable<BaseResponse<TResponce, TRequest>> {
        let data: BaseResponse<TResponce, TRequest> = new BaseResponse<TResponce, TRequest>();
        if (r?.status === 0) {
            data = {
                body: null,
                code: 'Internal Error',
                message: 'something went wrong',
                status: 'error'
            };
            data.request = request;
            data.queryString = queryString;
        } else {
            if (r?.status === 500 ||
                r?.status === 501 ||
                r?.status === 502 ||
                r?.status === 503 ||
                r?.status === 504 ||
                r?.status === 505 ||
                r?.status === 506 ||
                r?.status === 507 ||
                r?.status === 508 ||
                r?.status === 509 ||
                r?.status === 510 ||
                r?.status === 511
            ) {
                data.status = 'error';
                data.message = 'Something went wrong';
                data.body = null;
                data.code = 'Internal Error';
            } else {
                data = r.error as any;
                if (data) {
                    if (data?.code === 'SESSION_EXPIRED_OR_INVALID' || data?.code === 'INVALID_SESSION_ID') {
                        const url = this.storeData.domain + '/login';
                        this.router.navigate([url]);
                        this.store.dispatch(resetLocalStorage());
                    }
                    if (typeof data !== 'string') {
                        data.request = request;
                        data.queryString = queryString;
                    }
                }
            }
        }

        if (typeof data === "string") {
            data = {
                statusCode: r?.status
            };
        } else {
            if (data) {
                data.statusCode = r?.status;
            } else {
                data = {
                    statusCode: r?.status
                };
            }
        }

        return new Observable<BaseResponse<TResponce, TRequest>>((o) => {
            o.next(data);
        });
    }
}
