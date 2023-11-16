import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReplaySubject } from "rxjs";
import { ReciptResponse } from "../models/Company";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PaymentService } from "../services/payment.service.";
import { Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import { select, Store } from '@ngrx/store';
@Component({
  selector: "payment",
  templateUrl: "payment.component.html",
  styleUrls: ["payment.component.scss"]
})
export class PaymentComponent implements OnInit, OnDestroy {
  /** Instance of mat paginator*/
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  /** Instance of mat sort */
  @ViewChild(MatSort) sort!: MatSort;
  /** Instance of mat pay modal dialog */
  @ViewChild('paymodal', { static: true }) public paymodal: any;
  /** Instance of mat pay table modal dialog */
  @ViewChild('paytablemodal', { static: true }) public paytablemodal: any;
  /** True if api call in progress */
  public isLoading: boolean = false;
  /** True if api call in progress */
  public initialLoading: boolean = false;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  /** Hold table displayed columns*/
  public displayedColumns: string[] = ['payment', 'voucherDate', 'amount', 'mode', 'unused'];
  /** Hold table datasource */
  public dataSource = new MatTableDataSource<any>();
  /** Hold panel open state*/
  public panelOpenState: boolean = true;
  /** Hold table sort selected option*/
  public selectedOption: string = 'grandTotal';
  /** Hold invoice response table data */
  public paymentListData: any[] = [];
  /** Hold voucher data */
  public voucherData: ReciptResponse;
  /** Hold invocie url request */
  public paymentListRequest: any = {
    companyUniqueName: undefined,
    accountUniqueName: undefined,
    sessionId: undefined,
    type: 'receipt',
    page: 1,
    count: 20,
    sortBy: 'grandTotal',
    sort: 'asc',
    balanceStatus: []
  }
  /** Hold table page index number*/
  public pageIndex: number = 0;
  /** Hold selected payment voucher */
  public selectedPaymentVoucher: any;
  /** To show clear filter */
  public showClearFilter: boolean = false;
  /** Hold  sort by options*/
  public sortByOptions = [
    { value: 'grandTotal', label: 'Amount' },
    { value: 'voucherDate', label: 'Date' }
  ];
  /** Hold  store data */
  public storeData: any = {};

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService,
    private router: Router,
    private store: Store
  ) {
    this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState: any) => {
      this.storeData = sessionState.session;
    });
  }

  /**
   * This will be use for component initialization
   *
   * @memberof PaymentComponent
   */
  public ngOnInit(): void {
    this.getPaymentList(true, false);
  }

  /**
   * This will be use for show snack bar
   *
   * @param {string} message
   * @return {*}
   * @memberof PaymentComponent
   */
  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  /**
   * This will be use for on table sort selected items
   *
   * @memberof PaymentComponent
   */
  public onSortBySelected(): void {
    this.paymentListRequest.sortBy = this.selectedOption;
    this.showClearFilter = true;
    this.getPaymentList(false, true);
  }

  /**
   * This will be use for hanldle page changes
   *
   * @param {PageEvent} event
   * @memberof PaymentComponent
   */
  public handlePageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.paymentListRequest.count = event.pageSize;
    this.paymentListRequest.page = event.pageIndex + 1;
    this.getPaymentList(false, true);
  }

  /**
   * This will be use for get payment list
   *
   * @memberof PaymentComponent
   */
  public getPaymentList(initialLoading: boolean, filtersLoading: boolean): void {
    this.paymentListRequest.accountUniqueName = this.storeData.userDetails.account.uniqueName;
    this.paymentListRequest.companyUniqueName = this.storeData.userDetails.companyUniqueName;
    this.paymentListRequest.sessionId = this.storeData.session.id;
    this.isLoading = filtersLoading;
    this.initialLoading = initialLoading;
    this.paymentService.getInvoiceList(this.paymentListRequest).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
      this.isLoading = false;
      this.initialLoading = false;
      if (response && response.status === 'success') {
        this.dataSource = new MatTableDataSource(response.body.items);
        this.paymentListData = response.body.items;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.voucherData = response.body;
      } else {
        this.showSnackbar(response?.message);
      }
    });
  }

  /**
   * This will be use for sort table  data
   *
   * @param {*} event
   * @memberof PaymentComponent
   */
  public sortData(event: any): void {
    this.paymentListRequest.sort = event?.direction ? event?.direction : 'asc';
    this.paymentListRequest.sortBy = event?.active;
    this.selectedOption = event?.active;
    this.showClearFilter = true;
    this.getPaymentList(false, true);
  }

  /**
   * This will be use for clear filter
   *
   * @memberof PaymentComponent
   */
  public resetFilter(): void {
    this.paymentListRequest = {
      companyUniqueName: undefined,
      accountUniqueName: undefined,
      sessionId: undefined,
      type: 'sales',
      page: 1,
      count: '',
      sortBy: 'grandTotal',
      sort: 'asc',
      balanceStatus: []
    };
    this.selectedOption = 'grandTotal';
    this.showClearFilter = false;
    this.getPaymentList(false, true);
  }

  /**
   * This will be use for invoice preview
   *
   * @param {*} invoice
   * @memberof PaymentComponent
   */
  public paymentPreview(invoice: any): void {
    let url = this.storeData.domain + '/payment/preview';
    this.router.navigate([url], {
      queryParams: {
        voucher: invoice?.uniqueName,
      }
    });
  }

  /**
   * This will be use for component destroy
   *
   * @memberof PaymentComponent
   */
  public ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
