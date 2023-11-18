import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { SidebarComponent } from "./sidebar/sidebar.component";

const sidebarRoutes: Routes = [
    {
        path: '', component: SidebarComponent,
        children: [
            { path: ":companyDomainUniqueName/welcome", loadChildren: () => import('../welcome/welcome.module').then(module => module.WelcomeModule) },
            { path: ":companyDomainUniqueName/invoice", loadChildren: () => import('../invoice/invoice.module').then(module => module.InvoiceModule) },
            { path: ":companyDomainUniqueName/payment", loadChildren: () => import('../payment/payment.module').then(module => module.PaymentModule) },
            { path: ":companyDomainUniqueName/payment/preview", loadChildren: () => import('../payment-preview/payment-preview.module').then(module => module.PaymentPdfModule) },
            { path: ":companyDomainUniqueName/invoice/preview", loadChildren: () => import('../invoice-preview/invoice-preview.module').then(module => module.InvoicePdfModule) },
            { path: ":companyDomainUniqueName/invoice-pay", loadChildren: () => import('../invoice-pay/invoice-pay.module').then(module => module.InvoicePayModule) }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(sidebarRoutes)],
    exports: [RouterModule]
})
export class SidebarRoutingModule { }
