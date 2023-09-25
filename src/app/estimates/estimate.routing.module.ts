import { RouterModule } from "@angular/router";
import { EstimateComponent } from "./estimate.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: EstimateComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class EstimateRoutingModule {
}