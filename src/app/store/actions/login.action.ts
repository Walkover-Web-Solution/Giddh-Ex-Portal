import { Action, Store, select } from '@ngrx/store';
import { CompanyActions } from './company.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { COMMON_ACTIONS } from './common.const';
import { AppState } from '..';
import { Injectable, NgZone } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { OrganizationType, userLoginStateEnum } from '../../models/user-login-state';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CompanyService } from '../../services/company.service';
import { GeneralService } from '../../services/general.service';
import { Observable, zip as observableZip } from 'rxjs';
import { CustomActions } from '../custom-actions';
import { BaseResponse } from '../../models/BaseResponse';
import { UserDetails } from '../../models/loginModels';

@Injectable()
export class LoginActions {

  public static FetchUserDetails = 'FetchUserDetails';
  public static FetchUserDetailsResponse = 'FetchUserDetailsResponse';
  constructor(
    public _router: Router,
    private actions$: Actions,
    private service: CompanyService,
  ) {
  }

  public FectchUserDetails$: Observable<Action> = createEffect(() => this.actions$
      .pipe(
          ofType(LoginActions.FetchUserDetails),
        switchMap((action: CustomActions) => this.service.FetchUserDetails()),
          map(response => this.FetchUserDetailsResponse(response))));

  public FectchUserDetailsResponse$: Observable<Action> = createEffect(() => this.actions$
      .pipe(
          ofType(LoginActions.FetchUserDetailsResponse),
          map((action: CustomActions) => {
              if (action.payload && action.payload.status === 'error') {
                  // this._toaster.errorToast(action.payload.message, action.payload.code);
              }
              return { type: 'EmptyAction' };
          })));


  public ResetApplicationData(): CustomActions {
    return {
      type: COMMON_ACTIONS.RESET_APPLICATION_DATA
    };
  }

  public FetchUserDetails(): CustomActions {
    return {
      type: LoginActions.FetchUserDetails
    };
  }

  public FetchUserDetailsResponse(resp: BaseResponse<UserDetails, string>): CustomActions {
    return {
      type: LoginActions.FetchUserDetailsResponse,
      payload: resp
    };
  }

}
