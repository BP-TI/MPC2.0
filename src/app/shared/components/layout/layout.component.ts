import { Component, OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmitterService } from '../../../services/emitter.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { Usuario } from '../../models/Usuario';
import { AppConstants } from '../../constants/app.constants';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-layout',
  standalone:false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  anio="2025";
  subscription: Subscription;
  bandejaActive: boolean = false;
  arrayMenu:any = [];
  currentRoute = '';
  user:Usuario;

  @ViewChild('prototipoModal') prototipoModal: ModalDirective;
    @ViewChild('invalidateModal') invalidateModal: ModalDirective;
    @ViewChild('passwordModal') passwordModal: ModalDirective;

  constructor(private emitterService: EmitterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadScript('assets/js/sb-admin-2.min.js');
    this.arrayMenuOrigen();
    this.CargarSession();
  }

  CargarSession(){
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

  goToRoute(route: string) {
    route == "salir" ? this.prototipoModal.show() :
    route == "anular" ? this.invalidate() : this.navigateLogic(route);
  }

  private navigateLogic(route: string){
    this.deleteStoredRoute(route);
    this.currentRoute = route;
    this.router.navigateByUrl(route);
  }

  cancelLogout(){
  }

  confirmLogout(){

  }

  LogoutExit(){
    sessionStorage.removeItem(AppConstants.Session.USUARIOLOGIN);
    this.router.navigate(['/login']);
  }

  closeAnulacion(){

  }

  sendAnulacion(){

  }

  invalidate() {
    
  }
  private deleteStoredRoute(url: string): void {
    
  }

  changePassword(){

  }

  arrayMenuOrigen(){
    this.arrayMenu = [
    {
      menuUrl: '/generar-orden',
      menuImage: 'assets/images/carrito-de-compras.png',
      menuName: 'Planificación de Compra'
    },
    {
      menuUrl: '/abastecimiento-directo',
      menuImage: 'assets/images/carrito-de-compras-EXP.png',
      menuName: 'Abastecimiento Directo'
    },
    {
      menuUrl: '/login',
      menuImage: 'assets/images/calendarioVencido.png',
      menuName: 'O/C Vigencia Vencida'
    },
    {
      menuUrl: '/login',
      menuImage: 'assets/images/visualizarOC.png',
      menuName: 'Visualización de O/C'
    },
    {
      menuUrl: '/login',
      menuImage: 'assets/images/fecha.png',
      menuName: 'Cronograma Recepción'
    }
  ];
  }

}
