import { NgModule } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from "@angular/common";
import { InvoiceComponent } from "./invoice.component";
import { InvoiceRoutingModule } from "./invoice.routing.module";
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
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { ReactiveFormsModule } from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    InvoiceComponent
  ],
  imports: [
    InvoiceRoutingModule,
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
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule
  ]
})
export class InvoiceModule {

}
