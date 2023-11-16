import { RouterModule } from "@angular/router";
import { PaymentPreviewComponent } from "./payment-preview.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: PaymentPreviewComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class PaymentPdfRoutingModule {
}
