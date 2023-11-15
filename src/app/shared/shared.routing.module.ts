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
            path: ":companyDomainUniqueName/welcome", loadChildren: () => import('../welcome/welcome.module').then(module => module.WelcomeModule),
          },
          {
            path: ":companyDomainUniqueName/estimate", loadChildren: () => import('../estimates/estimate.module').then(module => module.EstimateModule),
          },
          {
            path: ":companyDomainUniqueName/invoice", loadChildren: () => import('../invoice/invoice.module').then(module => module.InvoiceModule),
          },
          {
            path: ":companyDomainUniqueName/payment", loadChildren: () => import('../payment/payment.module').then(module => module.PaymentModule),
          },
          {
            path: ":companyDomainUniqueName/payment/preview", loadChildren: () => import('../payment-pdf/payment-pdf.module').then(module => module.PaymentPdfModule),
          },
          {
            path: ":companyDomainUniqueName/statement", loadChildren: () => import('../statement/statement.module').then(module => module.StatementModule),
          },
          {
            path: ":companyDomainUniqueName/invoice/preview", loadChildren: () => import('../invoice-pdf/invoice-pdf.module').then(module => module.InvoicePdfModule),
          },
          {
            path: ":companyDomainUniqueName/invoice-pay", loadChildren: () => import('../invoice-pay/invoice-pay.module').then(module => module.InvoicePayModule),
          },
          {
            path: ":companyDomainUniqueName/invoice-balance", loadChildren: () => import('../invoice-balance/invoice-balance.module').then(module => module.InvoiceBalanceModule),
          },
          {
            path: ":companyDomainUniqueName/detail", loadChildren: () => import('../detail/detail.module').then(module => module.DetailModule),
          }
        ]
      },
    ])
  ],
  exports: [RouterModule]
})
export class SidebarRoutingModule {
}
