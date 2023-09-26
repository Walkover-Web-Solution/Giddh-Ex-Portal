import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from "@angular/forms";

export interface PeriodicElement {
    invoice: string;
    reference: string;
    date: string;
    total: string;
    status: string;
}

export interface PaymentModalElement {
    invoice: string;
    amount: string;
    status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { invoice: 'INV2023-090562', reference: 'Software License Agreement - 360dialog - walkover - MSG91 - 2021-05', date: '01-09-2023', total: '€349,00', status: 'Overdue by 13 days' },
    { invoice: 'INV2023-090562', reference: 'Software License Agreement - 360dialog - walkover - MSG91 - 2021-05', date: '01-09-2023', total: '€349,00', status: 'Overdue by 13 days' },
    { invoice: 'INV2023-090562', reference: 'Software License Agreement - 360dialog - walkover - MSG91 - 2021-05', date: '01-09-2023', total: '€349,00', status: 'Paid' }
];
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
    displayedColumns: string[] = ['invoice', 'reference', 'date', 'total', 'status'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    displayedColumnsPay: string[] = ['invoice', 'amount', 'status'];
    dataSourcePay = ELEMENT_DATA_PAY;
    public panelOpenState: boolean = true;
    /*---- autocomplete form-control ----*/
    public myControl = new FormControl('');
    constructor(
        public dialog: MatDialog
    ) {

    }

    public ngOnInit(): void {

    }
    /*---- sorting-table ----*/
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
    myFilter = (d: Date | null): boolean => {
        const day = (d || new Date()).getDay();
        // Prevent Saturday and Sunday from being selected.
        return day !== 0 && day !== 6;
    };

    /*---- open dialog pay now ----*/
    public openPayDialog(): void {
        this.dialog.open(this.paymodal, {
            width: '600px'
        });
    }
    /*---- open dialog Table pay now ----*/
    public openPayTableDialog(): void {
        this.dialog.open(this.paytablemodal, {
            width: '600px'
        });
    }

    public togglePanel() {
        this.panelOpenState = !this.panelOpenState
    }

    public ngOnDestroy(): void {

    }
}
