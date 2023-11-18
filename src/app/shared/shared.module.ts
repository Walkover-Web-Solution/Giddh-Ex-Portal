import { NgModule } from "@angular/core";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FooterComponent } from "./footer/footer.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from "@angular/common";
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from "@angular/router";
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    declarations: [
        HeaderComponent,
        SidebarComponent,
        FooterComponent
    ],
    imports: [
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
        MatInputModule,
        MatTooltipModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatIconModule,
        MatProgressSpinnerModule,

    ],
    exports: [
        HeaderComponent,
        SidebarComponent,
        FooterComponent,
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
        MatInputModule,
        MatTooltipModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatIconModule,
        MatProgressSpinnerModule
    ]
})
export class SharedModule {

}
