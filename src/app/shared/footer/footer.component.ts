import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CompanyResponse } from "src/app/models/Company";
import { GeneralService } from "src/app/services/general.service";

@Component({
  selector: "footer",
  templateUrl: "footer.component.html",
  styleUrls: ["footer.component.scss"]
})
export class FooterComponent implements OnInit, OnDestroy {
  @Output() companyData: EventEmitter<CompanyResponse> = new EventEmitter<CompanyResponse>();

  /** Hold company response */
  public companyDetails: CompanyResponse;
  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Request body for get shopify url params */
  public companyDetailsQueryParams = {
    companyUniqueName: undefined,
    accountUniqueName: undefined,
    sessionId: undefined,
  }


  constructor(
    private generalService: GeneralService,
    private snackBar: MatSnackBar
  ) {

  }

  /**
   * This will be use for component initialization
   *
   * @memberof FooterComponent
   */
  public ngOnInit(): void {
    this.getCompanyDetails();
  }

  /**
   * This will be use for get company details
   *
   * @memberof FooterComponent
   */
  public getCompanyDetails(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    this.companyDetailsQueryParams.accountUniqueName = data.userDetails.account.uniqueName;
    this.companyDetailsQueryParams.companyUniqueName = data.userDetails.companyUniqueName;
    this.companyDetailsQueryParams.sessionId = data.session.id;
    this.generalService.getCompanyDetails(this.companyDetailsQueryParams).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
      if (response && response.status === 'success') {
        console.log(response);
        this.companyDetails = response.body;
        this.companyData.emit(this.companyDetails);
      } else {
        this.showSnackbar(response?.message);
      }
    });
  }

  /**
   * This will be use for show snackbar
   *
   * @param {string} message
   * @return {*}
   * @memberof FooterComponent
   */
  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  /**
   * This will be use for component destroy
   *
   * @memberof FooterComponent
   */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
