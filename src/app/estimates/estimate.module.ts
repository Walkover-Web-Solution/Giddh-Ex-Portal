import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EstimateComponent } from "./estimate.component";
import { EstimateRoutingModule } from "./estimate.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        EstimateComponent
    ],
    imports: [
        EstimateRoutingModule,
        SharedModule,
        CommonModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatListModule,
        MatSelectModule,
        MatTableModule
    ]
})
export class EstimateModule {

}
