import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: ":companyDomainUniqueName/login", loadChildren: () => import('./login/login.module').then(module => module.LoginModule) },
  { path: ":companyDomainUniqueName/auth", loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule) },
  { path: "", loadChildren: () => import('./shared/shared.module').then(module => module.SharedModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
