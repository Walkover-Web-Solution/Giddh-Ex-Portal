import { NgModule } from "@angular/core";
import { SwitchAccountComponent } from "./switch-account.component";
import { CommonModule } from "@angular/common";
import { SwitchAccountRoutingModule } from "./switch-account.routing.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
    declarations: [
        SwitchAccountComponent
    ],
    imports: [
        CommonModule,
        SwitchAccountRoutingModule,
        MatProgressSpinnerModule
    ]
})
export class SwitchAccountModule {
    
}