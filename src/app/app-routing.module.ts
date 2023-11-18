import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: "page-not-found", loadChildren: () => import('./page-not-found/page-not-found.module').then(module => module.PageNotFoundModule) },
    { path: ":companyDomainUniqueName", loadChildren: () => import('./login/login.module').then(module => module.LoginModule) },
    { path: ":companyDomainUniqueName/login", loadChildren: () => import('./login/login.module').then(module => module.LoginModule) },
    { path: ":companyDomainUniqueName/auth", loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule) },
    { path: ":companyDomainUniqueName/welcome", loadChildren: () => import('./welcome/welcome.module').then(module => module.WelcomeModule) },
    { path: ":companyDomainUniqueName/invoice", loadChildren: () => import('./invoice/invoice.module').then(module => module.InvoiceModule) },
    { path: ":companyDomainUniqueName/payment", loadChildren: () => import('./payment/payment.module').then(module => module.PaymentModule) },
    { path: ":companyDomainUniqueName/payment/preview", loadChildren: () => import('./payment-preview/payment-preview.module').then(module => module.PaymentPdfModule) },
    { path: ":companyDomainUniqueName/invoice/preview", loadChildren: () => import('./invoice-preview/invoice-preview.module').then(module => module.InvoicePdfModule) },
    { path: ":companyDomainUniqueName/invoice-pay", loadChildren: () => import('./invoice-pay/invoice-pay.module').then(module => module.InvoicePayModule) },
    { path: '', redirectTo: 'page-not-found', pathMatch: 'full' },
    { path: '**', redirectTo: 'page-not-found', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
