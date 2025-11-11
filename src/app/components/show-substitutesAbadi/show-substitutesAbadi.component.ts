import { Component, ElementRef, HostListener, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DirectSupplyService } from '../../services/DirectSupply/directSupply.service';
import { Substitutes } from '../../models/parametros';

@Component({
  selector: 'app-show-substitutes',
  standalone: false,
  templateUrl: './show-substitutesAbadi.component.html',
  styleUrl: './show-substitutesAbadi.component.css',
   encapsulation: ViewEncapsulation.None,
})
export class ShowSubstitutesAbadiComponent implements OnInit {

  @Input() codProv!: string;
  @Input() codProduct!: string;
  @Input() codLabora!: string;
  dataTable: any[] = [];

  loading: boolean = false;

  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private DirectSupplyseService: DirectSupplyService,
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
    dialog.style.left = `${event.clientX - this.offsetX}px`;
    dialog.style.top = `${event.clientY - this.offsetY}px`;
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

    this.DirectSupplyseService.getSubstitutes(dataRequest).subscribe((response: any) => {
      if (response == null) {
        //  this.AlertToast(`Información: No se encontraron registros.`, 'info');
      } else {
        if (response.codStatus == 1) {
          console.log(response);
          if (response.message === "OK") {
            this.dataTable = response.productoSustitutorios;
          } else {
            // this.AlertToast(`Información: ${response.message}`, 'info');
          }
        }
        else {
          // this.AlertToast(response.message, 'error2');
        }
      }

    });
  }

}
