import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, ReplaySubject } from "rxjs";
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AppState } from "src/app/store";
import { select, Store } from '@ngrx/store';
import { SessionState } from "src/app/store/session/session.reducer";
@Component({
  selector: "sidebar",
  templateUrl: "sidebar.component.html",
  styleUrls: ["sidebar.component.scss"]
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Instance of mat dialog */
  @ViewChild('changepassword', { static: true }) public changepassword: any;
  /** Instance of modal */
  public modalDialogRef: any;
  public isExpanded = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1); public isMobile$: Observable<boolean>;
  public portalDomain: string = '';
  constructor(
    private router: Router,
    public route: ActivatedRoute,
    public breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private store: Store<SessionState>
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
    this.store.pipe(select(state => state.domain), takeUntil(this.destroyed$)).subscribe(res => {
      this.portalDomain = res.domain;
    });
  }
  /**
   * Initializes the component
   */
  public ngOnInit(): void {

  }
  /*---- open dialog change password ----*/
  public openChangePassword(): void {
    this.modalDialogRef = this.dialog.open(this.changepassword, {
      width: '600px'
    });
  }
  public toggleMenu() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Cleans up resources when the component is destroyed
   */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public redirectionToUrl(url: any): void {
    let updatedUrl = `/${this.portalDomain}/${url}`;
    this.router.navigate([updatedUrl]);
  }
}
