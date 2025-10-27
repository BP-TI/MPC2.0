import { Component, OnInit } from '@angular/core';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse } from '@angular/common/http';

interface dataPolitica {
  ABC:string;
  MaxAlmacen:string;
  Total:string;
  puntoVenta:string;
}

@Component({
  selector: 'app-inventory-policy',
  standalone: false,
  templateUrl: './inventory-policy.component.html',
  styleUrl: './inventory-policy.component.css'
})
export class InventoryPolicyComponent implements OnInit {

  loading: boolean = false;
  rowsLb: any[];

  constructor(private purchaseService: PurchasePlanningService,) {

  }

  ngOnInit(){
    this.cargarPoliticas();
  }

  cargarPoliticas() {
    this.loading = true;
    this.purchaseService.getPoliticas().subscribe(
      (response) => {
        console.log(response);
        this.loading = false;
        this.rowsLb = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

  private insertDataTable(data:dataPolitica[]): void {
    let tabla: HTMLTableElement = <HTMLTableElement> document.getElementById("politicasinventario");
    let tr= document.createElement('tr');
    data.forEach((data:dataPolitica) =>{
      let td= document.createElement('td');
      // tabla.insert
    });
  }

}
