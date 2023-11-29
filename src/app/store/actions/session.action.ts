// session.actions.ts
import { createAction, props } from '@ngrx/store';
import { BaseResponse } from 'src/app/models/BaseResponse';

export const setPortalDomain = createAction(
  '[Domain] Set Portal Domain',
  props<{ domain: any }>()
);

export const setSessionToken = createAction(
  '[Session] Set Session Token',
  props<{ session: any }>()
);

export const setCompanyDetails = createAction(
    '[Session] Set Company Details',
    props<{ companyDetails: any }>()
);

export const setUserDetails = createAction(
  '[Session] Set User Details',
  props<{ userDetails: any }>()
);

export const setPortalUserDetails = createAction(
    '[Session] Set Portal User Details',
    props<{ portalDetails: any }>()
);
export const resetLocalStorage = createAction(
    '[Session] Reset Local Storage');

// export const logoutUser = createAction(
//     '[Auth] Logout User',
//     props<{ model: any }>()
// );

// export const logoutUserSuccess = createAction(
//     '[Auth] Logout User Success',
//     props<{ response: BaseResponse<any, any> }>()
// );

// export const logoutUserFailure = createAction(
//     '[Auth] Logout User Failure',
//     props<{ error: any }>()
// );
