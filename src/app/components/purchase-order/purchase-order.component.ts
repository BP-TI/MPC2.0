import { Component, ViewEncapsulation, Input, ElementRef } from '@angular/core';
import { AgentOutlook } from '../../shared/models/agentOutlook';
import { AlertMail } from '../../shared/services/alert-mail';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrder } from '../../models/ordenCompra';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-purchase-order',
  standalone: false,
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.css',
  encapsulation: ViewEncapsulation.None,
})

export class PurchaseOrderComponent {
  @Input() rows: any[] = [];
  ProductosOC: PurchaseOrder[] = [];
  logoHeader = 'assets/images/logo-color.svg';
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(private alertMail: AlertMail,private activeModal: NgbActiveModal,private el: ElementRef) {
         if (this.rows && this.rows.length > 0) {
    this.ProductosOC = this.rows.map(p => ({
      ...p
      }));
    }

   }

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

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    const dialog = this.el.nativeElement.closest('.modal-dialog');
    const rect = dialog.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const dialog = this.el.nativeElement.closest('.modal-dialog');

    const newLeft = event.clientX - this.offsetX;
    const newTop = event.clientY - this.offsetY;

    const maxLeft = window.innerWidth - dialog.offsetWidth;
    const maxTop = window.innerHeight - dialog.offsetHeight;

    const limitedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const limitedTop = Math.max(0, Math.min(newTop, maxTop));

    dialog.style.left = `${limitedLeft}px`;
    dialog.style.top = `${limitedTop}px`;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }



}
