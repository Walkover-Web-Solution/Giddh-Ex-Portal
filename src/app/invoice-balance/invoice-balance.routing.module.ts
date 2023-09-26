import { RouterModule } from "@angular/router";
import { InvoiceBalanceComponent } from "./invoice-balance.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: InvoiceBalanceComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class InvoiceBalanceRoutingModule {
}