import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AccountStatementComponent } from "./account-statement.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: AccountStatementComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class AccountStatementRoutingModule {
}
