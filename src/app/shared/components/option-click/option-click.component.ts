import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../models/option-click';
import { AppConstants } from '../../constants/app.constants';

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
  menuListCompraFinal: OptionsClickHeadMenuAC2[] = [];
  menuListCondiciones: OptionsClickHeadMenuAC2[] = [];

  checkAllDescription: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  visible = false;
  visible2 = false;
  visible3 = false;
  visible4 = false;
  visible5 = false;

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
        this.visible3 = false;
        this.visible4 = false
        break;
      case 2:
        this.visible2 = true;
        this.visible = false;
        this.visible3 = false;
        this.visible4 = false;
        break;
      case 3:
        this.visible3 = true;
        this.visible = false;
        this.visible2 = false;
        this.visible4 = false;
        break;
      case 4:
        this.onChangecheckAll();
        this.calculateListHead();
        this.visible = false;
        this.visible2 = false;
        this.visible3 = false;
        if (this.visible4 == false) {
          this.visible4 = true
        } else {
          this.visible4 = false
        }
        break;
      case 5:
        this.visible3 = false;
        this.visible = false;
        this.visible2 = false;
        this.visible4 = false;
        this.visible5 = true;
        break;
    }

  }

  close() {
    this.visible = false;
    this.visible2 = false;
    this.visible3 = false;
    this.visible5 = false;
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
      case AppConstants.TitleTableHeadAC.DESCRIPCION:
        if (checked) {
          this.menuListProducto.forEach(p => p.check = true);
        } else {
          this.menuListProducto.forEach(p => p.check = false);
        }
        break;
      case AppConstants.TitleTableHeadAC.LABORATORIO:
        if (checked) {
          this.menuListLabora.forEach(p => p.check = true);
        } else {
          this.menuListLabora.forEach(p => p.check = false);
        }
        break;
      case AppConstants.TitleTableHeadAC.TIPO:
        if (checked) {
          this.menuLisTipo.forEach(p => p.check = true);
        } else {
          this.menuLisTipo.forEach(p => p.check = false);
        }
        break;
      case AppConstants.TitleTableHeadAC.COMPRA_FINAL:
        if (checked) {
          this.menuListCompraFinal.forEach(p => p.check = true);
        } else {
          this.menuListCompraFinal.forEach(p => p.check = false);
        }
        break;
      case AppConstants.TitleTableHeadAC.CONDICION:
        if (checked) {
          this.menuListCondiciones.forEach(p => p.check = true);
        } else {
          this.menuListCondiciones.forEach(p => p.check = false);
        }
        break;
    }
  }

  onChangecheckAll() {
    let isChecked: boolean = true;

    if (this.filterColumn == AppConstants.TitleTableHeadAC.DESCRIPCION) {
      isChecked = this.menuListProducto.every(element => element.check == true);
    }
    if (this.filterColumn == AppConstants.TitleTableHeadAC.LABORATORIO) {
      isChecked = this.menuListLabora.every(element => element.check == true);
    }
    if (this.filterColumn == AppConstants.TitleTableHeadAC.TIPO) {
      isChecked = this.menuLisTipo.every(element => element.check == true);
    }
    if (this.filterColumn == AppConstants.TitleTableHeadAC.COMPRA_FINAL) {
      isChecked = this.menuListCompraFinal.every(element => element.check == true);
    }
    if (this.filterColumn == AppConstants.TitleTableHeadAC.CONDICION) {
      isChecked = this.menuListCondiciones.every(element => element.check == true);
    }
    this.checkAllDescription = isChecked;
  }

  onActionMenuHeadAC() {
    if (this.primerFiltro.length == 0) {
      this.primerFiltro = this.filterColumn;
    }

    let elementCheck: OptionsCLickHeadMenuAC[] = [];
    if (this.filterColumn == AppConstants.TitleTableHeadAC.DESCRIPCION) {
      let selectedElement = this.menuListProducto.filter(p => p.check == true);
      if (this.primerFiltro == this.filterColumn) {
        elementCheck = this.dataProductos.filter(element => selectedElement.some(c => c.description.trim() == element.description.trim()));
      } else {
        elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.description.trim()));
      }
    }

    if (this.filterColumn == AppConstants.TitleTableHeadAC.TIPO) {
      let selectedElement = this.menuLisTipo.filter(p => p.check == true);
      if (this.primerFiltro == this.filterColumn) {
        elementCheck = this.dataProductos.filter(element => selectedElement.some(c => c.description.trim() == element.tipo.trim()))
      } else {
        elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.tipo.trim()))
      }
    }

    if (this.filterColumn == AppConstants.TitleTableHeadAC.COMPRA_FINAL) {
      let selectedElement = this.menuListCompraFinal.filter(p => p.check == true);
      if (this.primerFiltro == this.filterColumn) {
        elementCheck = this.dataProductos.filter(element => selectedElement.some(c => c.description.trim() == element.compraFinal.toString().trim()))
      } else {
        elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.compraFinal.toString().trim()))

      }
    }

    if (this.filterColumn == AppConstants.TitleTableHeadAC.LABORATORIO) {
      let selectedElement = this.menuListLabora.filter(p => p.check == true);
      if (this.primerFiltro == this.filterColumn) {
        elementCheck = this.dataProductos.filter(element => selectedElement.some(c => c.description.trim() == element.laboratorio.toString().trim()))
      } else {
        elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.description.trim() == element.laboratorio.toString().trim()))
      }
    }

    if (this.filterColumn == AppConstants.TitleTableHeadAC.CONDICION) {
      let selectedElement = this.menuListCondiciones.filter(p => p.check == true);
      if (this.primerFiltro == this.filterColumn) {
        elementCheck = this.dataProductos.filter(element => selectedElement.some(c => c.codCondiciones?.trim() == element.condicion.toString().trim()))

      } else {
        elementCheck = this.dataFilter.filter(element => selectedElement.some(c => c.codCondiciones?.trim() == element.condicion.toString().trim()))

      }
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
        case AppConstants.TitleTableHeadAC.DESCRIPCION:
          headListData = this.dataFilter.map(p => p.description);
          this.menuListProducto.forEach(dataList => {
            if (headListData.find(f => f == dataList.description)) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;
        case AppConstants.TitleTableHeadAC.LABORATORIO:
          headListData = Array.from(new Set(this.dataFilter.map(p => p.laboratorio)));
          this.menuListLabora.forEach(dataList => {
            if (headListData.find(f => f == dataList.description)) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;
        case AppConstants.TitleTableHeadAC.TIPO:
          headListData = Array.from(new Set(this.dataFilter.map(p => p.tipo)));
          this.menuLisTipo.forEach(dataList => {
            if (headListData.find(f => f.trim() == dataList.description.trim())) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;

        case AppConstants.TitleTableHeadAC.COMPRA_FINAL:
          headListData = Array.from(new Set(this.dataFilter.map(p => p.compraFinal.toString())));
          this.menuListCompraFinal.forEach(dataList => {
            if (headListData.find(f => f.trim() == dataList.description.trim())) {
              dataList.visible = true;
            } else {
              dataList.visible = false;
            }
          });
          break;

        case AppConstants.TitleTableHeadAC.CONDICION:
          headListData = Array.from(new Set(this.dataFilter.map(p => p.condicion.toString())));
          this.menuListCondiciones.forEach(dataList => {
            if (headListData.find(f => f == dataList.codCondiciones)) {
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
        case AppConstants.TitleTableHeadAC.CONDICION:
          this.menuListProducto.map(p => p.check = true);
          headSelectElement = this.menuListProducto.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.description)) {
              this.dataFilter.push(element);
            }
          });
          break;
        case AppConstants.TitleTableHeadAC.LABORATORIO:
          this.menuListLabora.map(p => p.check = true);
          headSelectElement = this.menuListLabora.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.laboratorio)) {
              this.dataFilter.push(element);
            }
          });

          break;
        case AppConstants.TitleTableHeadAC.TIPO:
          this.menuLisTipo.map(p => p.check = true);
          headSelectElement = this.menuLisTipo.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.tipo)) {
              this.dataFilter.push(element);
            }
          });
          break;
        case AppConstants.TitleTableHeadAC.COMPRA_FINAL:
          this.menuListCompraFinal.map(p => p.check);
          headSelectElement = this.menuListCompraFinal.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.compraFinal.toString())) {
              this.dataFilter.push(element);
            }
          });
          break;
        case AppConstants.TitleTableHeadAC.CONDICION:
          this.menuListCondiciones.map(p => p.check);
          headSelectElement = this.menuListCondiciones.filter(p => p.check == true);
          headListData = Array.from(new Set(headSelectElement.map(p => p.description)));
          this.dataProductos.forEach(element => {
            if (headListData.find(p => p == element.condicion.toString())) {
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
