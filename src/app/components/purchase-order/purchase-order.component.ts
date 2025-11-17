import { Component, ElementRef, HostListener, Input, input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AgentOutlook } from '../../shared/models/agentOutlook';
import { AlertMail } from '../../shared/services/alert-mail';
import { NgbActiveModal, NgbCalendar, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrder_table_modal } from '../../models/ordenCompra';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { AppConstants } from '../../shared/constants/app.constants';
import { GlobalService } from '../../shared/services/global.service';
import { UserDataLogin } from '../../models/persona';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-purchase-order',
  standalone: false,
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class PurchaseOrderComponent implements OnInit {
  logoHeader = 'assets/images/logo-color.svg';

  @Input() dataRows!: PurchaseOrder_table_modal[];
  @Input() scodPorv!: string;
  @Input() sdesProv!: string;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;
  // -----------------

  rucProv: string;
  today: Date = new Date();
  creationDate: any;
  deliveryDate: any;
  valorAnterior: any;
  // data usuaro
  dataUsuario: UserDataLogin;
  // poppup
  loading = false;
  // Table
  tableHead: string[] = [];
  headtable: any = AppConstants.TtitleHeadGOC;
  // Total
  totalParcial: number = 0;
  totaligv: number = 0;
  totalPagar: number = 0;
  // Hover
  isHoveringGOC: boolean = false;
  isRowSelectedGOC: number = -1;
  isRowHoverGOC: Number = -1;
  // Mensaje
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';
  showToast = false;

  // -----------------
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private alertMail: AlertMail,
    private activeModal: NgbActiveModal,
    private orderCompraService: OrdenCompraService,
    private el: ElementRef,
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<string>,
    private globalService: GlobalService,
  ) { }

  ngOnInit(): void {
    this.getHeadTable();
    this.getRuctProv();
    this.loadData();
    this.calculateTotal();
  }

  loadData() {
    this.creationDate = this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
    this.deliveryDate = this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
    this.dataUsuario = this.globalService.getDataUserLogin();
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
  // -----
  getRuctProv() {
    this.orderCompraService.getRucProveedor(this.scodPorv).subscribe(response => {
      if (response.codStatus == 1) {
        if (response.message == 'OK') {
          this.rucProv = response.ruc;
        }
      }
    });
  }

  getHeadTable() {
    this.tableHead = [
      this.headtable.INDEX,
      this.headtable.CODIGO,
      this.headtable.DESCRIPCION,
      this.headtable.LABORATORIO,
      this.headtable.CANT,
      this.headtable.BONI,
      this.headtable.VVF,
      this.headtable.VVFNUEVO,
      this.headtable.DESCT1,
      this.headtable.DESCT2,
      this.headtable.DESCT3,
      this.headtable.DESCT4,
      this.headtable.COSCOM,
      this.headtable.PARCIAL,
      this.headtable.IGV,
      this.headtable.TOTAL,
    ];
  }

  // click derecho
  handleMenuAction(action: string) {
    switch (action) {
      case 'excel':
        this.exportExcel();
        break;
    }
  }
  filterData(filter: string) {
    this.contextMenu.closeHeadTableAC();
  }
  openContextMenu(event: MouseEvent, opcionMenu: number) {
    event.preventDefault();
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
  }
  // ExportarExcel
  exportExcel() {
    if (this.dataRows.length == 0) {
      this.AlertToast("La tabla Analisis de Compra no tiene información.", 'warning');
      return;
    }

    let today = new Date();
    let dataExcel: any[] = [];

    const nameFile = "TablaGenerarOC_" + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds();

    let headInfo: string[] = []
    this.tableHead.forEach((data: any) => {
      headInfo.push(data);
    });

    dataExcel.push(headInfo);
    this.dataRows.forEach((infoRow: PurchaseOrder_table_modal) => {

      dataExcel.push([
        infoRow.item,
        infoRow.codProd,
        infoRow.producto,
        infoRow.laboratorio,
        infoRow.cantE,
        infoRow.boni,
        infoRow.vvf1,
        infoRow.vvf2,
        infoRow.desct1,
        infoRow.desct2,
        infoRow.desct3,
        infoRow.desct4,
        infoRow.coscom,
        infoRow.parcial,
        infoRow.igv,
        infoRow.total,
      ]);

    });
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, nameFile + '.xlsx');
  }

  // calcular valores
  getlastValue(valueInput: any) {
    let dataLast = (valueInput.target as HTMLInputElement).value;
    this.valorAnterior = dataLast;
  }
  calcularValoresInputGOC(nameColumn: string, index: number) {

    // valida que los valores no este vacio
    if (
      this.dataRows[index].cantE.toString().length == 0 ||
      this.dataRows[index].boni.toString().length == 0 ||
      this.dataRows[index].vvf2.toString().length == 0 ||
      this.dataRows[index].desct1.toString().length == 0 ||
      this.dataRows[index].desct2.toString().length == 0 ||
      this.dataRows[index].desct3.toString().length == 0 ||
      this.dataRows[index].desct4.toString().length == 0
    ) {
      this.AlertToast(`Warning: La columna ${nameColumn} tiene el valor de cero.`, 'warning');
      return;
    }

    // valida que los descuentos esten entre 0 a 100
    if (
      (Number(this.dataRows[index].desct1) < 0 || Number(this.dataRows[index].desct1) > 100) ||
      (Number(this.dataRows[index].desct2) < 0 || Number(this.dataRows[index].desct2) > 100) ||
      (Number(this.dataRows[index].desct3) < 0 || Number(this.dataRows[index].desct3) > 100) ||
      (Number(this.dataRows[index].desct4) < 0 || Number(this.dataRows[index].desct4) > 100)
    ) {
      this.AlertToast(`Warning: Cantidad de ${nameColumn} debe ser entre 0 y 100.`, 'warning');

      switch (nameColumn) {
        case this.headtable.DESCT1:
          this.dataRows[index].desct1 = this.valorAnterior;
          break;
        case this.headtable.DESCT2:
          this.dataRows[index].desct2 = this.valorAnterior;
          break;
        case this.headtable.DESCT3:
          this.dataRows[index].desct3 = this.valorAnterior;
          break;
        case this.headtable.DESCT4:
          this.dataRows[index].desct4 = this.valorAnterior;
          break;
      }
      return;
    }

    // Validar cantidad
    if (nameColumn == this.headtable.CANT) {

    }


    if (nameColumn == this.headtable.CANT) {
      this.calculateDesc(index);
      this.calculateTotal();
    }

    if (nameColumn == this.headtable.COSCOM) {
      this.calculateCoscom(index);
      this.calculateTotal();
    }

    if (
      nameColumn == this.headtable.BONI ||
      nameColumn == this.headtable.VVFNUEVO ||
      nameColumn == this.headtable.DESCT1 ||
      nameColumn == this.headtable.DESCT2 ||
      nameColumn == this.headtable.DESCT3 ||
      nameColumn == this.headtable.DESCT4
    ) {
      this.calculateDesc(index);
      this.calculateTotal();
    }


  }

  calculateDesc(index: number) {
    let cantidad = 0;
    let vvf1 = 0;
    let d1 = 0
    let d2 = 0;
    let d3 = 0;
    let d4 = 0;
    let d5 = 0;
    let coscom = 0;
    let igvpro = 0;
    let parcial = 0;
    let igv = 0;
    let total = 0;

    if (Number(this.dataRows[index].vvf2) > 0) {
      vvf1 = Number(this.dataRows[index].vvf2);
    } else {
      vvf1 = Number(this.dataRows[index].vvf1);
    }

    d1 = Number(this.dataRows[index].desct1);
    d2 = Number(this.dataRows[index].desct2);
    d3 = Number(this.dataRows[index].desct3);
    d4 = Number(this.dataRows[index].desct4);

    if (Number(this.dataRows[index].boni) == 0 && Number(this.dataRows[index].cantE) == 0) {
      d5 = 0;
    } else {
      d5 = (Number(this.dataRows[index].boni) / (Number(this.dataRows[index].cantE) + Number(this.dataRows[index].boni))) * 100;
    }

    igvpro = Number(this.dataRows[index].igvpro);
    cantidad = Number(this.dataRows[index].cantE);
    parcial = Number(this.dataRows[index].parcial);
    igv = Number(this.dataRows[index].igv);
    total = Number(this.dataRows[index].total);

    coscom = ((((vvf1 - (vvf1 * (d1 / 100))) -
      ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) -
      (((vvf1 - (vvf1 * (d1 / 100))) - ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) * (d3 / 100))) -
      ((((vvf1 - (vvf1 * (d1 / 100))) - ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) -
        (((vvf1 - (vvf1 * (d1 / 100))) - ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) * (d3 / 100))) * ((d4 + d5) / 100)));

    parcial = (Math.round(coscom * 100) / 100) * (cantidad + Number(this.dataRows[index].boni));
    igv = (Math.round(parcial * 100) / 100) * (igvpro / 100);
    total = parcial + igv;

    this.dataRows[index].coscom = (Math.round(coscom * 100) / 100).toString();
    this.dataRows[index].parcial = (Math.round(parcial * 100) / 100).toString();
    this.dataRows[index].igv = (Math.round(igv * 100) / 100).toString();
    this.dataRows[index].total = (Math.round(total * 100) / 100).toString();

  }

  calculateCoscom(index: number) {
    let cantidad = 0;
    let vvf1 = 0;
    let d1 = 0
    let d2 = 0;
    let d3 = 0;
    let d4 = 0;
    let d5 = 0;
    let coscom = 0;
    let igvpro = 0;
    let parcial = 0;
    let igv = 0;
    let total = 0;

    if (Number(this.dataRows[index].vvf2) > 0) {
      vvf1 = Number(this.dataRows[index].vvf2);
    } else {
      vvf1 = Number(this.dataRows[index].vvf1);
    }

    coscom = Number(this.dataRows[index].coscom);
    igvpro = Number(this.dataRows[index].igvpro);
    cantidad = Number(this.dataRows[index].cantE);
    parcial = Number(this.dataRows[index].parcial);
    igv = Number(this.dataRows[index].igv);
    total = Number(this.dataRows[index].total);

    d1 = ((vvf1 - coscom) / vvf1) * 100;
    parcial = (Math.round(coscom * 100) / 100) * (cantidad + Number(this.dataRows[index].boni));
    igv = (Math.round(parcial * 100) / 100) * (igvpro / 100);
    total = parcial + igv;

    this.dataRows[index].desct1 = (Math.round(d1 * 100) / 100).toString();
    this.dataRows[index].desct2 = (Math.round(d2 * 100) / 100).toString();
    this.dataRows[index].desct3 = (Math.round(d3 * 100) / 100).toString();
    this.dataRows[index].desct4 = (Math.round(d4 * 100) / 100).toString();
    this.dataRows[index].parcial = (Math.round(parcial * 100) / 100).toString();
    this.dataRows[index].igv = (Math.round(igv * 100) / 100).toString();
    this.dataRows[index].total = (Math.round(total * 100) / 100).toString();
  }

  calculateTotal() {
    this.totalPagar = 0;
    this.totaligv = 0;
    this.totalParcial = 0;
    this.dataRows.forEach(dataElement => {
      this.totaligv += Number(dataElement.igv);
      this.totalParcial += Number(dataElement.parcial);
      this.totalPagar += Number(dataElement.total);
    });
  }
  // End Calcular valores

  // Hover
  siRowSelectedHover(index: number) {
    let rowStyle = 'background-white-fixed-column';

    if (this.isRowSelectedGOC == index) {
      rowStyle = 'background-selected-column';
    }

    if (this.isRowHoverGOC == index) {
      rowStyle = 'background-hover-fixed-column';
    }

    return rowStyle;
  }

  isNotRowHover() {
    this.isHoveringGOC = false;
    this.isRowHoverGOC = -1;
  }

  onRowHover(index: number) {
    this.isRowHoverGOC = index;
  }
  // End Hover
  // -----
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

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }


}
