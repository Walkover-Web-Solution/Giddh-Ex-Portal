import { Component, OnDestroy, OnInit } from "@angular/core";
import { Store } from '@ngrx/store';
import * as UserActions from '../store/actions/session.action';
declare var initVerification: any;
@Component({
    selector: "login",
    templateUrl: "login.component.html",
    styleUrls: ["login.component.scss"]
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private store: Store) { }



  public ngOnInit(): void {
    let configuration = {
      referenceId: "117230p1697093599652797df30cea",
      addInfo: {
        redirect_path: "/auth"
      },
      success: (data: any) => {
        console.log(data);

        // this.ngZone.run(() => {
        // this.initiateLogin(data);
        // });
      },
      failure: (error: any) => {
        // this.toaster.errorToast(error?.message);
      }
    };

    /* OTP LOGIN */
    let scriptTag = document.createElement('script');
    scriptTag.src = 'https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js';
    scriptTag.type = 'text/javascript';
    scriptTag.defer = true;
    scriptTag.onload = () => {
      initVerification(configuration);
      // this.loaderService.hide();
    };
    document.getElementById("login-button").appendChild(scriptTag);
      const user = { name: 'John Doe' }; // Replace with your authentication logic
      this.store.dispatch(UserActions.login({ user }));
    }

  public login(): void {


  }

    public ngOnDestroy(): void {

    }
}
