import { RouterModule } from "@angular/router";
import { SwitchAccountComponent } from "./switch-account.component";
import { NgModule } from "@angular/core";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: SwitchAccountComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class SwitchAccountRoutingModule {
}
