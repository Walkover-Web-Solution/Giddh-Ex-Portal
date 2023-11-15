import { NgModule } from "@angular/core";
import { WelcomeComponent } from "./welcome.component";
import { WelcomeRoutingModule } from "./welcome.routing.module";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    WelcomeComponent
  ],
  imports: [
    WelcomeRoutingModule,
    SharedModule,
    CommonModule
  ]
})
export class WelcomeModule {

}
