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
            path: "payment-pdf", loadChildren: () => import('../payment-pdf/payment-pdf.module').then(module => module.PaymentPdfModule),
          },
          {
            path: "statement", loadChildren: () => import('../statement/statement.module').then(module => module.StatementModule),
          },
          {
            path: "invoice-pdf", loadChildren: () => import('../invoice-pdf/invoice-pdf.module').then(module => module.InvoicePdfModule),
          },
          {
            path: "invoice-pay", loadChildren: () => import('../invoice-pay/invoice-pay.module').then(module => module.InvoicePayModule),
          },
          {
            path: "invoice-balance", loadChildren: () => import('../invoice-balance/invoice-balance.module').then(module => module.InvoiceBalanceModule),
          },
          {
            path: "detail", loadChildren: () => import('../detail/detail.module').then(module => module.DetailModule),
          }
        ]
      },
    ])
  ],
  exports: [RouterModule]
})
export class SidebarRoutingModule {
}
