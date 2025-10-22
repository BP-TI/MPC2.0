import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/Login/Login.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { HomeComponent } from './components/Home/Home.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PurchasePlanningComponent } from './components/purchase-planning/purchase-planning.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import { ToastaModule } from 'ngx-toasta';
import { ToastaService } from 'ngx-toasta';
import { OptionClickComponent } from './shared/components/option-click/option-click.component';
import { DirectSupplyComponent } from './components/direct-supply/direct-supply.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    App,
    LoginComponent,
    LayoutComponent,
    LoadingComponent,
    HomeComponent,
    HeaderComponent,
    PurchasePlanningComponent,
    DirectSupplyComponent,
    OptionClickComponent
  ],
  imports: [
    NgbModalModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    NgxDatatableModule,
    NgSelectModule,
    HttpClientModule,
    ToastaModule.forRoot()
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    ToastaService
  ],
  exports:[
    LayoutComponent,
    OptionClickComponent
  ],
  bootstrap: [App]
})
export class AppModule { }
