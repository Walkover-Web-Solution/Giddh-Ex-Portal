import { Action, Store, select } from '@ngrx/store';
import { CompanyActions } from './company.actions';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class LoginActions {

  public static FetchUserDetails = 'FetchUserDetails';
  public static FetchUserDetailsResponse = 'FetchUserDetailsResponse';
  constructor(
    public _router: Router,
    private actions$: Actions,
  ) {
  }

  // public FectchUserDetails$: Observable<Action> = createEffect(() => this.actions$
  //     .pipe(
  //         ofType(LoginActions.FetchUserDetails),
  //       switchMap((action: CustomActions) => this.service.FetchUserDetails()),
  //         map(response => this.FetchUserDetailsResponse(response))));

  // public FectchUserDetailsResponse$: Observable<Action> = createEffect(() => this.actions$
  //     .pipe(
  //         ofType(LoginActions.FetchUserDetailsResponse),
  //         map((action: CustomActions) => {
  //             if (action.payload && action.payload.status === 'error') {
  //                 // this._toaster.errorToast(action.payload.message, action.payload.code);
  //             }
  //             return { type: 'EmptyAction' };
  //         })));


  // public ResetApplicationData(): CustomActions {
  //   return {
  //     type: COMMON_ACTIONS.RESET_APPLICATION_DATA
  //   };
  // }

  // public FetchUserDetails(): CustomActions {
  //   return {
  //     type: LoginActions.FetchUserDetails
  //   };
  // }

  // public FetchUserDetailsResponse(resp: BaseResponse<UserDetails, string>): CustomActions {
  //   return {
  //     type: LoginActions.FetchUserDetailsResponse,
  //     payload: resp
  //   };
  // }

}
