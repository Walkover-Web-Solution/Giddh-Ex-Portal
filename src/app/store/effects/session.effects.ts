import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import * as fromApp from '../reducer/session.reducer';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { logoutUser, resetLocalStorage } from '../actions/session.action';
import { GeneralService } from 'src/app/services/general.service';
import { Router } from '@angular/router';

@Injectable()
export class SessionEffects {
    /** Hold  store data */
    public storeData: any = {};
    /* Hold user details from localStorage*/
    public portalDomain: string = '';

    constructor(private actions$: Actions, private store: Store<fromApp.SessionState>, private authService: AuthService, private generalService: GeneralService, private router: Router) {
        this.store.pipe(select(state => state)).subscribe((sessionState: any) => {
            this.storeData = sessionState.session;
            this.portalDomain = this.storeData?.domain;
        });
    }

    /**
     * This will be use for logout user
     *
     * @memberof SessionEffects
     */
    public logoutUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logoutUser),
            switchMap((action: any) =>
                this.authService.logoutUser(action).pipe(
                    tap((response: any) => {
                        if (response?.status === 'error') {
                            this.generalService.showSnackbar(response?.message);
                            if (response?.code === 'SESSION_EXPIRED_OR_INVALID' || response?.code === 'INVALID_SESSION_ID') {
                                const url = this.portalDomain + '/login';
                                this.router.navigate([url]);
                                this.store.dispatch(resetLocalStorage());
                            }
                        } else {
                            this.generalService.showSnackbar('You have successfully logged out.');
                            const url = this.portalDomain + '/login';
                            this.router.navigate([url]);
                            this.store.dispatch(resetLocalStorage());
                        }
                    }),
                    catchError(error => EMPTY)
                )
            )
        ), { dispatch: false }
    );
}
