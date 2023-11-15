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
    public isLoading: boolean;
    /** True if api call in progress */
    public initialLoading: boolean;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold table displayed columns*/
    public displayedColumns: string[] = ['payment', 'voucherDate', 'amount', 'mode', 'unused'];
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
    public paymentListRequest: any = {
        companyUniqueName: undefined,
        accountUniqueName: undefined,
        sessionId: undefined,
        type: 'receipt',
        page: 1,
        count: '',
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
        { value: 'hold', label: 'Hold' }
    ];
    /** Hold  sort by options*/
    public sortByOptions = [
        { value: 'grandTotal', label: 'Total' },
        { value: 'voucherDate', label: 'Date' }
    ];

    constructor(
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private paymentService: PaymentService,
        private router: Router
    ) {
    }

    /**
     * This will be use for component initialization
     *
     * @memberof PaymentComponent
     */
    public ngOnInit(): void {
        this.getInvoiceList(true, false);
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
     * This will be use for  download pdf file
     *
     * @param {*} item
     * @memberof PaymentComponent
     */
    public downloadPdf(item: any): void {
        let data = JSON.parse(localStorage.getItem('session'));
        let urlRequest = {
            accountUniqueName: data.userDetails.account.uniqueName,
            companyUniqueName: data.userDetails.companyUniqueName,
            sessionId: data.session.id,
            voucherUniqueName: item?.uniqueName
        }
        this.paymentService.downloadVoucher(urlRequest)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
                (response: any) => {
                    if (response) {
                        let blob: Blob = this.paymentService.base64ToBlob(response.body, 'application/pdf', 512);
                        saveAs(blob, 'Voucher.pdf', 'application/pdf');
                    } else {
                        this.showSnackbar(response?.message);
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
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for on table status selected
     *
     * @memberof PaymentComponent
     */
    public onStatusSelected(): void {
        this.paymentListRequest.balanceStatus[0] = this.selectedStatusValue;
        this.showClearFilter = true;
        this.getInvoiceList(false, true);

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
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for get invoice list
     *
     * @memberof PaymentComponent
     */
    public getInvoiceList(initialLoading: boolean, filtersLoading: boolean): void {
        let data = JSON.parse(localStorage.getItem('session'));
        this.paymentListRequest.accountUniqueName = data.userDetails.account.uniqueName;
        this.paymentListRequest.companyUniqueName = data.userDetails.companyUniqueName;
        this.paymentListRequest.sessionId = data.session.id;
        this.isLoading = filtersLoading;
        this.initialLoading = initialLoading;
        this.paymentService.getInvoiceList(this.paymentListRequest).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            this.isLoading = false;
            this.initialLoading = false;
            if (response && response.status === 'success') {
                this.dataSource = new MatTableDataSource(response.body.items);
                this.invoiceListData = response.body.items;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.voucherData = response.body;
            } else {
                this.showSnackbar(response?.message);
            }
        });
    }

    /**
     * This will be use for open pay dialog confirmation
     *
     * @param {*} item
     * @memberof PaymentComponent
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
     * @memberof PaymentComponent
     */
    public voucherPay(): void {
        this.dialog?.closeAll();
        let data = JSON.parse(localStorage.getItem('session'));
        let url = data.domain + '/invoice-pay';
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
     * @memberof PaymentComponent
     */
    public sortData(event: any): void {
        this.paymentListRequest.sort = event?.direction ? event?.direction : 'asc';
        this.paymentListRequest.sortBy = event?.active;
        this.selectedOption = event?.active;
        this.showClearFilter = true;
        this.getInvoiceList(false, true);
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
        this.selectedStatusValue = '';
        this.selectedOption = 'grandTotal';
        this.showClearFilter = false;
        this.getInvoiceList(false, true);
    }

    /**
     * This will be use for invoice preview
     *
     * @param {*} invoice
     * @memberof PaymentComponent
     */
    public invoicePreview(invoice: any): void {
        let data = JSON.parse(localStorage.getItem('session'));
        let url = data.domain + '/payment/preview';
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
