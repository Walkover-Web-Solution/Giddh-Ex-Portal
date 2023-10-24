import { BaseResponse } from "src/app/models/BaseResponse";
import { UserDetails, VerifyEmailResponseModel } from "src/app/models/loginModels";
import { CustomActions } from "../custom-actions";
import { LoginActions } from "src/app/store/actions/login.action";
import { CompanyActions } from '../actions/company.actions';
import { User } from "src/app/models/Company";
import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/session.action';


export interface SessionState {
  user?: VerifyEmailResponseModel;
  activeCompany: any;
}

export interface UserState {
  user: User | null;
}
const sessionInitialState: SessionState = {
  user: null,
  activeCompany: null,
};
const initialState: UserState = {
  user: JSON.parse(sessionStorage.getItem('user')) || null,
};
const _userReducer = createReducer(
  initialState,
  on(UserActions.login, (state, { user }) => ({ user })),
  on(UserActions.logout, () => ({ user: null }))
);
export function SessionReducer(state: SessionState = sessionInitialState, action: CustomActions): SessionState {

  switch (action.type) {
    case LoginActions.FetchUserDetailsResponse:
      let userResp: BaseResponse<UserDetails, string> = action.payload;
      if (userResp?.status === 'success') {
        return {
          ...state,
          user: {
            ...state?.user,
            user: userResp.body
          }
        };
      } else {
        return state;
      }

    case CompanyActions.SET_ACTIVE_COMPANY_DATA: {
      delete action.payload.activeFinancialYear;
      return Object.assign({}, state, {
        activeCompany: action.payload
      });
    }
    default:
      return state;
  }
}
export function userReducer(state: UserState | undefined, action: any) {
  return _userReducer(state, action);
}
