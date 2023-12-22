import { map } from 'rxjs/operators';
import { AppState } from '../store';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';

@Injectable()
export class NeedsAuthentication {
    constructor(public router: Router, private route: ActivatedRoute, private store: Store<AppState>) {
        
    }

    /**
     * THis router gurard will be used for authentication
     *
     * @return {*}
     * @memberof NeedsAuthentication
     */
    public canActivate() {
        return this.store.pipe(select(state => state), map(response => {
            console.log(response);
            // let url = this.folderName + '/login';
            // if (!response.session) {
            //     this.router.navigate([url]);
            // }
        }));
    }
}
