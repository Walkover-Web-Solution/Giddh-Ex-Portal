import { ActionReducerMap } from '@ngrx/store';
import * as fromLogin from './reducer/session.reducer';
export interface AppState {
    folderName: fromLogin.folderNametate;
}

export const reducers: ActionReducerMap<AppState> = {
    folderName: fromLogin.sessionReducer,
};