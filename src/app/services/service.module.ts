
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { HttpWrapperService } from "./http-wrapper.service";
import { PortalErrorHandler } from "./catch-manager/catchmanger";
import { GeneralService } from "./general.service";
import { AuthService } from "./auth.service";
import { DashboardService } from "./dashboard.service.";
import { InvoiceService } from "./invoice.service";
import { PaymentService } from "./payment.service.";
import { WelcomeService } from "./welcome.service";
import { CommonService } from "./common.service";

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
    imports: [CommonModule, RouterModule],
    exports: [CommonModule, FormsModule, RouterModule]
})
export class ServiceModule {
    public static forRoot(): ModuleWithProviders<ServiceModule> {
        return {
            ngModule: ServiceModule,
            providers: [
                PortalErrorHandler,
                HttpWrapperService,
                GeneralService,
                AuthService,
                DashboardService,
                InvoiceService,
                PaymentService,
                WelcomeService,
                CommonService
            ]
        };
    }
}
