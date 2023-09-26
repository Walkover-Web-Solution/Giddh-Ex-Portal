import { RouterModule } from "@angular/router";
import { DetailComponent } from "./detail.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: DetailComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class DetailRoutingModule {
}