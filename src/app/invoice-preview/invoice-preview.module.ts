import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InvoicePreviewComponent } from "./invoice-preview.component";
import { InvoicePdfRoutingModule } from "./invoice-preview.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from "@angular/material/dialog";
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        InvoicePreviewComponent
    ],
    imports: [
        InvoicePdfRoutingModule,
        SharedModule,
        CommonModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatSelectModule,
        MatDialogModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        MatFormFieldModule
    ]
})
export class InvoicePdfModule {

}
