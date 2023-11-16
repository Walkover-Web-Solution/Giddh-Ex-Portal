import { RouterModule } from "@angular/router";
import { InvoicePreviewComponent } from "./invoice-preview.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: InvoicePreviewComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class InvoicePdfRoutingModule {
}
