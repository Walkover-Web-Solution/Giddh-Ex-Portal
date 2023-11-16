import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { userLoginStateEnum } from "src/app/models/user-login-state";

@Component({
  selector: "header",
  templateUrl: "header.component.html",
  styleUrls: ["header.component.scss"]
})
export class HeaderComponent {
  @Input() accountName: any;

  constructor() {
  }
}
