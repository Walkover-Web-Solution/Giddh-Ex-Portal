import { RouterModule } from "@angular/router";
import { InvoiceComponent } from "./invoice.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: InvoiceComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class InvoiceRoutingModule {
}