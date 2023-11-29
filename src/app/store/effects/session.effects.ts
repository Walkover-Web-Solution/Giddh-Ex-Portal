import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import * as fromApp from '../reducer/session.reducer';
// import { logoutUser, logoutUserFailure, logoutUserSuccess } from '../actions/session.action';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class SessionEffects {
    constructor(private actions$: Actions, private store: Store<fromApp.SessionState>, private authService: AuthService) { }
    // logoutUser$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(logoutUser),
    //         mergeMap(action =>
    //             this.authService.logoutUser(action).pipe(
    //                 map(response => logoutUserSuccess({ response })),
    //                 catchError(error => of(logoutUserFailure({ error })))
    //             )
    //         )
    //     )
    // );
}
