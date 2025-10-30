import { Injectable, numberAttribute, signal } from '@angular/core';
import { UserDataLogin } from '../../models/persona';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  componenteTitle = signal<string>('');
  month: string[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  constructor() { }

  // Métodos auxiliares (opcionales)
  setGlobalVar(value: string) {
    this.componenteTitle.set(value);
  }

  updateGlobalVar(callback: (current: string) => string) {
    this.componenteTitle.update(callback);
  }

  getGlobalVar() {
    return this.componenteTitle();
  }

  getMonthName(monthNumber: number): string {
    if (monthNumber >= 0 && monthNumber <= 11) {
      return this.month[monthNumber];
    }
    return '';
  }

  getDataUserLogin():UserDataLogin {
    let dataSessionStorage = sessionStorage.getItem('USUARIOLOGIN')?.toString();
    let dataUsuario = JSON.parse(dataSessionStorage ? dataSessionStorage : '');

    let data: UserDataLogin = {
      NombreUsuario: dataUsuario.NombreUsuario,
      cargoUsuario: dataUsuario.cargoUsuario, 
      codigo: dataUsuario.codigo,
      codigoGrupo: dataUsuario.codigoGrupo,
      codigoUsuario: dataUsuario.codigoUsuario,
      message: dataUsuario.message,
      permisos: dataUsuario.permisos,
      siscod: dataUsuario.siscod,
      usuario: dataUsuario.usuario,
    }
    return data;
  }

}
