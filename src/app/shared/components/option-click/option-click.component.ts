import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../models/option-click';

@Component({
  selector: 'app-option-click',
  standalone: false,
  templateUrl: './option-click.component.html',
  styleUrls: ['./option-click.component.css']
})
export class OptionClickComponent implements OnInit {
  nameProducto: OptionsCLickHeadMenuAC[] = []; /* Data del componente padre*/
  filterColumn: string = ''; /* Indica la columna para hacer el filtro*/
  // optionFilter: string[] = [];

  /*-- --*/
  menuListLabora: OptionsClickHeadMenuAC2[] = [];
  menuLisTipo: OptionsClickHeadMenuAC2[] = [];
  menuLisCompraFinal: OptionsClickHeadMenuAC2[] = [];

  checkAllDescription: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  visible = false;
  visible2 = false;
  visible4 = false;

  x = 0;
  y = 0;

  @Output() action = new EventEmitter<string>();
  @Output() filter = new EventEmitter<string>();

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
        this.onChangecheckAll();
        this.visible = false;
        this.visible2 = false;
        if (this.visible4 == false) {
          this.visible4 = true
        } else {
          this.visible4 = false
        }
        break;
    }

  }

  close() {
    this.visible = false;
    this.visible2 = false;
  }

  closeHeadTableAC() {
    this.visible4 = false;
  }

  onAction(type: string) {
    this.action.emit(type);
    this.close();
  }

  onChangeCheckedAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    switch (this.filterColumn) {
      case 'Descripción':
        if (checked) {
          this.nameProducto.forEach(p => p.check = true);
        } else {
          this.nameProducto.forEach(p => p.check = false);
        }
        break;
      case 'Labora.':
        if (checked) {
          this.menuListLabora.forEach(p => p.check = true);
        } else {
          this.menuListLabora.forEach(p => p.check = false);
        }
        break;
    }
  }

  onChangecheckAll() {
    let isChecked: boolean = true;
    if (this.filterColumn == 'Descripción') {
      isChecked = this.nameProducto.every(element => element.check == true);
    }
    if (this.filterColumn == 'Labora.') {
      isChecked = this.menuListLabora.every(element => element.check == true);
    }
    if (this.filterColumn == 'Tipo') {
      isChecked = this.menuLisTipo.every(element => element.check == true);
    }
    if (this.filterColumn == 'Compra final') {
      isChecked = this.menuLisCompraFinal.every(element => element.check == true);
    }
    this.checkAllDescription = isChecked;
  }

  onActionMenuHeadAC() {
    let elementCheck: OptionsCLickHeadMenuAC[] = [];

    if (this.filterColumn == 'Descripción') {
      elementCheck = this.nameProducto.filter((element: OptionsCLickHeadMenuAC) => element.check == true);
    }

    if (this.filterColumn == 'Tipo') {
      let selectedElement = this.menuLisTipo.filter(p => p.check == true);
      elementCheck = this.nameProducto.filter(element => selectedElement.some(c => c.desciption.trim() == element.tipo.trim()))
    }

    if (this.filterColumn == 'Compra final') {
      let selectedElement = this.menuLisCompraFinal.filter(p => p.check == true);
      elementCheck = this.nameProducto.filter(element => selectedElement.some(c => c.desciption.trim() == element.compraFinal.toString().trim()))
    }

    if (this.filterColumn == 'Labora.') {
      let selectedElement = this.menuListLabora.filter(p => p.check == true);
      elementCheck = this.nameProducto.filter(element => selectedElement.some(c => c.desciption.trim() == element.laboratorio.toString().trim()))
    }

    let stringChecked = elementCheck.map(p => p.codProducto).join('-');
    this.filter.emit(stringChecked);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.close();
  }

}
