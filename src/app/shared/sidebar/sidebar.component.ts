import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, ReplaySubject } from "rxjs";
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AppState } from "src/app/store";
import { Store } from '@ngrx/store';
import { MatSnackBar } from "@angular/material/snack-bar";
import { DashboardService } from "src/app/services/dashboard.service.";
@Component({
  selector: "sidebar",
  templateUrl: "sidebar.component.html",
  styleUrls: ["sidebar.component.scss"]
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Is side bar expanded*/
  public isExpanded: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1); public isMobile$: Observable<boolean>;
  /* Hold user details from localStorage*/
  public userDetails: any = '';
  /* Hold user details from localStorage*/
  public portalDomain: string = '';
  /** Request body for get account details url params */
  public accountUrlRequest = {
    companyUniqueName: undefined,
    accountUniqueName: undefined,
    sessionId: undefined,
  }

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    public breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {
    this.isMobile$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  /**
   * This will be use for component initialization
   *
   * @memberof SidebarComponent
   */
  public ngOnInit(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    this.accountUrlRequest.accountUniqueName = data.userDetails.account.uniqueName;
    this.accountUrlRequest.companyUniqueName = data.userDetails.companyUniqueName;
    this.accountUrlRequest.sessionId = data.session.id;
    this.portalDomain = data?.domain;
    this.getAccountDetails();
  }

  /**
   * This will be use for get account details
   *
   * @memberof SidebarComponent
   */
  public getAccountDetails(): void {
    this.dashboardService.getAccountDetails(this.accountUrlRequest).pipe(takeUntil(this.destroyed$)).subscribe((accountsResponse: any) => {
      if (accountsResponse && accountsResponse.status === 'success') {
        this.userDetails = accountsResponse.body;
      } else {
        this.showSnackbar(accountsResponse?.message);
      }
    });
  }

  /**
   * This will be use for show snackbar
   *
   * @param {string} message
   * @return {*}
   * @memberof SidebarComponent
   */
  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  /**
   * This will be use for toggle menu
   *
   * @memberof SidebarComponent
   */
  public toggleMenu() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * This will be use for redirection
   *
   * @param {*} url
   * @memberof SidebarComponent
   */
  public redirectionToUrl(url: any): void {
    let updatedUrl = `/${this.portalDomain}/${url}`;
    this.router.navigate([updatedUrl]);
  }

  /**
   * Cleans up resources when the component is destroyed
   */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
