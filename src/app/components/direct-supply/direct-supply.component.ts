import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConstants } from '../../shared/constants/app.constants';
import { ReporteProductosCompra } from '../../models/ordenCompra';
import { Laboratorios, Proveedores, Boticas } from '../../models/parametros';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DirectSupplyService } from '../../services/DirectSupply/directSupply.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenCompraAbadiService } from '../../services/DirectSupply/ordenCompraAbadi.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import { GlobalService } from '../../shared/services/global.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-direct-supply',
  standalone: false,
  templateUrl: './direct-supply.component.html',
  styleUrls: ['./direct-supply.component.css'],
})
export class DirectSupplyComponent implements OnInit {

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

  titulo = "Planificacion de Compra Directa a Boticas";
  tableClass: string = "table-company-0";
  tableClass2: string = "table-company-4";//table-company-default
  rows: any = [];
  headTableAnalisisCompra: string[] = []
  rowsLb: any[];
  loading: boolean = false;
  columns: any = [];
  columnasLb: any = [];
  tipoDocumento: string = "1";
  //client: ResponseGetClientT24;
  nombres: string = "";
  nroDocumento: string;
  proveedores: Proveedores[];
  laboratorios: Laboratorios[];
  boticas: Boticas[];
  labotaroiosSeleccionados: number[]; //Eliminar
  //bsModalRef: BsModalRef;
  loadingIndicator: boolean = false;
  currentFilter: string = "active";
  totalWidth = 0;
  totalParcial: number = 0;
  totalIGV: number = 0;
  totalPagar: number = 0;
  isHovering: boolean = false;
  isRowHover: Number = -1;
  isRowSelected: Number = -1;
  validaCorreo: boolean = false;
  @ViewChild("actionTemplate") actionTemplate: TemplateRef<any>;

  selectedProveedores: string[] = [];
  proveedor = "0";
  opcionesForm: FormGroup;
  opcionesFormBot: FormGroup;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;


  constructor(private fb: FormBuilder,
    private supplyService: DirectSupplyService,
    private ordenCompraService: OrdenCompraAbadiService,
    private modalService: NgbModal,
    public global: GlobalService) { }


  ngOnInit() {
    this.cargarProveedores();
    this.createColumsTableTC();
    this.createColumsTableLB();
    this.crearGrupoChecks();
    this.addHeadeTable();
    this.global.setGlobalVar('Módulo Abastecimiento Directo');
  }

  crearGrupoChecks() {
    this.opcionesForm = this.fb.group({
      todos: [false],
      unico: [false]
    });
     this.opcionesFormBot = this.fb.group({
      todos: [false],
    });
  }



  cargarProveedores() {
    this.loading = true;
    this.supplyService.getProveedores().subscribe(
      (response) => {
        this.loading = false;
        this.proveedores = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }


  private createColumsTableTC(): void {
    const columnDefinitions = [
      { name: 'Cód.', prop: 'codProducto', width: 70, frozenLeft: true },
      { name: 'Descripción', prop: 'nombreProducto', width: 250, frozenLeft: true },
      { name: 'Laboratorio', prop: 'nombreLaboratorio', width: 250, frozenLeft: true },
      { name: 'Cant. Unid. Empaque', prop: 'unidadEmpaque', width: 70 },
      { name: 'Condición', prop: 'condicion', width: 150 },
      { name: 'Tipo', prop: 'ABC', width: 150 },
      { name: 'Mayo 31', prop: 'mesQuinto', width: 70 },
      { name: 'Jun 30', prop: 'mesCuarto', width: 70 },
      { name: 'Jul 30', prop: 'mesTercero', width: 70 },
      { name: 'Ago 31', prop: 'mesSegundo', width: 70 },
      { name: 'Set 30', prop: 'mesPrimero', width: 70 },
      { name: 'Oct 5', prop: 'mesActual', width: 70 },
      { name: 'Oct Proy. 31', prop: 'mesActualProyeccion', width: 70 },
      { name: 'Prom. Mes', prop: 'promMes', width: 70 },
      { name: 'Pre Compra', prop: 'preCompra', width: 70 },
      { name: 'Compra Final', prop: 'compraFinal', width: 70 },
      { name: 'Boni', prop: 'bonificacion', width: 70 },
      { name: 'Almacén', prop: 'almacen', width: 70 },
      { name: 'Organización', prop: 'org', width: 90 },
      { name: 'Canje', prop: 'canje', width: 70 },
      { name: 'Logis_Inver', prop: 'logisticaInversa', width: 70 },
      { name: 'O/C', prop: 'oc', width: 70 },
      { name: 'Cobertura Organización', prop: 'cobOrgAct', width: 90 },
      { name: 'Máximo Infrastock', prop: 'maxInfraStock', width: 70 },
      { name: 'V.V.F', prop: 'VVF1', width: 70 },
      { name: 'V.V.F Nuevo', prop: 'VVF2', width: 70 },
      { name: 'Dscto 1', prop: 'descuento1', width: 70 },
      { name: 'Dscto 2', prop: 'descuento2', width: 70 },
      { name: 'Dscto 3', prop: 'descuento3', width: 70 },
      { name: 'Dscto 4', prop: 'descuento4', width: 70 },
      { name: 'CosCom', prop: 'cosCom', width: 70 },
      { name: 'Parcial', prop: 'parcial', width: 70 },
      { name: 'Igv', prop: 'igv', width: 70 },
      { name: 'Total', prop: 'totalParcial', width: 70 },
      { name: 'Observación', prop: 'observaciones', width: 150 },
    ];

    this.columns = [
      ...columnDefinitions.map((col) => ({
        ...col,
        draggable: true,
        resizeable: true,
        cellClass: "text-center",
        minWidth: col.width || 100,
      }))
    ];

    this.totalWidth = this.columns.reduce((sum: any, col: any) => sum + (col.width || 100), 0);


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

  private createColumsTableLB(): void {
    const columnDefinitions = [
      { prop: "ABC", name: "Tipo", width: 120 },
      { prop: "puntoVenta", name: "Punto Venta", width: 40 },
      { prop: "MaxAlmacen", name: "Maximo Almacén", width: 40 },
      { prop: "Total", name: "Total", width: 40 }
    ];

    this.columnasLb = columnDefinitions.map((col) => ({
      ...col,
      draggable: false,
      resizeable: true,
      cellClass: (row: any) => {
        switch (col.prop) {
          case 'ABC':
            return 'text-left bold-text';
          default:
            return 'text-center';
        }
      }
    }));
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
          this.onChangeLaboratorios(); 
        });
      } else {
        this.laboratorios.forEach(p => {
          p.selected = false;
          this.boticas=[];
        });
      }
    }
    if (opcion === 'unico' && this.opcionesForm.value.unico) {
      this.opcionesForm.patchValue({ todos: false });
    }
  }

    onCheckChangeBot(opcion: string) {
    if (opcion === 'todosBot') {
      if (this.opcionesFormBot.value.todos) {
        this.boticas.forEach(p => {
          p.selected = true;
        });
      } else {
        this.boticas.forEach(p => {
          p.selected = false;
        });
      }
    }
  }


  onChangeProveedor() {
    this.loading = true;
    this.rows = [];
    this.laboratorios = [];
    this.boticas=[];
    this.supplyService.getLaboratorios(this.proveedor).subscribe(
      (response) => {
        this.loading = false;
        this.laboratorios = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );

  }
  onChangeLaboratorios(){
     this.loading = true;
    this.boticas = [];
    let labChecks = this.laboratorios?.filter(p => p.selected === true) || [];
    let cadenaLab = labChecks.map(p => p.codigoLab).join(',');
    this.supplyService.getBoticas(this.proveedor,cadenaLab).subscribe(
      (response) => {
        this.loading = false;
        this.boticas = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );

  }
   denyRightClick(event: MouseEvent) {
    event.preventDefault();
  }

    clearField() {
    /*this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
    this.conscomImpto = undefined;*/
    this.laboratorios = [];
    this.boticas=[];
    this.rows = [];
    this.opcionesForm.get('todos')?.reset();
    this.opcionesFormBot.get('todos')?.reset();
    this.totalIGV = 0;
    this.totalPagar = 0;
    this.totalParcial = 0;
    this.proveedor = "0";
    this.isRowSelected = -1;
  }

    calculateTotal() {
    let sumaParcial: number = 0;
    let sumaIGV: number = 0;
    let sumaPagar: number = 0;

    this.rows.forEach((data: any) => {
      if (parseFloat(data.compraFinal) > 0) {
        sumaParcial += parseFloat(data.parcial);
        sumaIGV += parseFloat(data.igv);
        sumaPagar += parseFloat(data.total);
      }
    });

    this.totalParcial = sumaParcial;
    this.totalIGV = sumaIGV;
    this.totalPagar = sumaPagar;
  }

  CalcularCompra() {
    this.loading = true;
    let labChecks = this.laboratorios?.filter(p => p.selected === true) || [];
    if (labChecks.length === 0) {
      this.loading = false;
      alert("Debes seleccionar al menos un laboratorio para continuar");
      return;
    }
     let BotChecks = this.boticas?.filter(p => p.selected === true) || [];
    if (BotChecks.length === 0) {
      this.loading = false;
      alert("Debes seleccionar al menos un akmacen para continuar");
      return;
    }


    let cadenaLab = labChecks.map(p => p.codigoLab).join(',');
    let cadenaBot = BotChecks.map(p => p.codAlmacen).join(',');

    this.ordenCompraService.getCalularCompra(this.proveedor, cadenaLab, "","",cadenaBot).subscribe(
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

  openContextMenu(event: MouseEvent,opcionMenu:number) {
    event.preventDefault(); // evita el menú del navegador
    this.contextMenu.open(event.pageX, event.pageY,opcionMenu);
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

  addHeadeTable() {
    this.headTableAnalisisCompra = [
      '#R',
      'cod.',
      'Descripción',
      'Labora.',
      'Establecimiento',
      'Cant. Unid. Empaque',
      'Condición',
      this.showMonth('mesquinto'),
      this.showMonth('mescuarto'),
      this.showMonth('mestercero'),
      this.showMonth('messegundo'),
      this.showMonth('mesprimero'),
      this.showMonth('mesActual'),
      this.showMonth('mesProyectado'),
      'Prom. Mes',
      'Pre compra',
      'Compra final',
      'Boni',
      'Botica',
      'O/C Vigente',
      'O/C Vencida',
      'O/C',
      'Botica + O/C',
      'Cobertura Botica (Dia)',
      'Observación',
    ];
  }

  deleteColumn(headColumna: string, nombreTabla: string, event: Event) {
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


  eliminarColumna(headColumna: string, nombreTabla: string) {
    let tabla: any = document.getElementById(nombreTabla);
    let row = tabla.rows;
    let idColumna: number = 99999;

    for (let i = 0; i < row.length; i++) {
      let celdas = row[i].cells;
      for (let j = 0; j < celdas.length; j++) {

        if (headColumna.includes(celdas[j].innerHTML)) {
          idColumna = j;
        }

        if (j === idColumna) {
          console.log(j);
          console.log('Entro');
          celdas[j].remove();
        }
      }
    }
  }

  seleccionarLaboratorio(idLaboratorio: number){

  }

   // hover tabla Analisis Compra
  onRowHover(index: number) {
    this.isRowHover = index;
  }

  siRowSelectedHover(index: number) {
    let rowStyle = 'background-white-fixed-column';

    if (this.isRowSelected == index) {
      rowStyle = 'background-selected-column';
    }

    if (this.isRowHover == index) {
      rowStyle = 'background-hover-fixed-column';
    }

    return rowStyle;
  }

  isNotRowHover() {
    this.isHovering = false;
    this.isRowHover = -1;
  }
  // End hover tabla Analisis Compra

}
