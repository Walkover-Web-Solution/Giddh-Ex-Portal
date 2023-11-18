import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { PageNotFoundComponent } from "./page-not-found.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: PageNotFoundComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class PageNotFoundRoutingModule {
}
