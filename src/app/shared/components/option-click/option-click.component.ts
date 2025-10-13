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
  x = 0;
  y = 0;

  @Output() action = new EventEmitter<string>();

  open(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.visible = true;
  }

  close() {
    this.visible = false;
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
