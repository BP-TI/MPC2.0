import { Component, OnInit } from '@angular/core';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-inventory-policy',
  standalone: false,
  templateUrl: './inventory-policy.component.html',
  styleUrl: './inventory-policy.component.css'
})
export class InventoryPolicyComponent implements OnInit {

  loading: boolean = false;
  rowsLb: any[];

  constructor(private purchaseService: PurchasePlanningService,) { }

  ngOnInit() {
    this.cargarPoliticas();
  }

  cargarPoliticas() {
    this.loading = true;
    this.purchaseService.getPoliticas().subscribe(
      (response) => {
        this.loading = false;
        this.rowsLb = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

}
