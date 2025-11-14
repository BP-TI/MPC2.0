import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmitterService } from '../../../services/emitter.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { Usuario } from '../../models/Usuario';
import { AppConstants } from '../../constants/app.constants';
import { GlobalService } from '../../../shared/services/global.service';
import { ParameterService } from '../../../services/Parametros/parameter.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Parameter } from '../../../models/parametros';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  anio = "2025";
  subscription: Subscription;
  bandejaActive: boolean = false;
  arrayMenu: any = [];
  currentRoute = '';
  logoHeader = 'assets/images/logo-color.svg';
  user: Usuario;
  selectedIndex: number = -1;
  titleComponent?: string = "";
  navState: Boolean = true;
  loading=false;
  arrayParametros:any;

  @ViewChild('prototipoModal') prototipoModal: ModalDirective;
  @ViewChild('invalidateModal') invalidateModal: ModalDirective;
  @ViewChild('passwordModal') passwordModal: ModalDirective;

  constructor(private emitterService: EmitterService,
    public global: GlobalService,
    private router: Router,
    private parameterService: ParameterService
  ) { }

  ngOnInit() {
    this.loadScript('assets/js/sb-admin-2.min.js');
    this.arrayMenuOrigen();
    this.CargarSession();
  }

  CargarSession() {
    const data = sessionStorage.getItem(AppConstants.Session.USUARIOLOGIN);
    if (data) {
      this.user = JSON.parse(data);
    } else {
      this.router.navigateByUrl('login')
    }
  }

  private loadScript(scriptUrl: string) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);

  }

  goToRoute(route: string, index: number) {
    this.selectedIndex = index;
    route == "salir" ? this.prototipoModal.show() :
      route == "anular" ? this.invalidate() : this.navigateLogic(route);
  }

  private navigateLogic(route: string) {
    this.deleteStoredRoute(route);
    this.currentRoute = route;
    this.router.navigateByUrl(route);
  }

  cancelLogout() {
  }

  confirmLogout() {

  }

  LogoutExit() {
    sessionStorage.removeItem(AppConstants.Session.USUARIOLOGIN);
    this.router.navigate(['/login']);
  }

  closeAnulacion() {

  }

  sendAnulacion() {

  }

  invalidate() {

  }
  private deleteStoredRoute(url: string): void {

  }

  changePassword() {

  }

  async GetParametersAsync(array: Array<number>) {
    let modelRequest = { headerId: array };
    this.loading = true;
    await this.parameterService.getParametersList(modelRequest).toPromise().then((response) => {
          this.arrayParametros = response;
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
        });
  }

  async arrayMenuOrigen() {
    await this.GetParametersAsync([
      AppConstants.ParameterCode.MENU_LAYOUT
    ]);

    this.arrayMenu = this.arrayParametros.filter((x:any) => x.tabCabId === AppConstants.ParameterCode.MENU_LAYOUT)
          .map((x:any) => ({
            menuUrl: x.tabDet003,
            menuImage: x.tabDet007,
            menuName: x.tabDet001
          }));
  }

  stateNav() {
    this.navState = !this.navState;
  }

}
