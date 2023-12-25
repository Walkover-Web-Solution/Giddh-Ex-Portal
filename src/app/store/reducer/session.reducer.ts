import { createReducer, on } from '@ngrx/store';
import { setFolderData } from '../actions/session.action';

export interface SessionState {
    session: null,
    domain: null,
    userDetails: null,
    companyDetails: null,
    portalDetails: null,
    sidebarState: true,
    url: null
};

export interface folderNametate {
    [key: string]: SessionState;
};

export const initialState: folderNametate = {};

export const sessionReducer = createReducer(
    initialState,
    on(setFolderData, (state, { folderName, data }) => ({
        ...state, [folderName]: {
            ...state[folderName],
            ...data
        }
    }))
);