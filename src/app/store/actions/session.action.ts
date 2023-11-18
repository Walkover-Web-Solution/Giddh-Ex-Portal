// session.actions.ts
import { createAction, props } from '@ngrx/store';

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
  '[User] Set User Details',
  props<{ userDetails: any }>()
);
export const resetLocalStorage = createAction('[Reset] Reset Local Storage');
