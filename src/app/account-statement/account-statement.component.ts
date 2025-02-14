import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReplaySubject, combineLatest } from "rxjs";
import { ReciptResponse } from "../models/Company";
import { ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { select, Store } from '@ngrx/store';
import { PAGE_SIZE_OPTIONS } from "../app.constant";
import { GeneralService } from "../services/general.service";
import { AccountStatementService } from "../services/account-statement.service";
import * as dayjs from 'dayjs';
import { GIDDH_DATE_FORMAT } from "../shared/defaultDateFormat";

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
    /** True if api call in progress */
    public isLoading: boolean = false;
    /** Observable to unsubscribe all the store listeners to avoid memory leaks */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Hold table displayed columns*/
    public displayedColumns: string[] = ['Date', 'Transactions', 'Details', 'Amount', 'Payments', 'Balance'];
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
        companyUniqueName: '',
        accountUniqueName: '',
        sessionId: '',
        page: 1,
        count: '',
        sortBy: 'Date',
        sort: 'asc',
    }
    /** Hold table page index number*/
    public pageIndex: number = 0;
    /** Hold  store data */
    public storeData: any = {};
    /** Holds page size options */
    public pageSizeOptions: any[] = PAGE_SIZE_OPTIONS;
    /** Count of total records for pagination */
    public totalRecords: number = null;
    public endDate: any = new Date();
    public startDate: any = new Date(this.endDate);


    constructor(
        public dialog: MatDialog,
        private generalService: GeneralService,
        private accountStatementService: AccountStatementService,
        private store: Store,
        private route: ActivatedRoute
    ) {
        this.startDate.setDate(this.endDate.getDate() - 30);
    }

    /**
     * This will be use for component initialization
     *
     * @memberof AccountStatementComponent
     */
    public ngOnInit(): void {
        combineLatest([this.route.queryParams, this.route.params, this.store.pipe(select(state => state))]).pipe(takeUntil(this.destroyed$)).subscribe((response) => {
            if (response[0] && response[1] && response[2] && !this.storeData?.session) {
                this.storeData = response[2]['folderName'][response[1].companyDomainUniqueName];
                this.setDefaultParam();
            }
        });
    }

    /**
     * This will be use for hanldle page changes
     *
     * @param {PageEvent} event
     * @memberof AccountStatementComponent
     */
    public handlePageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.accountListRequest.count = event.pageSize;
        this.accountListRequest.page = event.pageIndex + 1;
        this.getAccountStatementList();
    }

    /**
     * This will be use for get count page
     *
     * @memberof AccountStatementComponent
     */
    public setDefaultParam(): void {
        if (this.storeData) {
            this.accountListRequest.accountUniqueName = this.storeData.userDetails?.account?.uniqueName;
            this.accountListRequest.companyUniqueName = this.storeData.userDetails?.companyUniqueName;
            this.accountListRequest.sessionId = this.storeData.session?.id;
            this.accountListRequest.count = this.pageSizeOptions[1];
            this.accountListRequest.asc = 'asc';
            if (!this.isLoading) {
                this.getAccountStatementList();
            }
        }
    }

    /**
     * This will be use for get payment list
     *
     * @memberof AccountStatementComponent
     */
    public getAccountStatementList(): void {
        this.isLoading = true;
        this.accountListData = [];
        this.accountListRequest.from = dayjs(this.startDate).format(GIDDH_DATE_FORMAT);
        this.accountListRequest.to = dayjs(this.endDate).format(GIDDH_DATE_FORMAT)
        this.accountStatementService.getAccountStatementList(this.accountListRequest).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
            this.isLoading = false;
            if (response && response.status === 'success') {
                console.log(response.body.transactionDetailList);
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
     * @memberof AccountStatementComponent
     */
    public sortData(event: any): void {
        this.accountListRequest.sort = event?.direction ? event?.direction : 'asc';
        this.accountListRequest.sortBy = event?.active;
        this.getAccountStatementList();
    }

    /**
     * This will be use for component destroy
     *
     * @memberof AccountStatementComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}
