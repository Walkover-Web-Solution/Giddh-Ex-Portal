/**
 * Keeping Track of the AuthenticationState
 */
// session.reducer.ts
import { createReducer, on } from '@ngrx/store';
import {resetLocalStorage, setCompanyDetails, setPortalDomain, setPortalUserDetails, setSessionToken, setSidebarState, setUserDetails, } from '../actions/session.action';

// session-state.model.ts
export interface SessionState {
    session: any;
    domain: any;
    userDetails: any;
    companyDetails: any;
    portalDetails: any;
    sidebarState: any;
}
export const initialState: SessionState = {
    session: null,
    domain: null,
    userDetails: null,
    companyDetails: null,
    portalDetails: null,
    sidebarState: true

};
export const sessionReducer = createReducer(
    initialState,
    on(setSessionToken, (state, { session }) => ({
        ...state,
        session,
    })),
    on(setPortalDomain, (state, { domain }) => ({
        ...state,
        domain,
    })),
    on(setUserDetails, (state, { userDetails }) => ({
        ...state,
        userDetails,
    })),
    on(resetLocalStorage, (state) => ({
        ...initialState,
    })),
    on(setCompanyDetails, (state, { companyDetails }) => ({
        ...state,
        companyDetails,
    })),
    on(setPortalUserDetails, (state, { portalDetails }) => ({
        ...state,
        portalDetails,
    })),
    on(setSidebarState, (state, { sidebarState }) => ({
        ...state,
        sidebarState,
    }))
);
