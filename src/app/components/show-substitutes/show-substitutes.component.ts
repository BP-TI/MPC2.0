import { Component, ElementRef, HostListener, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { Substitutes } from '../../models/parametros';

@Component({
  selector: 'app-show-substitutes',
  standalone: false,
  templateUrl: './show-substitutes.component.html',
  styleUrl: './show-substitutes.component.css',
   encapsulation: ViewEncapsulation.None
})
export class ShowSubstitutesComponent implements OnInit {

  @Input() codProv!: string;
  @Input() codProduct!: string;
  @Input() codLabora!: string;
  dataTable: any[] = [];

  loading: boolean = false;
  showToast: boolean = false;
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';

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

    this.purchaseService.getSubstitutes(dataRequest).subscribe((response: any) => {
      if (response == null) {
         this.AlertToast(`Información: No se encontraron registros.`, 'info');
      } else {
        if (response.codStatus == 1) {
          if (response.message === "OK") {
            this.dataTable = response.productoSustitutorios;
          } else {
            this.AlertToast(`Información: ${response.message}`, 'info');
          }
        }
        else {
          this.AlertToast(response.message, 'error2');
        }
      }

    });
  }

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }

}
