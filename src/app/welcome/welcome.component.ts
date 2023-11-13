import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReplaySubject } from "rxjs";
import { AppState } from "../store";
import { Store } from '@ngrx/store';
import { takeUntil } from "rxjs/operators";
import { GeneralService } from "../services/general.service";
@Component({
  selector: "welcome",
  templateUrl: "welcome.component.html",
  styleUrls: ["welcome.component.scss"]
})
export class WelcomeComponent implements OnInit, OnDestroy {
  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Request body for get shopify url params */
  public userBalanceSummary = {
    companyUniqueName: undefined,
    accountUniqueName: undefined,
    sessionId: undefined,
  }
  public balanceSummary: any = {};
  public accountDetails: any = {};
  public accounts: any[] = [];
  constructor(
    private generalService: GeneralService,
    private snackBar: MatSnackBar,
    private store: Store<AppState>
  ) {

  }

  public ngOnInit(): void {
    document.querySelector('body')?.classList.add('welcome-main');
    this.getBalanceSummary();
    this.getAccountDetails();
    this.getAccounts();
    this.getVoucherLastPaymentMade();
  }

  public getBalanceSummary(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    console.log(data);
    this.userBalanceSummary.accountUniqueName = data.userDetails.account.uniqueName;
    this.userBalanceSummary.companyUniqueName = data.userDetails.companyUniqueName;
    this.userBalanceSummary.sessionId = data.session.id;
    this.generalService.getBalanceSummary(this.userBalanceSummary).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      if (response && response.status === 'success') {
        this.balanceSummary = response.body
      } else {
        this.showSnackbar(response?.message);
      }

    });
  }
  public getAccountDetails(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    console.log(data);
    this.userBalanceSummary.accountUniqueName = data.userDetails.account.uniqueName;
    this.userBalanceSummary.companyUniqueName = data.userDetails.companyUniqueName;
    this.userBalanceSummary.sessionId = data.session.id;
    this.generalService.getAccountDetails(this.userBalanceSummary).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      if (response && response.status === 'success') {
        console.log(response);
        this.accountDetails = response.body
      } else {
        this.showSnackbar(response?.message);
      }
    });
  }

  public getVoucherLastPaymentMade(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    console.log(data);
    this.userBalanceSummary.accountUniqueName = data.userDetails.account.uniqueName;
    this.userBalanceSummary.companyUniqueName = data.userDetails.companyUniqueName;
    this.userBalanceSummary.sessionId = data.session.id;
    this.generalService.getLastPaymentMade(this.userBalanceSummary).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      if (response && response.status === 'success') {
        console.log(response);
        this.accountDetails = response.body
      } else {
        this.showSnackbar(response?.message);
      }
    });
  }

  public getAccounts(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    console.log(data);
    this.userBalanceSummary.accountUniqueName = data.userDetails.account.uniqueName;
    this.userBalanceSummary.companyUniqueName = data.userDetails.companyUniqueName;
    this.userBalanceSummary.sessionId = data.session.id;
    this.generalService.getAccounts(this.userBalanceSummary).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      if (response && response.status === 'success') {
        console.log(response);
        this.accounts = response.body;
      } else {
        this.showSnackbar(response?.message);
      }
    });
  }


  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  public ngOnDestroy(): void {
    document.querySelector('body')?.classList.remove('welcome-main');

  }
}
