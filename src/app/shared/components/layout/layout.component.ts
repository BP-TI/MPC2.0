import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmitterService } from '../../../services/emitter.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { Usuario } from '../../models/Usuario';
import { AppConstants } from '../../constants/app.constants';
import { GlobalService } from '../../../shared/services/global.service';

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
  navState:Boolean = true;

  @ViewChild('prototipoModal') prototipoModal: ModalDirective;
  @ViewChild('invalidateModal') invalidateModal: ModalDirective;
  @ViewChild('passwordModal') passwordModal: ModalDirective;

  constructor(private emitterService: EmitterService,
    public global: GlobalService,
    private router: Router
  ) { }

  ngOnInit() {

    this.titleComponent = localStorage.getItem('title-component')?.toString();
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

  arrayMenuOrigen() {
    this.arrayMenu = [
      {
        menuUrl: '/generar-orden',
        menuImage: 'p-1 fa-solid fa-cart-shopping',
        menuName: 'Planificación de Compra'
      },
      {
        menuUrl: '/abastecimiento-directo',
        menuImage: 'p-1 fa-solid fa-cart-plus',
        menuName: 'Abastecimiento Directo'
      },
      {
        menuUrl: '/vigencia-vencida',
        menuImage: 'p-1 fa-solid fa-book-skull',
        menuName: 'O/C Vigencia Vencida'
      },
      {
        menuUrl: '/visualizacion-ordenes',
        menuImage: 'p-1 fa-solid fa-binoculars',
        menuName: 'Visualización de O/C'
      },
      {
        menuUrl: '/cronograma-recepcion',
        menuImage: 'p-1 fa-solid fa-calendar-week',
        menuName: 'Cronograma Recepción'
      }
    ];
  }

  stateNav(){
    this.navState = !this.navState;
  }

}
