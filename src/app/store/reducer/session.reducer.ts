import { CustomActions } from "../custom-actions";

/**
 * Keeping Track of the AuthenticationState
 */
// session.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { resetLocalStorage, setCompanyDetails, setPortalDomain, setPortalUserDetails, setSessionToken, setUserDetails, } from '../actions/session.action';

// session-state.model.ts
export interface SessionState {
    session: any;
    domain: any;
    userDetails: any;
    companyDetails: any;
    portalDetails: any;
    // logoutUser: any;
}
export const initialState: SessionState = {
    session: null,
    domain: null,
    userDetails: null,
    companyDetails: null,
    portalDetails: null,
    // logoutUser: null
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
        ...initialState, // Reset the entire state to initialState
    })),
    on(setCompanyDetails, (state, { companyDetails }) => ({
        ...state,
        companyDetails,
    })),
    on(setPortalUserDetails, (state, { portalDetails }) => ({
        ...state,
        portalDetails,
    })),
    // on(logoutUser, state => ({
    //     ...state,

    //     // You might want to include a loading flag in your state if needed
    // })),

    // on(logoutUserSuccess, (state, { response }) => ({
    //     ...state,
    //     logoutUser:response,
    //     // Handle success, clear relevant session data or update the state as needed
    // })),

    // on(logoutUserFailure, (state, { error }) => ({
    //     ...state
    //     // Handle failure, update the state or set an error flag if needed
    // }))
);
