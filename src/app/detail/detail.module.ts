import { NgModule } from "@angular/core";
import { DetailComponent } from "./detail.component";
import { DetailRoutingModule } from "./detail.routing.module";
import { SharedModule } from "../shared/sidebar.module";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        DetailComponent
    ],
    imports: [
        DetailRoutingModule,
        SharedModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule
    ]
})
export class DetailModule {

}