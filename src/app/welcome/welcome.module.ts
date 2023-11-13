import { NgModule } from "@angular/core";
import { WelcomeComponent } from "./welcome.component";
import { WelcomeRoutingModule } from "./welcome.routing.module";
import { SharedModule } from "../shared/sidebar.module";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from "@angular/common";
import { MatSnackBarModule } from "@angular/material/snack-bar";

@NgModule({
    declarations: [
        WelcomeComponent
    ],
    imports: [
        WelcomeRoutingModule,
        SharedModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
      CommonModule,
        MatSnackBarModule
    ]
})
export class WelcomeModule {

}
