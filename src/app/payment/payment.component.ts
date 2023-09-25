import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from '@angular/material/paginator';
import { LiveAnnouncer } from "@angular/cdk/a11y";

export interface PeriodicElement {
    payment: string;
    reference: string;
    date: string;
    amount: string;
    mode: string;
    unusedamount: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { payment: '4476', reference: '63P974522W520611B', date: '01-09-2023', amount: '€349,00', mode: 'PayPal', unusedamount: '€0,00' },
    { payment: '4476', reference: 'ch_3JXM4zKjkW7BMJzR1GrfBDSZ', date: '01-09-2023', amount: '€1.099,61', mode: 'Bank transfer', unusedamount: '€0,00' },
    { payment: '4476', reference: 'ch_3JzghzKjkW7BMJzR0fcOLnZX', date: '01-09-2023', amount: '€3.020,21', mode: 'Stripe', unusedamount: '€0,00' },
    { payment: '4476', reference: 'ch_3JzghzKjkW7BMJzR0fcOLnZX', date: '01-09-2023', amount: '€3.020,21', mode: 'Stripe', unusedamount: '€0,00' }
];

@Component({
    selector: "payment",
    templateUrl: "payment.component.html",
    styleUrls: ["payment.component.scss"]
})
export class PaymentComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    displayedColumns: string[] = ['payment', 'reference', 'date', 'amount', 'mode', 'unusedamount'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    constructor(
        public dialog: MatDialog,
        private _liveAnnouncer: LiveAnnouncer
    ) {

    }

    public ngOnInit(): void {

    }
    /*---- sorting-table ----*/
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {
        // This example uses English messages. If your application supports
        // multiple language, you would internationalize these strings.
        // Furthermore, you can customize the message to add additional
        // details about the values being sorted.
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
            this._liveAnnouncer.announce('Sorting cleared');
        }
    }

    public ngOnDestroy(): void {

    }
}
