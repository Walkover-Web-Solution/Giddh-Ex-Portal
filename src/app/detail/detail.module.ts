import { NgModule } from "@angular/core";
import { DetailComponent } from "./detail.component";
import { DetailRoutingModule } from "./detail.routing.module";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        DetailComponent
    ],
    imports: [
        DetailRoutingModule,
        SharedModule,
        CommonModule
    ]
})
export class DetailModule {

}
