import { Component, OnDestroy, OnInit } from "@angular/core";

export interface PeriodicElement {
    estimate: string;
    reference: string;
    date: string;
    total: string;
    status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { estimate: 'dfg', reference: 'sdfdfd', date: '21/09/23', total: 'dfg', status: 'name' },
    { estimate: 'dfg', reference: 'sdfdfd', date: '21/09/23', total: 'dfg', status: 'name' },
    { estimate: 'dfg', reference: 'sdfdfd', date: '21/09/23', total: 'dfg', status: 'name' },
];

@Component({
    selector: "estimate",
    templateUrl: "estimate.component.html",
    styleUrls: ["estimate.component.scss"]
})
export class EstimateComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['estimate', 'reference', 'date', 'total', 'status'];
    dataSource = ELEMENT_DATA;
    constructor(

    ) {

    }

    public ngOnInit(): void {

    }

    public ngOnDestroy(): void {

    }
}