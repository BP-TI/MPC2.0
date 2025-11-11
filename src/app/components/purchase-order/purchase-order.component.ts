import { Component, ViewEncapsulation } from '@angular/core';
import { AgentOutlook } from '../../shared/models/agentOutlook';
import { AlertMail } from '../../shared/services/alert-mail';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-purchase-order',
  standalone: false,
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class PurchaseOrderComponent {
  logoHeader = 'assets/images/logo-color.svg';

  constructor(private alertMail: AlertMail,private activeModal: NgbActiveModal,) { }

  openOutlook() {
    let body: AgentOutlook = {
      subject: 'Prueba',
      body: 'Este es un mensaje de prueba \n\nsaludos \njheisson Villafuerte',
      isBodyHtml: 'true',
      recipients: [
        "tu@correo.com",
        "tu2@correo.com"
      ],
      attachments: [{
        filename: "hola.zip",
        dataBase64: ""
      }]
    }

    this.alertMail.openMail(body).subscribe(response => {
      console.log('entro');
      console.log(response);
    }, error => {
      console.log('error');
    });
  }

  closeModal() {
    this.activeModal.close();
  }


}
