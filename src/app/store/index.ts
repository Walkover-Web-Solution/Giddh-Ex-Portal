/*
 * Reducers: this file contains boilerplate code to handle debugging
 * in development mode, as well as integrate the store with HMR.
 * Customize your own reducers in `root.ts`.
 */
export { reducers, AppState } from './roots';
import { ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { initialState } from './reducer/session.reducer';


export function localStorageSyncReducer(r: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({
    keys: Object.keys(initialState),
    rehydrate: true,
    storage: localStorage,
  })((state, action) => {
    const nextState = r(state, action);
    return nextState;
  });
}
export const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];
