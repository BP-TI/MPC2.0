import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConstants } from '../../shared/constants/app.constants';
import { ReporteProductosCompra } from '../../models/ordenCompra';
import { Laboratorios, Proveedores } from '../../models/parametros';
import { IUltimasComprasReq } from '../../models/ordenCompra';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse, JsonpClientBackend } from '@angular/common/http';
import { GlobalService } from '../../shared/services/global.service';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-purchase-planning',
  standalone: false,
  templateUrl: './purchase-planning.component.html',
  styleUrls: ['./purchase-planning.component.css'],
})
export class PurchasePlanningComponent implements OnInit {

  @ViewChild('verSustitutosModal') verSustitutosModal: any;

  sustitutos = [
    { codpro: 'P001', despro: 'Paracetamol 500mg', prisal: 1.2, stk_alm: 50, stk_alm_m: 10, codlab: 'LAB01', ubipro: 'A1', codgen: 'GEN01', moncod: 'PEN', stkfra: 5, codlam: 'L001', dtoprox: '10%', categvta: 'A' },
    { codpro: 'P002', despro: 'Ibuprofeno 400mg', prisal: 2.5, stk_alm: 40, stk_alm_m: 15, codlab: 'LAB02', ubipro: 'B2', codgen: 'GEN02', moncod: 'PEN', stkfra: 8, codlam: 'L002', dtoprox: '5%', categvta: 'B' },
  ];

  showFilters: boolean = false;
  filteredRows: any[] = [];
  filters: { [key: string]: any } = {};

  title: string = "";
  agencyCode: string = sessionStorage.getItem(AppConstants.Session.AGENCYCODE) ?? "";
  agencyName: string = sessionStorage.getItem(AppConstants.Session.AGENCYNAME) ?? "";
  usersessionId: string = sessionStorage.getItem(AppConstants.Session.USERID) ?? "";
  channelName: string = sessionStorage.getItem(AppConstants.Session.SALES_CHANNEL_DESCRIPTION) ?? "";
  titulo = "Planificacion de Orden de Compra";
  tableClass: string = "table-company-0";
  tableClass2: string = "table-company-4";//table-company-default
  headTableAnalisisCompra: string[] = []
  rows: any = [];
  rowsLb: any[];
  rowsUCompras: any[];
  rowsUIngresos: any[];
  conscom: any = undefined;
  conscomImpto: any = undefined;
  loading: boolean = false;
  columns: any = [];
  columnasLb: any = [];
  tipoDocumento: string = "1";
  //client: ResponseGetClientT24;
  nombres: string = "";
  nroDocumento: string;
  proveedores: Proveedores[];
  laboratorios: Laboratorios[];
  labotaroiosSeleccionados: number[]; //Eliminar
  //bsModalRef: BsModalRef;
  loadingIndicator: boolean = false;
  currentFilter: string = "active";
  totalWidth = 0;

  validaCorreo: boolean = false;
  @ViewChild("actionTemplate") actionTemplate: TemplateRef<any>;

  selectedProveedores: string[] = [];
  proveedor = "0";
  opcionesForm: FormGroup;

  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;


  constructor(private fb: FormBuilder,
    private purchaseService: PurchasePlanningService,
    private ordenCompraService: OrdenCompraService,
    private modalService: NgbModal,
    public global: GlobalService) { }


  ngOnInit() {
    this.addHeadeTableAnalisisCompra();
    this.cargarProveedores();
    this.crearGrupoChecks();
    this.global.setGlobalVar('Módulo planificación de compra');
    this.mostrarMes("");
  }

  crearGrupoChecks() {
    this.opcionesForm = this.fb.group({
      todos: new FormControl({ value: false, disabled: true }),
      unico: [false]
    });
  }

  cargarProveedores() {
    this.loading = true;
    this.purchaseService.getProveedores().subscribe(
      (response) => {
        this.loading = false;
        this.proveedores = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

  getStickyOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      if (this.columns[i].sticky) {
        const width = parseInt(this.columns[i].width.replace('px', ''), 10);
        offset += width;
      }
    }
    return offset;
  }

  onSearch() {

  }

  onSelectAccount(row: any) {

  }

  onCheckChange(opcion: string) {
    if (opcion === 'todos') {
      if (this.opcionesForm.value.todos) {
        this.opcionesForm.patchValue({ unico: false });
        this.laboratorios.forEach(p => {
          p.selected = true;
        });
      } else {
        this.laboratorios.forEach(p => {
          p.selected = false;
        });
      }
    }
    if (opcion === 'unico' && this.opcionesForm.value.unico) {
      this.opcionesForm.patchValue({ todos: false });
    }
  }

  onChangeProveedor() {
    this.loading = true;
    this.rows = [];
    this.laboratorios = [];


    this.purchaseService.getLaboratorios(this.proveedor).subscribe(
      (response) => {
        this.loading = false;
        this.laboratorios = response;
        if (this.laboratorios.length > 0) {
          this.opcionesForm.get('todos')?.enable();
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );


  }

  Limpiar() {
    this.proveedor = "0";
    this.laboratorios = [];
    this.crearGrupoChecks();
    this.rows = [];
  }

  CalcularCompra() {
    this.loading = true;
    let labChecks = this.laboratorios?.filter(p => p.selected === true) || [];
    if (labChecks.length === 0) {
      this.loading = false;
      alert("Debes seleccionar al menos un laboratorio para continuar");
      return;
    }

    let cadenaLab = labChecks.map(p => p.codigoLab).join(',');

    this.ordenCompraService.getCalularCompra(this.proveedor, cadenaLab, "").subscribe(
      (response) => {

        this.loading = false;
        if (response == null) {
          alert("No se encontraton registros");

        } else {
          if (response.codStatus === 1) {
            if (response.message === "OK") {
              this.rows = response.detalleProductos;
            } else {
              alert(response.message);
            }
          } else {
            alert(response.message);
          }
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

  openContextMenu(event: MouseEvent, opcionMenu: number) {
    event.preventDefault(); // evita el menú del navegador
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
  }

  applyFilter(columnProp: string, value: string) {
    this.filters[columnProp] = value.toLowerCase();

    this.filteredRows = this.rows.filter((row: any) => {
      return Object.keys(this.filters).every((key) => {
        if (!this.filters[key]) return true;
        const cellValue = row[key]?.toString().toLowerCase() || '';
        return cellValue.includes(this.filters[key]);
      });
    });
  }


  handleMenuAction(action: string) {
    switch (action) {
      case 'view':
        this.modalService.open(this.verSustitutosModal, { size: 'xl', centered: true, backdrop: false, scrollable: true });

        break;

      case 'filters':
        this.showFilters = !this.showFilters;
        if (this.showFilters) {
          this.filteredRows = [...this.rows];
        } else {
          this.filters = {};
          this.filteredRows = [...this.rows];
        }
        break;
      case 'edit':
        alert('✏️ Editar');
        break;
      case 'delete':
        alert('🗑️ Eliminar');
        break;
    }
  }

  // tabla
  addHeadeTableAnalisisCompra() {
    this.headTableAnalisisCompra.push('cod.');
    this.headTableAnalisisCompra.push('Descripción');
    this.headTableAnalisisCompra.push('Labora.');
    this.headTableAnalisisCompra.push('Cant. Unid. Empaque');
    this.headTableAnalisisCompra.push('Condición');
    this.headTableAnalisisCompra.push('Tipo');
    this.headTableAnalisisCompra.push(this.mostrarMes('mesquinto'));
    this.headTableAnalisisCompra.push(this.mostrarMes('mescuarto'));
    this.headTableAnalisisCompra.push(this.mostrarMes('mestercero'));
    this.headTableAnalisisCompra.push(this.mostrarMes('messegundo'));
    this.headTableAnalisisCompra.push(this.mostrarMes('mesprimero'));
    this.headTableAnalisisCompra.push(this.mostrarMes('mesActual'));
    this.headTableAnalisisCompra.push(this.mostrarMes('mesProyectado'));
    this.headTableAnalisisCompra.push('Prom. Mes<');
    this.headTableAnalisisCompra.push('Pre compra');
    this.headTableAnalisisCompra.push('Compra final');
    this.headTableAnalisisCompra.push('Boni');
    this.headTableAnalisisCompra.push('Almacén');
    this.headTableAnalisisCompra.push('Organización');
    this.headTableAnalisisCompra.push('Canje');
    this.headTableAnalisisCompra.push('logis_inver');
    this.headTableAnalisisCompra.push('O/C');
    this.headTableAnalisisCompra.push('Cobertura Organizacional');
    this.headTableAnalisisCompra.push('Maximo Infrastock');
    this.headTableAnalisisCompra.push('V.V.F');
    this.headTableAnalisisCompra.push('V.V.F Nuevo');
    this.headTableAnalisisCompra.push('Dsct.1');
    this.headTableAnalisisCompra.push('Dsct.2');
    this.headTableAnalisisCompra.push('Dsct.3');
    this.headTableAnalisisCompra.push('Dsct.4');
    this.headTableAnalisisCompra.push('CosCom');
    this.headTableAnalisisCompra.push('Parcial');
    this.headTableAnalisisCompra.push('Igv');
    this.headTableAnalisisCompra.push('Total');
    this.headTableAnalisisCompra.push('Observación');
  }

  eliminarColumna(headColumna: string, nombreTabla: string, event: Event) {
    let tabla: any = document.getElementById(nombreTabla);
    let row = tabla.rows;
    let idColumna: number = 99999;
    let isChecked = (event.target as HTMLInputElement).checked;

    for (let i = 0; i < row.length; i++) {
      let celdas = row[i].cells;

      for (let j = 0; j < celdas.length; j++) {

        if (headColumna.trim() === celdas[j].innerHTML.trim()) {
          idColumna = j;
        }
        if (j === idColumna) {
          if (isChecked) {
            let styleColumn: string = "text-align: left; padding: 4px; position: sticky; top: 0;";
            if (j == 0) {
              styleColumn += "z-index: 5 !important;";
            }
            celdas[j].setAttribute("style", styleColumn);
          } else {
            celdas[j].setAttribute("style", "display: none;");

          }
        }
      }
    }
  }

  mostrarMes(mesConsultado: string): string {
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

  getTableUltimasCompras(data: any) {
    let dataSessionStorage = sessionStorage.getItem('USUARIOLOGIN')?.toString();
    let dataUsuario = JSON.parse(dataSessionStorage ? dataSessionStorage : '');

    let dataRequets: IUltimasComprasReq = {
      codProveedor: this.proveedor,
      codLab: data.codLaboratorio,
      codProducto: data.codProducto,
      usuarioLogin: dataUsuario.usuario,
      codUsuario: dataUsuario.codigoUsuario
    }
    this.ordenCompraService.getUltimasCompras(dataRequets).subscribe((response: any) => {

      if (response.codStatus == 1) {
        if (response.ultimasCompras.length > 0) {
          this.rowsUCompras = response.ultimasCompras;
        }

        if (response.ultimosIngresos.length > 0) {
          this.rowsUIngresos = response.ultimosIngresos;
        }

        this.conscom = response.costoCompra;
        this.conscomImpto = response.costoCompraIGV;
      }

    }, (error: HttpErrorResponse) => {
      this.loading = false;
    });

  }






}
