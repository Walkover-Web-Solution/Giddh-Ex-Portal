// user.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as UserActions from '../actions/session.action';

@Injectable()
export class UserEffects {
  loginEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),
      tap(({ user }) => sessionStorage.setItem('user', JSON.stringify(user)))
    ),
    { dispatch: false }
  );

  logoutEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logout),
      tap(() => sessionStorage.removeItem('user'))
    ),
    { dispatch: false }
  );

  constructor(private actions$: Actions) { }
}
