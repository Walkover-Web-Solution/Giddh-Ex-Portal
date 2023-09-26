import { RouterModule } from "@angular/router";
import { InvoicePayComponent } from "./invoice-pay.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: InvoicePayComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class InvoicePayRoutingModule {
}