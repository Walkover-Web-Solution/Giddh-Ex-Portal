import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { GeneralService } from './general.service';
import { catchError, retryWhen, tap } from 'rxjs/operators';

@Injectable()
export class PortalHttpInterceptor implements HttpInterceptor {
    /** Hold of online status */
    private isOnline: boolean = true;

    constructor(
        private generalService: GeneralService
    ) {

        window.addEventListener('online', () => {
            this.isOnline = true;
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.isOnline) {
            /** Holds api call retry limit */
            let retryLimit: number = 1;
            /** Holds api call retry attempts */
            let retryAttempts: number = 0;

            return next.handle(request).pipe(
                // retryWhen operator should come before catchError operator as it is more specific
                retryWhen(errors => errors.pipe(
                    // inside the retryWhen, use a tap operator to throw an error
                    // if you don't want to retry
                    tap(error => {
                        if (!error.headers.get("retry-after") || retryAttempts >= retryLimit) {
                            throw error;
                        } else {
                            retryAttempts++;
                        }
                    })
                )),
                // now catch all other errors
                catchError((error) => {
                    return throwError(error);
                })
            );
        } else {
            setTimeout(() => {
                this.generalService.showSnackbar("Please check your internet connection.", "Internet disconnected");
            }, 100);
            if (request.body && request.body.handleNetworkDisconnection) {
                return of(new HttpResponse({ status: 200, body: { status: 'no-network' } }));
            } else {
                return of();
            }
        }
    }
}
