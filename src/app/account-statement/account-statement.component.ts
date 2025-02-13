import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReplaySubject, combineLatest } from "rxjs";
import { ReciptResponse } from "../models/Company";
import { PaymentService } from "../services/payment.service.";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { select, Store } from '@ngrx/store';
import { PAGE_SIZE_OPTIONS, PAGINATION_LIMIT } from "../app.constant";
import { GeneralService } from "../services/general.service";
import { CommonService } from "../services/common.service";
import { AccountStatementService } from "../services/account-statement.service";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: "account-statement",
    templateUrl: "account-statement.component.html",
    styleUrls: ["account-statement.component.scss"],
    providers: [AccountStatementService]
})
export class AccountStatementComponent implements OnInit, OnDestroy {
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
    public displayedColumns: string[] = ['Date', 'Transactions', 'Details', 'Amount', 'Payments', 'Balance'];
    /** Hold table datasource */
    public dataSource = new MatTableDataSource<any>();
    /** Hold panel open state*/
    public panelOpenState: boolean = true;
    /** Hold table sort selected option*/
    public selectedOption: string = 'grandTotal';
    /** Hold invoice response table data */
    public accountListData: any[] = [];
    /** Hold voucher data */
    public voucherData: ReciptResponse;
    /** Hold invocie url request */
    public accountListRequest: any = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
        type: 'receipt',
        page: 1,
        count: undefined,
        sortBy: 'Date',
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
    /** Holds page size options */
    public pageSizeOptions: any[] = PAGE_SIZE_OPTIONS;
    /** Count of total records for pagination */
    public totalRecords: number = null;
    /** Hold region */
    public region: string = "";
    public showErrorMessage: boolean = false;

    public range: FormGroup;


    constructor(
        public dialog: MatDialog,
        private generalService: GeneralService,
        private accountStatementService: AccountStatementService,
        private router: Router,
        private store: Store,
        private route: ActivatedRoute,
        private fb: FormBuilder
    ) {
        const today = new Date(); // Get today's date
        const thirtyDaysAgo = new Date(); // Create a new date object for 30 days ago

        // Set start date to exactly 30 days before today
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Reset time to midnight to avoid time-related issues
        today.setHours(0, 0, 0, 0);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        this.range = this.fb.group({
            start: [thirtyDaysAgo], // Default start date = 30 days ago
            end: [today] // Default end date = today
        });
    }

    /**
     * This will be use for component initialization
     *
     * @memberof PaymentComponent
     */
    public ngOnInit(): void {
        combineLatest([this.route.queryParams, this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && response[2] && !this.storeData?.session) {
                this.storeData = response[2]['folderName'][response[1].companyDomainUniqueName];
                this.region = this.storeData?.region;
                this.setDefaultParam();
            }
        });
    }

    /**
     * This will be use for on table sort selected items
     *
     * @memberof PaymentComponent
     */
    public onSortBySelected(): void {
        this.getAccountStatementList();
    }

    /**
     * This will be use for hanldle page changes
     *
     * @param {PageEvent} event
     * @memberof PaymentComponent
     */
    public handlePageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.accountListRequest.count = event.pageSize;
        this.accountListRequest.page = event.pageIndex + 1;
        this.getAccountStatementList();
    }

    /**
 * This will be use for get count page
 *
 * @memberof PaymentComponent
 */
    public setDefaultParam(): void {
        if (this.storeData) {
            this.accountListRequest.accountUniqueName = this.storeData.userDetails?.account?.uniqueName;
            this.accountListRequest.companyUniqueName = this.storeData.userDetails?.companyUniqueName;
            this.accountListRequest.sessionId = this.storeData.session?.id;
            this.accountListRequest.count = 50;
            this.accountListRequest.from = '';
            this.accountListRequest.to = '';
            this.accountListRequest.asc = 'asc';
            if (!this.isLoading) {
                this.getAccountStatementList();
            }
        }
    }

    /**
     * This will be use for get payment list
     *
     * @memberof PaymentComponent
     */
    public getAccountStatementList(): void {
        this.isLoading = true;
        this.accountStatementService.getAccountStatementList(this.accountListRequest).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            this.isLoading = false;
            if (response && response.status === 'success') {
                this.accountListData = response.body.transactionDetailList;
                this.totalRecords = response.body.totalItems;
            } else {
                if (response?.status === 'error') {
                    this.generalService.showSnackbar(response?.message);
                }
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
        this.accountListRequest.sort = event?.direction ? event?.direction : 'asc';
        this.accountListRequest.sortBy = event?.active;
        this.getAccountStatementList();
    }

    // /**
    //  * This will be use for clear filter
    //  *
    //  * @memberof PaymentComponent
    //  */
    // public resetFilter(): void {
    //     this.accountListRequest = {
    //         companyUniqueName: undefined,
    //         accountUniqueName: undefined,
    //         sessionId: undefined,
    //         type: 'receipt',
    //         page: 1,
    //         count: PAGINATION_LIMIT,
    //         sortBy: 'grandTotal',
    //         sort: 'asc',
    //         balanceStatus: []
    //     };
    //     this.selectedOption = 'grandTotal';
    //     this.showClearFilter = false;
    //     this.getAccountStatementList();
    // }

    /**
     * This will be use for invoice preview
     *
     * @param {*} invoice
     * @memberof PaymentComponent
    //  */
    // public paymentPreview(invoice: any): void {
    //     let url = `${this.storeData.domain}/${this.region}/payment/preview`;
    //     this.router.navigate([url], {
    //         queryParams: {
    //             voucher: invoice?.uniqueName,
    //         }
    //     });
    // }

    public onDatePickerClose() {
        const endDate = this.range.value.end;
        const startDate = this.range.value.start;
        this.showErrorMessage = !startDate || !endDate;
        if (!this.showErrorMessage) {
            this.accountListRequest.from = startDate;
            this.accountListRequest.to = endDate;
            this.getAccountStatementList();
        }
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
