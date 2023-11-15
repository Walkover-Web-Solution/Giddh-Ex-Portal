import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StatementComponent } from "./statement.component";
import { StatementRoutingModule } from "./statement.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        StatementComponent
    ],
    imports: [
        StatementRoutingModule,
        SharedModule,
        CommonModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatListModule,
        MatSelectModule,
        MatTableModule,
        MatDialogModule,
        MatExpansionModule,
        MatTabsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule
    ]
})
export class StatementModule {

}
