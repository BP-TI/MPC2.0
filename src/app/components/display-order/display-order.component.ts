import { Component } from '@angular/core';
import { GlobalService } from '../../shared/services/global.service';



@Component({
  selector: 'app-display-order',
  standalone: false,
  templateUrl: './display-order.component.html',
  styleUrl: './display-order.component.css'
})
export class DisplayOrderComponent {
  titulo: string = "Visualizar Orden de Compra";
  pdfFilePath = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  
  constructor(
    public global: GlobalService,
  ){
    this.global.setGlobalVar('Módulo de visualización de O/C');
  }

}
