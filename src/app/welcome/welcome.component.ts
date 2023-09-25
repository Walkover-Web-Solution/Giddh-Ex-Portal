import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
    selector: "welcome",
    templateUrl: "welcome.component.html",
    styleUrls: ["welcome.component.scss"]
})
export class WelcomeComponent implements OnInit, OnDestroy {

    constructor(

    ) {

    }

    public ngOnInit(): void {
        document.querySelector('body')?.classList.add('welcome-main');

    }

    public ngOnDestroy(): void {
        document.querySelector('body')?.classList.remove('welcome-main');

    }
}