import { Component, OnDestroy, OnInit } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { select, Store } from '@ngrx/store';
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "header",
  templateUrl: "header.component.html",
  styleUrls: ["header.component.scss"]
})
export class HeaderComponent implements OnInit , OnDestroy {
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold  store data */
    public storeData: any = {};

    constructor(private store: Store) {
    }

/**
 * This will be use for component initialization
 *
 * @memberof HeaderComponent
 */
public ngOnInit(): void {
        this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState: any) => {
            if (sessionState.session) {
                this.storeData = sessionState.session;
            }
        });
    }

/**
 * This will ve use for component destory
 *
 * @memberof HeaderComponent
 */
public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
