import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/sidebar.module";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from "@angular/common";
import { InvoicePdfComponent } from "./invoice-pdf.component";
import { InvoicePdfRoutingModule } from "./invoice-pdf.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from "@angular/material/dialog";
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        InvoicePdfComponent
    ],
    imports: [
        InvoicePdfRoutingModule,
        SharedModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatSelectModule,
        MatDialogModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        ReactiveFormsModule
    ]
})
export class InvoicePdfModule {

}