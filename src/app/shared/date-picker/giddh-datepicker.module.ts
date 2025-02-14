import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";
import { GiddhDatepickerComponent } from "./giddh-datepicker.component";

@NgModule({
    declarations: [
        GiddhDatepickerComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    exports: [
        GiddhDatepickerComponent
    ]
})
export class GiddhDatepickerModule { }
