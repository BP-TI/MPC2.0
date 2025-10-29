import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-option-click',
  standalone:false,
  templateUrl: './option-click.component.html',
  styleUrls: ['./option-click.component.css']
})
export class OptionClickComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  visible = false;
  visible2 = false;
  
  x = 0;
  y = 0;

  @Output() action = new EventEmitter<string>();

  open(x: number, y: number,opcionMenu:number) {
    this.x = x;
    this.y = y;
    switch(opcionMenu){
      case 1:
        this.visible2=false;
        this.visible = true;
         break;
      case 2:
        this.visible2=true;
        this.visible=false;
        break;
      case 3:
        this.visible=false;
        this.visible2 = true; 
         break;
    }
    
  }

  close() {
    this.visible = false;
    this.visible2 = false;
  }

  onAction(type: string) {
    this.action.emit(type);
    this.close();
  }

  // Cierra el menú si se hace clic fuera
  @HostListener('document:click')
  onDocumentClick() {
    this.close();
  }

}
