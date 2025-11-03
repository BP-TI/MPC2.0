import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  optionFilter: string[] = [];
  menuOption: OptionsClickHeadMenuAC2[];

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
        console.log(this.filterColumn);
        this.onChangecheckAll();
        this.optionMenu();
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
    if (checked) {
      this.nameProducto.forEach(p => p.check = true);
    } else {
      this.nameProducto.forEach(p => p.check = false);
    }
  }

  onChangecheckAll() {
    let isChecked = this.nameProducto.every(element => element.check == true);
    this.checkAllDescription = isChecked;
  }

  optionMenu() {
    let optionList: string[] = [];
    optionList = [...new Set(this.nameProducto.map(u => u.tipo))];
    optionList.sort((a: string, b: string) =>
      a.trim().localeCompare(b.trim())
    );

    optionList.forEach((element: string) => {
      this.menuOption.push({
        desciption: element,
        check: true,
      });
    });
    console.log(this.menuOption);
  }

  onActionMenuHeadAC() {
    let elementCheck: OptionsCLickHeadMenuAC[] = [];
    elementCheck = this.nameProducto.filter((element: OptionsCLickHeadMenuAC) => element.check == true);
    let stringChecked = elementCheck.map(p => p.codProducto).join('-');
    this.filter.emit(stringChecked);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.close();
  }

}
