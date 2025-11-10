import { Component, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';

@Component({
  selector: 'app-confirmacion-clave-modal',
  standalone: false,
  templateUrl: './confirmacion-clave-modal.component.html',
  styleUrl: './confirmacion-clave-modal.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmacionClaveModalComponent {

  loading: boolean = false;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private purchaseService: PurchasePlanningService,
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

  successModal(){
    this.activeModal.close(true);

  }

  closeModal() {
    this.activeModal.close(false);
  }

}
