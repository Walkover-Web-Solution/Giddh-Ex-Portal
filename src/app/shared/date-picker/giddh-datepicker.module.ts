import { LOCALE_ID, NgModule } from "@angular/core";
import { CommonModule, formatDate } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { GiddhDatepickerComponent } from "./giddh-datepicker.component";

export const GIDDH_DATEPICKER_FORMAT = {
    parse: { dateInput: 'dd-MM-yyyy' },
    display: { dateInput: 'input' }
};

export class PickDateAdapter extends NativeDateAdapter {
    parse(value: any, parseFormat: string | any): Date | null {
        if (typeof value === 'string') {
            const parts = value.split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts.map(part => parseInt(part, 10));
                const date = new Date(year, month - 1, day);
                return isNaN(date.getTime()) ? null : date;
            }
        }
        return super.parse(value, parseFormat);
    }

    format(date: Date, displayFormat: any): string {
        const format = displayFormat?.dateInput ?? displayFormat;
        switch (format) {
            case 'input':
                return formatDate(date, 'dd-MM-yyyy', this.locale);
            default:
                return formatDate(date, 'MMM dd, yyyy', this.locale);
        }
    }
}

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
    providers: [
        MatDatepickerModule,
        MatNativeDateModule,
        { provide: MAT_DATE_FORMATS, useValue: GIDDH_DATEPICKER_FORMAT },
        { provide: DateAdapter, useClass: PickDateAdapter },
        { provide: LOCALE_ID, useValue: 'en' }
    ],
    exports: [
        GiddhDatepickerComponent
    ]
})
export class GiddhDatepickerModule { }
