import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthComponent } from "./auth.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: AuthComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class AuthRoutingModule {
}