import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login.component";
import { LoginRoutingModule } from "./login.routing.module";
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        LoginRoutingModule,
        SharedModule,
        CommonModule,
        MatCheckboxModule
    ]
})
export class LoginModule {

}
