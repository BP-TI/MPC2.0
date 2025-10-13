import { Component, OnInit,ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppConstants } from '../../constants/app.constants';
import { Cliente, UserPasswordModel } from '../../../models/persona';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  anio="2025";
  isNavRipley: boolean = false;
  isProducts: boolean = true;
  isSimulacion: boolean = false;
  isVerificacion: boolean = false;
  isValidacion: boolean = false;
  isClientsDetails: boolean = false;
  bandejaActive: boolean = false;
  subscription: Subscription;
  isAdmin: boolean = sessionStorage.getItem(AppConstants.Session.USERROLID) == AppConstants.RolesCode.ADMINISTRADOR ? true : false;
  isAnalista: boolean = sessionStorage.getItem(AppConstants.Session.USERROLID) == AppConstants.RolesCode.ANALISTA ? true : false;
  userId: string = sessionStorage.getItem(AppConstants.Session.USERID)??"";

  loginPath: string = "login";
  loading: boolean = false;
  cliente: Cliente = new Cliente();
  comentarioAnulacionForm: string = '';
  motivoAnulacionForm: any;

  motivosAnulacion:any = [];

  modalTitle: string = AppConstants.TitleModal.CHANGE_PASSWORD;
  isChangePassword = false;
  resetPasswordForm: FormGroup;
  equalsPassword: boolean = false;
  userPasswordModel: UserPasswordModel = new UserPasswordModel();
  finalizacionActive: boolean = false;

  arrayMenu:any = [];
  currentRoute = '';

  @ViewChild('prototipoModal') prototipoModal: ModalDirective;
  @ViewChild('invalidateModal') invalidateModal: ModalDirective;
  @ViewChild('passwordModal') passwordModal: ModalDirective;

  agencyCode : string = sessionStorage.getItem(AppConstants.Session.AGENCYCODE) ?? "";
  agencyName : string = sessionStorage.getItem(AppConstants.Session.AGENCYNAME) ?? "";
  constructor(private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit() {
    this.createForm();
    this.arrayMenuOrigen();
  }
  arrayMenuOrigen(){
    this.arrayMenu = [
    {
      menuUrl: '/generar-orden',
      menuImage: 'assets/images/carrito-de-compras.png',
      menuName: 'Planificación de Compra'
    },
    {
      menuUrl: '/login',
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

  createForm() {
      this.resetPasswordForm = this.formBuilder.group({
          userId: '',
          currentPassword: ['', [this.noWhiteSpaceValidator]],
          newPassword: ['', [this.noWhiteSpaceValidator,
          this.passwordValidator,
          Validators.minLength(8)]],
          confirmNewPassword: ['', [this.noWhiteSpaceValidator,
          this.passwordValidator,
          Validators.minLength(8)]]
      })
  }

  public noWhiteSpaceValidator(control: FormControl) {
      const isWhitespace = (control.value || '').toString().trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { 'required': true };
  }

  formErrors = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
  }

  public passwordValidator(control: FormControl) {
      const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;
      if (!passwordRegexp.test(control.value)) {
          return { "pattern": true };
      }
      return null;
  }

  hideNav(){}

  showNav(){}

  showTransaction(){
    let result = false;
    let rolId = sessionStorage.getItem(AppConstants.Session.USERROLID);
    result = rolId == AppConstants.RolesCode.ASESOR ? true :
             rolId == AppConstants.RolesCode.CALLCENTER ? true :
             rolId == AppConstants.RolesCode.GESTOR ? true : false;    
    return result;     
  }

  goToRoute(route: string) {
    route == "salir" ? this.prototipoModal.show() :
    route == "anular" ? this.invalidate() : this.navigateLogic(route);
  }

  private navigateLogic(route: string){
    this.deleteStoredRoute(route);
    this.currentRoute = route;
    this.router.navigateByUrl(route)
  }

  private deleteStoredRoute(url: string): void {
    
  }

  cancelLogout(){
  }

  confirmLogout(){

  }

  closeAnulacion(){

  }

  sendAnulacion(){

  }

  invalidate() {
    
  }

  changePassword(){

  }

}
