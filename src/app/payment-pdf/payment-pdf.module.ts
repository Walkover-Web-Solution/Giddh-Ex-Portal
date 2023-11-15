import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PaymentPdfComponent } from "./payment-pdf.component";
import { PaymentPdfRoutingModule } from "./payment-pdf.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        PaymentPdfComponent
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
        MatAutocompleteModule
    ]
})
export class PaymentPdfModule {

}
