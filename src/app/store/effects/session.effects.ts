import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import * as fromApp from '../session/session.reducer';

@Injectable()
export class SessionEffects {
  constructor(private actions: Actions, private store: Store<fromApp.SessionState>, private authService: AuthService) { }

  // getGreeting$ = createEffect(() => {
  //   return this.actions.pipe(
  //     ofType(setSessionToken),
  //     switchMap((token) => {
  //       return this.authService.verifyPortalLogin(token.session).pipe(
  //         map((data: any) => {
  //           console.log(data);

  //           // return actions.getGreetingSuccess({ data: data.data });
  //           return data;
  //         }),
  //         catchError((err) => {
  //           return of();
  //         })
  //       );
  //     })
  //   );
  // });
}

// logout$ = createEffect(() =>
//   this.actions.pipe(
//     ofType(logout),
//     switchMap(() =>
//       this.authService.logout().pipe(
//         map(() => clearSession()),
//         catchError(error => of(logout)) // Handle error if needed
//       )
//     )
//   )
// );
// Implement your login and clear effects here using the Actions and Store.
