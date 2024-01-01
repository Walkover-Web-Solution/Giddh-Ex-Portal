import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { ServiceModule } from './services/service.module';
import { metaReducers, reducers } from './store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from './shared/shared.module';
import { DecoratorsModule } from './decorators/decorators.module';
import { PortalHttpInterceptor } from './services/http.interceptor';
import { SnackBarModule } from './shared/snackbar/snackbar.module';
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SharedModule,
        MatSnackBarModule,
        ServiceModule.forRoot(),
        DecoratorsModule.forRoot(),
        StoreModule.forRoot(reducers, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
        SnackBarModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: PortalHttpInterceptor,
            multi: true
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
