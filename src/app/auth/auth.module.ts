import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthRoutingModule } from './auth.routing.module';
import { SharedModule } from '../shared/sidebar.module';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    AuthRoutingModule,
    SharedModule
  ],
  declarations: [AuthComponent]
})
export class AuthModule { }
