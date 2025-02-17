import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { DateAdapter } from "@angular/material/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ReplaySubject } from "rxjs";
import * as dayjs from 'dayjs';

@Component({
    selector: "giddh-datepicker",
    templateUrl: "./giddh-datepicker.component.html",
    styleUrls: ["./giddh-datepicker.component.scss"]
})
export class GiddhDatepickerComponent implements OnInit, OnDestroy {
    /** Input property for the start date */
    @Input() public startDate: string = '';
    /** Input property for the end date */
    @Input() public endDate: string = '';
    /** Flag to show error message */
    public showErrorMessage: boolean = false;
    /** Event emitter to notify when the date picker is closed */
    @Output() public onDatePickerIsClose: EventEmitter<{ startDate: string, endDate: string }> = new EventEmitter();
    /** Subject to release subscriptions */
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    /** Form group for handling date dateRange */
    public dateRange: FormGroup;

    constructor(
        private adapter: DateAdapter<any>,
        private formBuilder: FormBuilder
    ) {
        this.dateRange = this.formBuilder.group({
            start: [''],
            end: ['']
        });
    }

    /**
     * Initializes the component and sets the locale for the date adapter
     * 
     * @returns {void}
     * @memberof GiddhDatepickerComponent
     */
    public ngOnInit(): void {
        this.adapter.setLocale('fr');
        this.dateRange.patchValue({ start: this.startDate, end: this.endDate });
    }

    /**
     * Handles date picker close event and emits selected date dateRange
     * 
     * @returns {void}
     * @memberof GiddhDatepickerComponent
     */
    public onDatePickerClose(): void {
        let endDate: string = this.dateRange.value.end;
        let startDate: string = this.dateRange.value.start;
        this.showErrorMessage = !startDate || !endDate;
        if (!this.showErrorMessage && !(startDate === this.startDate && endDate === this.endDate)) {
            this.onDatePickerIsClose.emit({startDate, endDate });
        }
    }

    /**
     * Releases the memory and cleans up subscriptions
     * 
     * @returns {void}
     * @memberof GiddhDatepickerComponent
     */
    public ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }
}