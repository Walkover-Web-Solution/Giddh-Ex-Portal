import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "payment-pdf",
    templateUrl: "payment-pdf.component.html",
    styleUrls: ["payment-pdf.component.scss"]
})
export class PaymentPdfComponent implements OnInit, OnDestroy {
    constructor(
        public dialog: MatDialog,
    ) {

    }

    public ngOnInit(): void {

    }

    public ngOnDestroy(): void {

    }
}
