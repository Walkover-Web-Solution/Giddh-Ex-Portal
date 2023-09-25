import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: "login", loadChildren: () => import('./login/login.module').then(module => module.LoginModule) },
    { path: "", loadChildren: () => import('./shared/sidebar.module').then(module => module.SharedModule) }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
