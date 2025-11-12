import { Component, ElementRef, HostListener, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrdenCompraService } from '../../../services/PurchasePlanning/ordenCompra.service';
import { IDetalleStockBotica } from '../../../models/ordenCompra';
import { GlobalService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-detalle-stock-botica',
  standalone: false,
  templateUrl: './detalle-stock-botica.component.html',
  styleUrl: './detalle-stock-botica.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DetalleStockBoticaComponent implements OnInit {


  @Input() title!: string;
  @Input() option!: number;
  @Input() codPro!: string;

  DetalleStock: any[] = [];

  loading: boolean = false;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;
  headTable: string[] = [];
  tableBody: any[];

  totalMontg6 = 0;
  totalMontg5 = 0;
  totalMontg4 = 0;
  totalMontg3 = 0;
  totalMontg2 = 0;
  totalMontg1 = 0;
  totalStockBoticas = 0;
  totalMaxBoticas = 0;
  totalInfrastock = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private ordenCompraService: OrdenCompraService,
    private el: ElementRef,
    public global: GlobalService,
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
    this.getHeaderTable();
    this.getDataStock();
  }

  getDataStock() {
    this.loading = true;

    let dataRequest: IDetalleStockBotica = {
      codpro: this.codPro,
      repo: this.option
    };

    this.ordenCompraService.getDetalleStockBotica(dataRequest).subscribe(response => {
      this.loading = false;
      this.tableBody = response.detalleStockBoticas;

      this.totalMontg6 = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_ventas6,0);
      this.totalMontg5 = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_ventas5,0);
      this.totalMontg4 = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_ventas4,0);
      this.totalMontg3 = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_ventas3,0);
      this.totalMontg2 = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_ventas2,0);
      this.totalMontg1 = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_ventas1,0);
      this.totalInfrastock = this.tableBody.reduce((sum,p)=> sum +p.max_Infrastock,0);
      this.totalStockBoticas = this.tableBody.reduce((sum,p)=> sum +p.stock_botica,0);
      this.totalMaxBoticas = this.tableBody.reduce((sum,p)=> sum +p.establecimiento_stockMaximo,0);

    });

  }

  getHeaderTable() {
    this.headTable = [
      'Código',
      'Establecimiento',
      this.showMonth('mesquinto'),
      this.showMonth('mescuarto'),
      this.showMonth('mestercero'),
      this.showMonth('messegundo'),
      this.showMonth('mesprimero'),
      this.showMonth('mesActual'),
      'Stock/Botica',
      'Maximo/Botica',
      'InfraStock',
      'Clasifi Botica',
    ];
  }

  closeModal() {
    this.activeModal.close();
  }

  showMonth(mesConsultado: string): string {
    let diaActual = new Date();
    let dataMes: string = "";

    if (mesConsultado === "mesProyectado") {
      diaActual.setMonth(diaActual.getMonth() + 1);
      diaActual.setDate(0);
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " Proy. " + diaActual.getDate();
    }

    if (mesConsultado === "mesActual") { //Octubre
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " " + (diaActual.getDate() - 1);
    }

    if (mesConsultado === "mesprimero") { /*setiembre*/
      diaActual = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      diaActual.setDate(0);
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " " + diaActual.getDate();
    }

    if (mesConsultado === "messegundo") { /*agosto*/
      diaActual = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      diaActual.setMonth(diaActual.getMonth() - 1);
      diaActual.setDate(0);
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " " + diaActual.getDate();
    }

    if (mesConsultado === "mestercero") { //julio
      diaActual = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      diaActual.setMonth(diaActual.getMonth() - 2);
      diaActual.setDate(0);
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " " + diaActual.getDate();
    }

    if (mesConsultado === "mescuarto") { //Junio
      diaActual = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      diaActual.setMonth(diaActual.getMonth() - 3);
      diaActual.setDate(0);
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " " + diaActual.getDate();
    }

    if (mesConsultado === "mesquinto") { //Junio
      diaActual = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      diaActual.setMonth(diaActual.getMonth() - 4);
      diaActual.setDate(0);
      dataMes = this.global.getMonthName(diaActual.getMonth()) + " " + diaActual.getDate();
    }

    return dataMes;

  }

}
