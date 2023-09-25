import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "footer",
    templateUrl: "footer.component.html",
    styleUrls: ["footer.component.scss"]
})
export class FooterComponent implements OnInit, OnDestroy {
    /** Instance of mat dialog */
    @ViewChild('emailModal', { static: true }) public emailModal: any;

    constructor(
        public dialog: MatDialog
    ) {

    }

    public openDialog(): void {
        this.dialog.open(this.emailModal, {
            width: '600px',
        });
    }



    public ngOnInit(): void {

    }

    public ngOnDestroy(): void {

    }
}