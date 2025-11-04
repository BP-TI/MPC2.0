import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { Substitutes } from '../../models/parametros';

@Component({
  selector: 'app-show-substitutes',
  standalone: false,
  templateUrl: './show-substitutes.component.html',
  styleUrl: './show-substitutes.component.css'
})
export class ShowSubstitutesComponent implements OnInit {

  @Input() codProv!: string;
  @Input() codProduct!: string;
  @Input() codLabora!: string;
  dataTable: any[] = [];

  constructor(
    private activeModal: NgbActiveModal,
    private purchaseService: PurchasePlanningService,
  ) { }

  ngOnInit() {
    this.showsubstitutes();
  }

  closeModal() {
    this.activeModal.close();
  }

  showsubstitutes() {
    let dataRequest: Substitutes = {
      codigoProveedor: this.codProv,
      codigoLaboratorio: this.codLabora,
      codigoProducto: this.codProduct
    }
    console.log(dataRequest);
    this.purchaseService.getSubstitutes(dataRequest).subscribe((response: any) => {
      if (response == null) {
        //  this.AlertToast(`Información: No se encontraron registros.`, 'info');
      } else {
        if (response.codStatus == 1) {
          if (response.message === "OK"){
            console.log('Entro');
            this.dataTable = response.productoSustitutorios;
          }else{
            // this.AlertToast(`Información: ${response.message}`, 'info');
          }
        }
        else {
          // this.AlertToast(response.message, 'error2');
        }
      }

      console.log(response);
    });
  }

}
