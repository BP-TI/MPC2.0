import { Component, ElementRef, Input, OnInit, ViewEncapsulation, HostListener, } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { IAdicionarProductosReq } from '../../models/ordenCompra';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AddProductComponent implements OnInit {

  @Input() codProv: string;
  @Input() codLab: string;
  dataTable: any[] = [];
  datafilter: any[] = [];

  textFilter: string = '';
  chkDescripcion: boolean = true;
  chkcodProd: boolean = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';

  loading: boolean = false;

  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private ordenCompraService: OrdenCompraService,
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
    this.showDataProduct();
  }

  filterDataTable() {
    this.loading = true;
    if (this.textFilter.trim().length == 0) {
      this.datafilter = this.dataTable;
    }

    if (this.chkDescripcion) {
      this.datafilter = this.dataTable.filter(p => p.descripcionProducto.toLowerCase().trim().includes(this.textFilter.toLowerCase().trim()));
    }

    if (this.chkcodProd) {
      this.datafilter = this.dataTable.filter(p => p.codigoProducto.toLowerCase().trim().includes(this.textFilter.toLowerCase().trim()));
    }
    this.loading = false;
  }

  showDataProduct() {
    let dataRequest: IAdicionarProductosReq = {
      codProveedor: this.codProv,
      codLab: this.codLab,
    }
    this.loading = true;
    this.ordenCompraService.getAdicionarProducto(dataRequest).subscribe((response: any) => {
      this.loading = false;
      if (response == null) {
        this.AlertToast(`Información: No se encontraron registros.`, 'info');
      } else {
        if (response.codStatus == 1) {
          if (response.message === "OK") {
            this.dataTable = response.productoAdiionados;
            this.datafilter = response.productoAdiionados;
          } else {
            this.AlertToast(`Información: ${response.message}`, 'info');
          }
        } else {
          this.AlertToast(response.message, 'error2');
        }
      }
    }, (error: HttpErrorResponse) => {
      this.loading = false;
      this.AlertToast(`Error: ${error}`, 'error2');
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  selectData(data: any) {
    this.activeModal.close(data);
  }

  changeChckValue(tipo: string, event: Event) {
    let isChecked = (event.target as HTMLInputElement).checked;
    if (tipo == 'descripcion') {
      if (isChecked) {
        this.chkcodProd = false;
      } else {
        this.chkcodProd = true;
      }
    }

    if (tipo == 'codPord') {
      if (isChecked) {
        this.chkDescripcion = false;
      } else {
        this.chkDescripcion = true;
      }
    }
    this.filterDataTable();
  }

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }

}
