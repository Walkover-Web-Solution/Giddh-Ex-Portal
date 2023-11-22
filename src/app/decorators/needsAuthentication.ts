import { map } from 'rxjs/operators';
import { AppState } from '../store';
import { Router } from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { Store, select } from '@ngrx/store';

@Injectable()
export class NeedsAuthentication {
    constructor(public router: Router, private store: Store<AppState>, private zone: NgZone) {
    }

    /**
     * THis router gurard will be used for authentication
     *
     * @return {*}
     * @memberof NeedsAuthentication
     */
    public canActivate() {
        return this.store.pipe(select(p => p.session), map(response => {
            let url = response.domain + '/login';
            if (!response.session) {
                this.router.navigate([url]);
            }
        }));
    }
}
