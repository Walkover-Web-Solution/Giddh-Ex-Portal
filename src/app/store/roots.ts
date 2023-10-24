import { ActionReducerMap } from '@ngrx/store';
import * as fromLogin from './session/session.reducer';
export interface AppState {
  session: fromLogin.SessionState;
}

export const reducers: ActionReducerMap<AppState> = {
  session: fromLogin.SessionReducer,
};
