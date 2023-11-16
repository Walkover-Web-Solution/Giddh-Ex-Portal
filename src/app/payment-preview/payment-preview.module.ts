import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaymentPreviewComponent } from "./payment-preview.component";
import { PaymentPdfRoutingModule } from "./payment-preview.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SharedModule } from "../shared/shared.module";
import { MatSnackBarModule } from "@angular/material/snack-bar";

@NgModule({
    declarations: [
        PaymentPreviewComponent
    ],
    imports: [
        PaymentPdfRoutingModule,
        SharedModule,
        CommonModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatSelectModule,
        MatDialogModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatSnackBarModule
    ]
})
export class PaymentPdfModule {

}
