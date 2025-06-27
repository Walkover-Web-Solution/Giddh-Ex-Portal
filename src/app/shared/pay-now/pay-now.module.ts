import { NgModule } from "@angular/core";
import { GiddhPayNowComponent } from "./pay-now.component";
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@NgModule({
    declarations: [
        GiddhPayNowComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule
    ],
    providers: [],
    exports: [
        GiddhPayNowComponent
    ]
})
export class GiddhPayNowModule { }
