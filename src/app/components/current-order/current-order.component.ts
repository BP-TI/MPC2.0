import { Component } from '@angular/core';
import { GlobalService } from '../../shared/services/global.service';

@Component({
  selector: 'app-current-order',
  standalone: false,
  templateUrl: './current-order.component.html',
  styleUrl: './current-order.component.css'
})
export class CurrentOrderComponent {
  titulo: string = 'O/C Vigencia Vencida';
  tableClass2: string = "table-company-4";
  loadingIndicator: boolean = false;
  columns: any = [];
  rows: any = [];

  constructor(
    public global: GlobalService,
  ) {
    this.global.setGlobalVar('Módulo de O/C vifencia vencida');
  }

}
