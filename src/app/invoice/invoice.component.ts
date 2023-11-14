import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReciptResponse } from "../models/Company";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GeneralService } from "../services/general.service";
import { takeUntil } from "rxjs/operators";
import { ReplaySubject } from "rxjs";
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
export interface PaymentModalElement {
  invoice: string;
  amount: string;
  status: string;
}
const ELEMENT_DATA_PAY: PaymentModalElement[] = [
  { invoice: 'INV2023-090562', amount: '€349,00', status: 'Paid' },
];

@Component({
  selector: "invoice",
  templateUrl: "invoice.component.html",
  styleUrls: ["invoice.component.scss"]
})
export class InvoiceComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  /** Instance of mat dialog */
  @ViewChild('paymodal', { static: true }) public paymodal: any;
  /** Instance of mat dialog */
  @ViewChild('paytablemodal', { static: true }) public paytablemodal: any;

  public displayedColumns: string[] = ['invoice', 'date', 'total', 'status', 'action'];
  public dataSource = new MatTableDataSource<any>();
  public panelOpenState: boolean = true;
  public selectedOption: string = '';
  public selectedStatusValue: string = '';
  public invoiceListData: any[] = [];
  public voucherData: ReciptResponse;
  public invoiceListRequest: any = {
    companyUniqueName: undefined,
    accountUniqueName: undefined,
    sessionId: undefined,
    type: 'sales',
    page: 1,
    count: 50,
    sortBy: 'ASC',
    sort: '',
    balanceStatus: []
  }
  /** True if api call in progress */
  public isLoading: boolean = true;
  /** Observable to unsubscribe all the store listeners to avoid memory leaks */
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public pageIndex: number = 0;
  dataSourcePay = ELEMENT_DATA_PAY;
  public selectedPaymentVoucher: any;
  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private generalService: GeneralService,
    private router: Router,
  ) {

  }
  public ngOnInit(): void {
    this.getInvoiceList();
  }

  public showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, // 3000 milliseconds (3 seconds)
    });
    return message;
  }

  public downloadPdf(item: any): void {
    let data = JSON.parse(localStorage.getItem('session'));
    let urlRequest = {
      accountUniqueName: data.userDetails.account.uniqueName,
      companyUniqueName: data.userDetails.companyUniqueName,
      sessionId: data.session.id,
      voucherUniqueName: item?.uniqueName
    }
    this.generalService.downloadVoucher(urlRequest)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (response: any) => {
          if (response) {
            let blob: Blob = this.generalService.base64ToBlob(response.body, 'application/pdf', 512);
            saveAs(blob, 'Voucher.pdf', 'application/pdf');
          } else {
            this.showSnackbar(response?.message);
          }
        },
        (error) => {
          console.error('Error downloading voucher:', error);
          this.showSnackbar('Error downloading voucher. Please try again.');
        }
      );
  }


  public onSortSelected(): void {
    this.invoiceListRequest.sort = this.selectedOption;
    this.getInvoiceList();
  }
  public onStatusSelected(): void {
    this.invoiceListRequest.balanceStatus[0] = this.selectedStatusValue;
    this.getInvoiceList();
  }

  public handlePageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.invoiceListRequest.count = event.pageSize;
    this.invoiceListRequest.page = event.pageIndex + 1;
    this.getInvoiceList();
  }


  public getInvoiceList(): void {
    let data = JSON.parse(localStorage.getItem('session'));
    this.invoiceListRequest.accountUniqueName = data.userDetails.account.uniqueName;
    this.invoiceListRequest.companyUniqueName = data.userDetails.companyUniqueName;
    this.invoiceListRequest.sessionId = data.session.id;
    this.generalService.getInvoiceList(this.invoiceListRequest).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
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

  public ngAfterViewInit() {

  }
  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };

  /*---- open dialog pay now ----*/
  public openPayDialog(item: any): void {
    this.dialog.open(this.paytablemodal, {
      width: '600px'
    });
    this.selectedPaymentVoucher = item;
  }


  public voucherPay(): void {
    this.dialog.closeAll();
    console.log(this.selectedPaymentVoucher);
    // this.generalService.getVoucherDetails(this.selectedPaymentVoucher).pipe(takeUntil(this.destroyed$)).subscribe((response: any) => {
    //   console.log(response);

    //   if (response && response.status === 'success') {

    //   } else {
    //     this.showSnackbar(response?.message);
    //   }
    // });
    let data = JSON.parse(localStorage.getItem('session'));
    let url = data.domain + '/invoice-pay';
    this.router.navigate([url], {
      queryParams: {
        account: this.selectedPaymentVoucher.account.uniqueName,
        voucher: this.selectedPaymentVoucher.uniqueName
      }
    });
  }


  public togglePanel() {
    this.panelOpenState = !this.panelOpenState
  }

  public ngOnDestroy(): void {

  }
}
