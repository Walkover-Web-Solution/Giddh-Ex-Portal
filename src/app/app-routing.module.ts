import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "login/:companyDomainUniqueName", loadChildren: () => import('./login/login.module').then(module => module.LoginModule) },
  { path: "auth/:companyDomainUniqueName", loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule) },
  { path: "", loadChildren: () => import('./shared/sidebar.module').then(module => module.SharedModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
