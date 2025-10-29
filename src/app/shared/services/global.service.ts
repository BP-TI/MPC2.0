import { Injectable, numberAttribute, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  componenteTitle = signal<string>('');
  month:string[] = [
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

  getMonthName(monthNumber: number): string{
    if(monthNumber>=0 &&  monthNumber <=11) {    
      return this.month[monthNumber];
    }     
    return '';
  }

}
