import { Component, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';

@Component({
  selector: 'app-confirmacion-clave-modal',
  standalone: false,
  templateUrl: './confirmacion-clave-modal.component.html',
  styleUrl: './confirmacion-clave-modal.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmacionClaveModalComponent {

  clave: string = '';

  loading: boolean = false;
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';
  showToast = false;

  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private ordenCompra: OrdenCompraService,
    private el: ElementRef,

  ) { }

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

  // -----

  successModal() {
    this.clave = this.clave.trim();
    if (this.clave.length == 0) {
      this.AlertToast("Wraning: Debe de ingresar la clave.", 'warning');
      return;
    }

    this.ordenCompra.getClaveAutorizacion1(this.clave).subscribe(response => {
      if (response.codStatus == 1) {
        if (response.useusr == null) {
          this.AlertToast(`Wraning: Clave no valida.`, 'warning');
        } else {
          this.AlertToast(`Success: ${response.message}`, 'success');
          this.activeModal.close(true);
        }
      }
    });
  }

  closeModal() {
    this.activeModal.close(false);
  }

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }

}
