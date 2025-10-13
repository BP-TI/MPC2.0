import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  loading: boolean = false;
  bandejaActive:false;
  constructor(public router: Router,){

  }
  protected readonly title = signal('planningModule-app');


  navigateTo(_$event: any, path: any) {
    
    this.router.navigate([path]);
  }
}
