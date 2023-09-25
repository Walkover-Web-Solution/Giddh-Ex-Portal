import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "statement",
    templateUrl: "statement.component.html",
    styleUrls: ["statement.component.scss"]
})
export class StatementComponent implements OnInit, OnDestroy {
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

    public ngOnDestroy(): void {

    }
}
