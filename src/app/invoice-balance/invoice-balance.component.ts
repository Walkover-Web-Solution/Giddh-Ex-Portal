import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";

@Component({
    selector: "invoice-balance",
    templateUrl: "invoice-balance.component.html",
    styleUrls: ["invoice-balance.component.scss"]
})
export class InvoiceBalanceComponent implements OnInit, OnDestroy {
    public isExpanded = true;
    public panelOpenState: boolean = true;
    /*---- autocomplete form-control ----*/
    public myControl = new FormControl('');
    constructor(
        public dialog: MatDialog
    ) {

    }

    public ngOnInit(): void {

    }
    myFilter = (d: Date | null): boolean => {
        const day = (d || new Date()).getDay();
        // Prevent Saturday and Sunday from being selected.
        return day !== 0 && day !== 6;
    };

    public togglePanel() {
        this.panelOpenState = !this.panelOpenState
    }

    public toggleMenu() {
        this.isExpanded = !this.isExpanded;
    }

    public ngOnDestroy(): void {

    }
}
