import { RouterModule } from "@angular/router";
import { InvoicePdfComponent } from "./invoice-pdf.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: InvoicePdfComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class InvoicePdfRoutingModule {
}