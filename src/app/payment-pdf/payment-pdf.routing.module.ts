import { RouterModule } from "@angular/router";
import { PaymentPdfComponent } from "./payment-pdf.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: PaymentPdfComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class PaymentPdfRoutingModule {
}