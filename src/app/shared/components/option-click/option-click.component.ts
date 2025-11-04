import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../models/option-click';
import { Laboratorios } from '../../../models/parametros';

@Component({
  selector: 'app-option-click',
  standalone: false,
  templateUrl: './option-click.component.html',
  styleUrls: ['./option-click.component.css']
})
export class OptionClickComponent implements OnInit {
  dataProductos: OptionsCLickHeadMenuAC[] = []; /* Data del componente padre*/
  dataFilter: OptionsCLickHeadMenuAC[] = [];

  filterColumn: string = ''; /* Indica la columna para hacer el filtro*/
  primerFiltro: string = '';

  /*-- --*/
  menuListProducto: OptionsClickHeadMenuAC2[] = [];
  menuListLabora: OptionsClickHeadMenuAC2[] = [];
  menuLisTipo: OptionsClickHeadMenuAC2[] = [];
  menuLisCompraFinal: OptionsClickHeadMenuAC2[] = [];

  checkAllDescription: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  visible = false;
  visible2 = false;
  visible3=false;
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
        this.visible3=false;
        this.visible4 = false
        break;
      case 2:
        this.visible2 = true;
        this.visible = false;
        this.visible3=false;
        this.visible4 = false;
        break;
      case 3:
        this.visible3=true;
        this.visible = false;
        this.visible2 = false;
        this.visible4 = false;
        break;
      case 4:
        this.onChangecheckAll();
        this.calculateListHead();
        this.visible = false;
        this.visible2 = false;
        this.visible3=false;
        if(this.visible4 == false){
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
    this.visible3=false;
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
          this.dataProductos.forEach(p => p.check = true);
        } else {
          this.dataProductos.forEach(p => p.check = false);
        }
        break;
      case 'Labora.':
        if (checked) {
          this.menuListLabora.forEach(p => p.check = true);
        } else {
          this.menuListLabora.forEach(p => p.check = false);
        }
        break;
      case 'Tipo':
        if (checked) {
          this.menuLisTipo.forEach(p => p.check = true);
        } else {
          this.menuLisTipo.forEach(p => p.check = false);
        }
        break;
    }
  }

  onChangecheckAll() {
    let isChecked: boolean = true;

    if (this.filterColumn == 'Descripción') {
      isChecked = this.menuListProducto.every(element => element.check == true);
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
    if (this.primerFiltro.length == 0) {
      this.primerFiltro = this.filterColumn;
    }

    let elementCheck: OptionsCLickHeadMenuAC[] = [];
    if (this.filterColumn == 'Descripción') {
      let selectedElement = this.menuListProducto.filter(p => p.check == true);
      elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.description.trim()));
    }

    if (this.filterColumn == 'Tipo') {
      let selectedElement = this.menuLisTipo.filter(p => p.check == true);
      elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.tipo.trim()))
    }

    if (this.filterColumn == 'Compra final') {
      let selectedElement = this.menuLisCompraFinal.filter(p => p.check == true);
      elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.compraFinal.toString().trim()))
    }

    if (this.filterColumn == 'Labora.') {
      let selectedElement = this.menuListLabora.filter(p => p.check == true);
      elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.laboratorio.toString().trim()))
    }
    let stringChecked = elementCheck.map(p => p.codProducto).join('-');

    if (this.primerFiltro.trim().length == 0) {
      this.primerFiltro = this.filterColumn;
    }

    this.filter.emit(stringChecked);

  }

  calculateListHead() {

    if (this.primerFiltro != this.filterColumn) {

      let headListData: string[]
      switch (this.filterColumn) {
        case 'Descripción':
          headListData = this.dataFilter.map(p => p.description);
          this.menuListProducto.forEach(dataList => {
            if (headListData.find(f => f == dataList.description)) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;
        case 'Labora.':
          headListData = Array.from(new Set(this.dataFilter.map(p => p.laboratorio)));
          this.menuListLabora.forEach(dataList => {
            if (headListData.find(f => f == dataList.description)) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;
        case 'Tipo':
          headListData = Array.from(new Set(this.dataFilter.map(p => p.tipo)));
          this.menuLisTipo.forEach(dataList => {
            if (headListData.find(f => f == dataList.description)) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;

        case 'Compra final':
          headListData = Array.from(new Set(this.dataFilter.map(p => p.compraFinal.toString())));
          this.menuLisCompraFinal.forEach(dataList => {
            if (headListData.find(f => f == dataList.description)) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;

      }
    } else {
      let headSelectElement: OptionsClickHeadMenuAC2[] = []
      let headListData: string[]
      this.dataFilter = [];
      switch (this.primerFiltro) {
        case 'Descripción':
          this.menuListProducto.map(p => p.check = true);
          headSelectElement = this.menuListProducto.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.description)) {
              this.dataFilter.push(element);
            }
          });
          break;
        case 'Labora.':
          this.menuListLabora.map(p => p.check = true);
          headSelectElement = this.menuListLabora.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.laboratorio)) {
              this.dataFilter.push(element);
            }
          });

          break;
        case 'Tipo':
          this.menuLisTipo.map(p => p.check = true);
          headSelectElement = this.menuLisTipo.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.tipo)) {
              this.dataFilter.push(element);
            }
          });
          break;
        case 'Compra final':
          this.menuLisCompraFinal.map(p => p.check);
          headSelectElement = this.menuLisCompraFinal.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.compraFinal.toString())) {
              this.dataFilter.push(element);
            }
          });
          break;
      }

    }



  }

  @HostListener('document:click')
  onDocumentClick() {
    this.close();
  }

}
