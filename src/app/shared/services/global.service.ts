import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  componenteTitle = signal<string>('');

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
}
