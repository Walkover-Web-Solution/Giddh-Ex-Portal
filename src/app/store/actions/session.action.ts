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
  '[Session] Set User Details',
  props<{ userDetails: any }>()
);

export const setPortalUserDetails = createAction(
    '[Session] Set Portal User Details',
    props<{ portalDetails: any }>()
);
export const resetLocalStorage = createAction(
    '[Session] Reset Local Storage');

export const logoutUser = createAction(
    '[Auth] Logout User',
    props<{ user: any }>()
);

export const setSidebarState = createAction(
    '[Session] Set Sidebar state',
    props<{ sidebarState: any }>()
);

export const setRouterState = createAction(
    '[Session] Set Invoice Preview URL',
    props<{ url: any }>()
);
