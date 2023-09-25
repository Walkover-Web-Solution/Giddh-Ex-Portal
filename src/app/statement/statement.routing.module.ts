import { RouterModule } from "@angular/router";
import { StatementComponent } from "./statement.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: StatementComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class StatementRoutingModule {
}