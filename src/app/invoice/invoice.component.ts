import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReciptResponse } from "../models/Company";
import { takeUntil } from "rxjs/operators";
import { ReplaySubject } from "rxjs";
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { InvoiceService } from "../services/invoice.service";
import { select, Store } from '@ngrx/store';
import { GeneralService } from "../services/general.service";
import { PAGE_SIZE_OPTIONS, PAGINATION_LIMIT } from "../app.constant";

@Component({
    selector: "invoice",
    templateUrl: "invoice.component.html",
    styleUrls: ["invoice.component.scss"]
})
export class InvoiceComponent implements OnInit, OnDestroy {
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
    public displayedColumns: string[] = ['invoice', 'voucherDate', 'grandTotal', 'status', 'overdue', 'action'];
    /** Hold table datasource */
    public dataSource = new MatTableDataSource<any>();
    /** Hold panel open state*/
    public panelOpenState: boolean = true;
    /** Hold table status selected value*/
    public selectedStatusValue: string = '';
    /** Hold table sort selected option*/
    public selectedOption: string = 'grandTotal';
    /** Hold invoice response table data */
    public invoiceListData: any[] = [];
    /** Hold voucher data */
    public voucherData: ReciptResponse;
    /** Hold invocie url request */
    public invoiceListRequest: any = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
        type: 'sales',
        page: 1,
        count: PAGINATION_LIMIT,
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
    /** Hold  status options*/
    public statusOptions = [
        { value: '', label: 'All Invoices' },
        { value: 'paid', label: 'Paid' },
        { value: 'partial-paid', label: 'Partial Paid' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'hold', label: 'Hold' },
        { value: 'cancel', label: 'Cancel' }
    ];
    /** Hold  sort by options*/
    public sortByOptions = [
        { value: 'grandTotal', label: 'Total' },
        { value: 'voucherDate', label: 'Date' }
    ];
    /** Hold  store data */
    public storeData: any = {};
    /** Holds page size options */
    public pageSizeOptions: any[] = PAGE_SIZE_OPTIONS;
    /** Count of total records for pagination */
    public totalRecords: number = 0;

    constructor(
        public dialog: MatDialog,
        private generalService: GeneralService,
        private invoiceService: InvoiceService,
        private router: Router,
        private store: Store
    ) {

    }

    /**
     * This will be use for component initialization
     *
     * @memberof InvoiceComponent
     */
    public ngOnInit(): void {
        this.store.pipe(select(state => state), takeUntil(this.destroyed$)).subscribe((sessionState: any) => {
            if (sessionState.session) {
                this.storeData = sessionState.session;
                this.getInvoiceList(true, false);
            }
        });
    }

    /**
     * This will be use for  download pdf file
     *
     * @param {*} item
     * @memberof InvoiceComponent
     */
    public downloadPdf(item: any): void {
        let urlRequest = {
            accountUniqueName: this.storeData.userDetails.account.uniqueName,
            companyUniqueName: this.storeData.userDetails.companyUniqueName,
            sessionId: this.storeData.session.id,
            voucherUniqueName: item?.uniqueName
        }
        this.invoiceService.downloadVoucher(urlRequest)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
                (response: any) => {
                    if (response) {
                        let blob: Blob = this.generalService.base64ToBlob(response.body, 'application/pdf', 512);
                        saveAs(blob, item?.voucherNumber, 'application/pdf');
                    } else {
                        this.generalService.showSnackbar(response?.message);
                    }
                });
    }

    /**
     * This will be use for on table sort selected items
     *
     * @memberof InvoiceComponent
     */
    public onSortBySelected(): void {
        this.invoiceListRequest.sortBy = this.selectedOption;
        this.showClearFilter = true;
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for on table status selected
     *
     * @memberof InvoiceComponent
     */
    public onStatusSelected(): void {
        this.invoiceListRequest.balanceStatus[0] = this.selectedStatusValue;
        this.showClearFilter = true;
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for hanldle page changes
     *
     * @param {PageEvent} event
     * @memberof InvoiceComponent
     */
    public handlePageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.invoiceListRequest.count = event.pageSize;
        this.invoiceListRequest.page = event.pageIndex + 1;
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for get invoice list
     *
     * @memberof InvoiceComponent
     */
    public getInvoiceList(initialLoading: boolean, filtersLoading: boolean): void {
        if (this.storeData) {
            this.invoiceListRequest.accountUniqueName = this.storeData.userDetails?.account?.uniqueName;
            this.invoiceListRequest.companyUniqueName = this.storeData.userDetails?.companyUniqueName;
            this.invoiceListRequest.sessionId = this.storeData.session?.id;
            this.isLoading = filtersLoading;
            this.initialLoading = initialLoading;
            this.invoiceService.getInvoiceList(this.invoiceListRequest).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
                this.isLoading = false;
                this.initialLoading = false;
                if (response && response.status === 'success') {
                    this.dataSource = new MatTableDataSource(response.body.items);
                    this.invoiceListData = response.body.items;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                    this.voucherData = response.body;
                    this.totalRecords = response?.body?.totalItems;
                } else {
                    this.generalService.showSnackbar(response?.message);
                }
            });
        }
    }

    /**
     * This will be use for open pay dialog confirmation
     *
     * @param {*} item
     * @memberof InvoiceComponent
     */
    public openPayDialog(item: any): void {
        this.dialog.open(this.paytablemodal, {
            width: '600px'
        });
        this.selectedPaymentVoucher = item;
    }

    /**
     * This will be use for pay voucher
     *
     * @memberof InvoiceComponent
     */
    public voucherPay(): void {
        this.dialog?.closeAll();
        let url = this.storeData.domain + '/invoice-pay';
        this.router.navigate([url], {
            queryParams: {
                account: this.selectedPaymentVoucher.account.uniqueName,
                voucher: this.selectedPaymentVoucher.uniqueName
            }
        });
    }

    /**
     * This will be use for sort table  data
     *
     * @param {*} event
     * @memberof InvoiceComponent
     */
    public sortData(event: any): void {
        this.invoiceListRequest.sort = event?.direction ? event?.direction : 'asc';
        this.invoiceListRequest.sortBy = event?.active;
        this.selectedOption = event?.active;
        this.showClearFilter = true;
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for clear filter
     *
     * @memberof InvoiceComponent
     */
    public resetFilter(): void {
        this.invoiceListRequest = {
            companyUniqueName: undefined,
            accountUniqueName: undefined,
            sessionId: undefined,
            type: 'sales',
            page: 1,
            count: PAGINATION_LIMIT,
            sortBy: 'grandTotal',
            sort: 'asc',
            balanceStatus: []
        };
        this.selectedStatusValue = '';
        this.selectedOption = 'grandTotal';
        this.showClearFilter = false;
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for invoice preview
     *
     * @param {*} invoice
     * @memberof InvoiceComponent
     */
    public invoicePreview(invoice: any): void {
        let url = this.storeData.domain + '/invoice/preview';
        this.router.navigate([url], {
            queryParams: {
                voucher: invoice?.uniqueName,
            }
        });
    }

    /**
     * This will be use for component destroy
     *
     * @memberof InvoiceComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
