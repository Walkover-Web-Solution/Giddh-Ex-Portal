import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { SidebarComponent } from "./sidebar/sidebar.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: SidebarComponent,
                children: [
                    {
                        path: "welcome", loadChildren: () => import('../welcome/welcome.module').then(module => module.WelcomeModule),
                    },
                    {
                        path: "estimate", loadChildren: () => import('../estimates/estimate.module').then(module => module.EstimateModule),
                    },
                    {
                        path: "invoice", loadChildren: () => import('../invoice/invoice.module').then(module => module.InvoiceModule),
                    },
                    {
                        path: "payment", loadChildren: () => import('../payment/payment.module').then(module => module.PaymentModule),
                    },
                    {
                        path: "statement", loadChildren: () => import('../statement/statement.module').then(module => module.StatementModule),
                    }
                ]
            },
        ])
    ],
    exports: [RouterModule]
})
export class SidebarRoutingModule {
}