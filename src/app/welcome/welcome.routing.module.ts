import { RouterModule } from "@angular/router";
import { WelcomeComponent } from "./welcome.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: WelcomeComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class WelcomeRoutingModule {
}
