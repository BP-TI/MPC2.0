import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/Login/Login.component';
import { HomeComponent } from './components/Home/Home.component';
import { PurchasePlanningComponent } from './components/purchase-planning/purchase-planning.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { DirectSupplyComponent } from './components/direct-supply/direct-supply.component';
import { DisplayOrderComponent } from './components/display-order/display-order.component';
import { CurrentOrderComponent } from './components/current-order/current-order.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'generar-orden', component: PurchasePlanningComponent },
      { path: 'abastecimiento-directo', component: DirectSupplyComponent },
      { path: 'visualizacion-ordenes', component: DisplayOrderComponent },
      { path: 'vigencia-vencida', component: CurrentOrderComponent },
    ]
  },
  {path: '**', component: NotFoundComponent, data: {title: 'Page Not Found'}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }