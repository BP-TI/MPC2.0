import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsCLickHeadMenuAC } from '../../models/option-click';

@Component({
  selector: 'app-option-click',
  standalone: false,
  templateUrl: './option-click.component.html',
  styleUrls: ['./option-click.component.css']
})
export class OptionClickComponent implements OnInit {
  condiciones: OptionsCLickHeadMenuAC[]=[];

  constructor() { }

  ngOnInit() {
  }

  visible = false;
  visible2 = false;
  visible4 = false;

  x = 0;
  y = 0;

  @Output() action = new EventEmitter<string>();

  open(x: number, y: number, opcionMenu: number) {
    this.x = x;
    this.y = y;
    switch (opcionMenu) {
      case 1:
        this.visible2 = false;
        this.visible = true;
        this.visible4 = false
        break;
      case 2:
        this.visible2 = true;
        this.visible = false;
        this.visible4 = false;
        break;
      case 3:
        this.visible = false;
        this.visible2 = true;
        this.visible4 = false;
        break;
      case 4:
        this.visible = false;
        this.visible2 = false;
        if(this.visible4 == false){
          this.visible4 = true
        }else{
          this.visible4 = false
        }
        break;
    }

  }

  close() {
    this.visible = false;
    this.visible2 = false;
  }

  closeHeadTableAC(){
    this.visible4 = false;
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
