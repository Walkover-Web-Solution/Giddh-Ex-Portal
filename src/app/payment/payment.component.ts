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
    public displayedColumns: string[] = ['payment', 'voucherDate', 'grandTotal', 'mode', 'unused'];
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
        count: undefined,
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
    /** Holds page size options */
    public pageSizeOptions: any[] = PAGE_SIZE_OPTIONS;
    /** Count of total records for pagination */
    public totalRecords: number = 0;
    /** Hold region */
    public region: string = "";

    constructor(
        public dialog: MatDialog,
        private generalService: GeneralService,
        private paymentService: PaymentService,
        private router: Router,
        private store: Store,
        private commonService: CommonService,
        private route: ActivatedRoute
    ) {
        
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
                this.getCountPage();
            }
        });
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
        this.setCountPage();
        this.getPaymentList(false, true);
    }

    /**
 * This will be use for get count page
 *
 * @memberof PaymentComponent
 */
    public getCountPage(): void {
        if (this.storeData) {
            let request = {
                accountUniqueName: this.storeData.userDetails?.account?.uniqueName,
                companyUniqueName: this.storeData.userDetails?.companyUniqueName,
                vendorUniqueName: this.storeData.userDetails?.vendorContactUniqueName,
                sessionId: this.storeData.session?.id,
                page: 'PAYMENTS'

            }
            this.isLoading = true;
            this.commonService.getVoucherCountPage(request).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                this.isLoading = false;
                if (response && response.status === 'success') {
                    this.paymentListRequest.count = response.body?.countOfRecords || PAGINATION_LIMIT;
                    this.getPaymentList(true, false);
                } else {
                    if (response?.status === 'error') {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
        }
    }

    /**
     * This will be use for set count page
     *
     * @memberof PaymentComponent
     */
    public setCountPage(): void {
        if (this.storeData) {
            let request = {
                accountUniqueName: this.storeData.userDetails?.account?.uniqueName,
                companyUniqueName: this.storeData.userDetails?.companyUniqueName,
                vendorUniqueName: this.storeData.userDetails?.vendorContactUniqueName,
                sessionId: this.storeData.session?.id,
                page: 'PAYMENTS',
                count: this.paymentListRequest.count
            }
            this.isLoading = true;
            this.commonService.setVoucherCountPage(request).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                this.isLoading = false;
                if (response && response.status === 'success') {
                } else {
                    if (response?.status === 'error') {
                        this.generalService.showSnackbar(response?.message);
                    }
                }
            });
        }
    }

    /**
     * This will be use for get payment list
     *
     * @memberof PaymentComponent
     */
    public getPaymentList(initialLoading: boolean, filtersLoading: boolean): void {
        this.paymentListRequest.accountUniqueName = this.storeData.userDetails?.account?.uniqueName;
        this.paymentListRequest.companyUniqueName = this.storeData.userDetails?.companyUniqueName;
        this.paymentListRequest.sessionId = this.storeData.session?.id;
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
                this.totalRecords = response?.body?.totalItems;
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
            type: 'receipt',
            page: 1,
            count: PAGINATION_LIMIT,
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
        let url = `${this.storeData.domain}/${this.region}/payment/preview`;
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
