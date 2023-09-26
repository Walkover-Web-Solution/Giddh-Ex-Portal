import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";

@Component({
    selector: "invoice-pdf",
    templateUrl: "invoice-pdf.component.html",
    styleUrls: ["invoice-pdf.component.scss"]
})
export class InvoicePdfComponent implements OnInit, OnDestroy {
    /** Instance of mat dialog */
    @ViewChild('forwardmodal', { static: true }) public forwardmodal: any;
    public panelOpenState: boolean = true;
    /*---- autocomplete form-control ----*/
    public myControl = new FormControl('');
    constructor(
        public dialog: MatDialog
    ) {

    }

    public ngOnInit(): void {

    }
    /*---- open dialog forward ----*/
    public openForwardDialog(): void {
        this.dialog.open(this.forwardmodal, {
            width: '600px',
            panelClass: 'forward-modal'
        });
    }

    public togglePanel() {
        this.panelOpenState = !this.panelOpenState
    }

    public ngOnDestroy(): void {

    }
}
