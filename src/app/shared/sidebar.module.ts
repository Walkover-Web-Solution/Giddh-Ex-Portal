import { NgModule } from "@angular/core";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FooterComponent } from "./footer/footer.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from "@angular/common";
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { SidebarRoutingModule } from "./sidebar.routing.module";
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';
import { MatInputModule } from "@angular/material/input";

@NgModule({
    declarations: [
        HeaderComponent,
        SidebarComponent,
        FooterComponent
    ],
    imports: [
        SidebarRoutingModule,
        MatSidenavModule,
        MatToolbarModule,
        CommonModule,
        MatTreeModule,
        MatIconModule,
        RouterModule,
        MatButtonModule,
        MatRadioModule,
        MatFormFieldModule,
        MatSelectModule,
        MatListModule,
        MatDialogModule,
        MatMenuModule,
        LayoutModule,
        MatInputModule
    ],
    exports: [
        HeaderComponent,
        SidebarComponent,
        FooterComponent
    ]
})
export class SharedModule {

}