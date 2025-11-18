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
import { DisplayOrderComponent } from './components/display-order/display-order.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CurrentOrderComponent } from './components/current-order/current-order.component';
import { InventoryPolicyComponent } from './components/inventory-policy/inventory-policy.component';
import { PurchaseOrderComponent } from './components/purchase-order/purchase-order.component';
import { AlertToastComponent } from './shared/components/alertToast/alertToast.component';
import { ShowSubstitutesComponent } from './components/show-substitutes/show-substitutes.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { ConfirmacionModalComponent } from './modales/confirmacionModal/confirmacionModal.component';
import { ConfirmacionClaveModalComponent } from './modales/confirmacion-clave-modal/confirmacion-clave-modal.component';
import { AddProductAbadiComponent } from './components/add-product-abadi/add-productAbadi.component';
import { ShowSubstitutesAbadiComponent } from './components/show-substitutesAbadi/show-substitutesAbadi.component';
import { DetalleStockBoticaComponent } from './modales/purchase-planning/detalle-stock-botica/detalle-stock-botica.component';
import { AutorizacionModalComponent } from './modales/autorizacion-modal/autorizacion-modal.component';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';


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
    OptionClickComponent,
    DisplayOrderComponent,
    CurrentOrderComponent,
    InventoryPolicyComponent,
    PurchaseOrderComponent,
    AlertToastComponent,
    ShowSubstitutesComponent,
    ConfirmacionModalComponent,
    ConfirmacionClaveModalComponent,
    AddProductComponent,
    ShowSubstitutesAbadiComponent,
    AddProductAbadiComponent,
    DetalleStockBoticaComponent,
    AutorizacionModalComponent,
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
    PdfViewerModule,
    HttpClientModule,
    ToastaModule.forRoot(),
    NgbDatepickerModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), ToastaService],
  exports: [
    LayoutComponent,
    OptionClickComponent,
    InventoryPolicyComponent,
    PurchaseOrderComponent,
    AlertToastComponent,
    ShowSubstitutesComponent,
    AddProductComponent,
    ConfirmacionModalComponent,
    AddProductAbadiComponent,
    ShowSubstitutesAbadiComponent,
    DetalleStockBoticaComponent,
    AutorizacionModalComponent,

  ],
  bootstrap: [App],
})
export class AppModule {}
