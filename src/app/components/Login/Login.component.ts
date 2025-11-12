import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeviceObject } from '../../models/device';
import { Router } from '@angular/router';
import { LoginService } from '../../services/Login/login.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService, MessageSeverity } from '../../shared/services/alert.service';
import { Usuario } from '../../shared/models/Usuario';
import { AppConstants } from '../../shared/constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css']
})
export class LoginComponent implements OnInit {

  private singleExecutionSubscription: Subscription;
  public token: string;
  public logowhite: string = 'assets/images/logo-white.svg';

  constructor(private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private alertaService: AlertService
  ) { }

  @Output() navigateToEvent = new EventEmitter<string>();

  loginForm: FormGroup;

  loading: boolean = false;
  stop: boolean = false;
  isInvalidFieldUser: boolean = false;
  isInvalidFieldPassword: boolean = false;
  usuario: string = '';
  contrasena: string = '';
  isCordova: boolean = false;
  deviceSession: DeviceObject | null = null;

  appVersion: string = "123";
  appCurrentVersion: string = "";
  appCurrentVersionMessage: string = "";

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  logueo() {
    this.loading = true;
    this.loginService.getUserLogin(this.usuario, this.contrasena).subscribe(
      (response) => {
        this.loading = false;
        if (response.codigo === 0) {
          this.AlertToast("Error: Usuario y/o contraseña incorrectos.", 'error2');
        } else {
          this.cargarDatosSession(response);
          this.router.navigate(['/home']);
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

  cargarDatosSession(model: Usuario) {

    sessionStorage.setItem(AppConstants.Session.USUARIOLOGIN, JSON.stringify(model));
  }


  navigateTo(route: string) {
    this.navigateToEvent.next(route);
  }

  executeCaptcha() {

  }

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }

}
