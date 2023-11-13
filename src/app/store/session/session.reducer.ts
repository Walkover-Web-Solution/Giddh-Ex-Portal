import { CustomActions } from "../custom-actions";

/**
 * Keeping Track of the AuthenticationState
 */
// session.reducer.ts
import { createReducer, on } from '@ngrx/store';
import {setPortalDomain, setSessionToken, setUserDetails } from '../actions/session.action';

// session-state.model.ts
export interface SessionState {
  session: any;
  domain: any;
  userDetails: any;
}
export const initialState: SessionState = {
  session: null,
  domain: null,
  userDetails: null
};
export const sessionReducer = createReducer(
  initialState,
  on(setSessionToken, (state, { session }) => ({
    ...state,
    session
  })),
  on(setPortalDomain, (state, { domain }) => ({
    ...state,
    domain
  })),
  on(setUserDetails, (state, { userDetails }) => ({
    ...state,
    userDetails
  }))
);
