import { map } from 'rxjs/operators';
import { AppState } from '../store';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';

@Injectable()
export class NeedsAuthentication {
    constructor(
        public router: Router,
        private store: Store<AppState>
    ) {

    }

    /**
     * THis router gurard will be used for authentication
     *
     * @return {*}
     * @memberof NeedsAuthentication
     */
    public canActivate(next: ActivatedRouteSnapshot) {
        return this.store.pipe(select(state => state), map(response => {
            let storeData = response['folderName'][next?.url[0]?.path];
            if (!storeData?.session) {
                const region = localStorage.getItem('country-region') || '';
                const url = next?.url[0]?.path + `/login/${region}/`;
                this.router.navigate([url]);
            }
        }));
    }
}
