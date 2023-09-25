import { RouterModule } from "@angular/router";
import { PaymentComponent } from "./payment.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: PaymentComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class PaymentRoutingModule {
}