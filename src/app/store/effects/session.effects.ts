import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth.service';
import * as fromApp from '../reducer/session.reducer';

@Injectable()
export class SessionEffects {
  constructor(private actions: Actions, private store: Store<fromApp.SessionState>, private authService: AuthService) { }
}
