import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Laboratorios, Proveedores, Condiciones, AddHeaderTableReq, GetHeaderTableReq } from '../../models/parametros';
import { IAdicionarProductoCalculoReq, ICompraFinalReq, IDetalleOCAnterior, IUltimasComprasReq, IUPdateCondicionProduct, PurchaseOrder, PurchaseOrder_table_modal } from '../../models/ordenCompra';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from '../../shared/services/global.service';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../shared/models/option-click';
import { AppConstants } from '../../shared/constants/app.constants';
import { ShowSubstitutesComponent } from '../show-substitutes/show-substitutes.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { InventoryPolicyComponent } from '../inventory-policy/inventory-policy.component';
import { HeadTableAC } from '../../models/ordenCompra';
import { PurchaseOrderComponent } from '../purchase-order/purchase-order.component';
import { ConfirmacionModalComponent } from '../../modales/confirmacionModal/confirmacionModal.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ConfirmacionClaveModalComponent } from '../../modales/confirmacion-clave-modal/confirmacion-clave-modal.component';
import { AutorizacionModalComponent } from '../../modales/autorizacion-modal/autorizacion-modal.component';
import { DetalleStockBoticaComponent } from '../../modales/purchase-planning/detalle-stock-botica/detalle-stock-botica.component';
import { ParameterService } from '../../services/Parametros/parameter.service';
import { UserDataLogin } from '../../models/persona';
import { ShowOCsComponent } from '../../modales/purchase-planning/show-ocs/show-ocs.component';

@Component({
  selector: 'app-purchase-planning',
  standalone: false,
  templateUrl: './purchase-planning.component.html',
  styleUrls: ['./purchase-planning.component.css'],
})
export class PurchasePlanningComponent implements OnInit, AfterViewInit {

  @ViewChild('verSustitutosModal') verSustitutosModal: any;

  showFilters: boolean = false;
  filteredRows: any[] = [];
  filters: { [key: string]: any } = {};

  headTableAnalisisCompra: HeadTableAC[] = []
  headTableUltimasCompras: string[] = []
  headTableUltimosIngresos: string[] = []
  rows: PurchaseOrder[] = [];
  rowsLb: any[];
  rowsUCompras: any[];
  rowsUIngresos: any[];
  rowsDataTotal: any[];
  conscom: any = undefined;
  conscomImpto: any = undefined;
  loading: boolean = false;
  proveedores: Proveedores[];
  laboratorios: Laboratorios[];
  validaCorreo: boolean = false;
  totalParcial: number = 0;
  totalIGV: number = 0;
  totalPagar: number = 0;
  proveedor = "0";
  opcionesForm: FormGroup;
  condiciones: Condiciones[] = [];
  isHovering: boolean = false;
  isRowHover: Number = -1;
  isRowSelected: Number = -1;
  idProductSelected: string = '';
  showFilterTable: boolean = false;
  tableSelectedExcel: string = '';
  dataUsuario: UserDataLogin;


  showToast = false;
  toastMessage = '';
  idCondicion = "";
  idProducto = "";
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';
  idCondicionCbo: string = "";
  valorAnterior = "";
  inputCompraFinal: string = '';
  valueCompraFinal: string = '';
  previousValueRow: PurchaseOrder;
  isOpen = false;
  ocAntrior: Number = 0;

  isOCAnterior: boolean = false;


  @ViewChild("actionTemplate") actionTemplate: TemplateRef<any>;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;
  @ViewChild('dropdownToggle') toggle!: ElementRef;
  @ViewChild('menu') menu!: ElementRef;


  constructor(private fb: FormBuilder,
    private purchaseService: PurchasePlanningService,
    private ordenCompraService: OrdenCompraService,
    private modalService: NgbModal,
    public global: GlobalService,
    private el: ElementRef,
    private parameterService: ParameterService,
  ) { }

  ngOnInit() {
    this.addHeadeTable();
    this.cargarProveedores();
    this.getCondiciones();
    this.loadData();
    this.showColumn();
  }

  loadData() {
    this.global.setGlobalVar('Módulo planificación de compra');
    this.opcionesForm = this.fb.group({
      todos: [false]
    });
    this.dataUsuario = this.global.getDataUserLogin();
  }

  ngAfterViewInit() {
    // Para poder mover las columnas de la tabla Analisis de compra
    const tabla = this.el.nativeElement.querySelector('#tablaAnalisiCompra');
    let columnaOrigen: HTMLElement | null = null;

    tabla.querySelectorAll('th').forEach((th: HTMLElement) => {
      th.addEventListener('dragstart', e => {
        columnaOrigen = th;
        (e as DragEvent).dataTransfer!.effectAllowed = 'move';
      });

      th.addEventListener('dragover', e => e.preventDefault());

      th.addEventListener('drop', e => {
        e.preventDefault();
        if (columnaOrigen === th) return;

        const ths = Array.from(th.parentNode!.children);
        const origenIndex = ths.indexOf(columnaOrigen!);
        const destinoIndex = ths.indexOf(th);
        if (origenIndex < 3) return;
        if (destinoIndex < 3) return;
        // Mover encabezado
        if (origenIndex > destinoIndex) {
          th.parentNode!.insertBefore(columnaOrigen!, th);
        } else {
          th.parentNode!.insertBefore(columnaOrigen!, th.nextSibling);
        }

        // Mover celdas
        tabla.querySelectorAll('tbody tr').forEach((tr: HTMLElement) => {
          const celdas = Array.from(tr.children);
          const celdaOrigen = celdas[origenIndex];
          const celdaDestino = celdas[destinoIndex];

          if (origenIndex > destinoIndex) {
            tr.insertBefore(celdaOrigen, celdaDestino);
          } else {
            tr.insertBefore(celdaOrigen, celdaDestino.nextSibling);
          }
        });
      });
    });

    // Para que el menu de filtro columnas de la tabla AC no se cierre
    const menus = this.el.nativeElement.querySelectorAll('.dropdown-menu');
    menus.forEach((menu: any) => {
      menu.addEventListener('click', (event: MouseEvent) => event.stopPropagation());
    });

    // verifiar que el toggle esta abiero o no
    this.toggle.nativeElement.addEventListener('click', (event: any) => {
      this.isOpen = !this.isOpen;
    });

    this.menu.nativeElement.addEventListener('click', () => {
      this.isOpen = false;
      this.saveColumn();
    });

  }

  crearGrupoChecks() {
    this.opcionesForm = this.fb.group({
      todos: new FormControl({ value: false, disabled: true }),
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

  onCheckChange(opcion: string) {
    if (opcion === 'todos') {
      if (this.opcionesForm.value.todos) {
        this.laboratorios.forEach(p => {
          p.selected = true;
        });
      } else {
        this.laboratorios.forEach(p => {
          p.selected = false;
        });
      }
    }
  }

  onChangeProveedor() {
    this.loading = true;
    this.rows = [];
    this.rowsDataTotal = [];
    this.laboratorios = [];
    this.clearDataTablesSecond();

    this.purchaseService.getLaboratorios(this.proveedor).subscribe(
      (response) => {
        this.loading = false;
        this.laboratorios = response;
        if (this.laboratorios.length > 0) {
          this.opcionesForm?.get('todos')?.enable();
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

  CalcularCompra() {
    this.loading = true;
    this.rowsDataTotal = [];
    this.clearDataTablesSecond();

    let labChecks = this.laboratorios?.filter(p => p.selected === true) || [];
    if (labChecks.length === 0) {
      this.loading = false;
      this.AlertToast(`Warning: Debes seleccionar al menos un laboratorio para continuar.`, 'warning')
      return;
    }

    let cadenaLab = labChecks.map(p => p.codigoLab).join(',');

    this.ordenCompraService.getCalularCompra(this.proveedor, cadenaLab, "").subscribe(
      (response) => {

        this.loading = false;
        if (response == null) {
          this.AlertToast(`Información: No se encontraron registros.`, 'info');

        } else {
          if (response.codStatus === 1) {
            if (response.message === "OK") {
              response.detalleProductos.forEach((data: any) => {
                this.rows.push({
                  ABC: data.ABC,
                  ObservacionAutoriza: data.ObservacionAutoriza,
                  VVF1: Number(data.VVF1).toString(),
                  VVF2: Number(data.VVF2).toString(),
                  almacen: data.almacen,
                  asociado: data.asociado,
                  bonificacion: Number(data.bonificacion.fixed(2)).toString(),
                  botica: data.botica,
                  canje: data.canje,
                  clasificacion: data.clasificacion,
                  cobOrgAct: data.cobOrgAct,
                  cobOrgActCalcNoBotica: data.cobOrgActCalcNoBotica,
                  cobOrgActNoBotica: data.cobOrgActNoBotica,
                  codLaboratorio: data.codLaboratorio,
                  codProducto: data.codProducto,
                  compraFinal: Number(data.compraFinal).toString(),
                  condicion: data.condicion,
                  cosCom: Number(data.cosCom).toString(),
                  descuento1: Number(data.descuento1).toString(),
                  descuento2: Number(data.descuento2).toString(),
                  descuento3: Number(data.descuento3).toString(),
                  descuento4: Number(data.descuento4).toString(),
                  fracUnidad: data.fracUnidad,
                  igv: data.igv,
                  igvProducto: data.igvProducto,
                  incentivo: data.incentivo,
                  logisticaInversa: data.logisticaInversa,
                  maxBot: data.maxBot,
                  maxInfraStock: data.maxInfraStock,
                  mesActual: data.mesActual,
                  mesActualProyeccion: data.mesActualProyeccion,
                  mesCuarto: data.mesCuarto,
                  mesPrimero: data.mesPrimero,
                  mesQuinto: data.mesQuinto,
                  mesSegundo: data.mesSegundo,
                  mesTercero: data.mesTercero,
                  nombreLaboratorio: data.nombreLaboratorio,
                  nombreProducto: data.nombreProducto,
                  nroOC: data.nroOC,
                  observaciones: data.observaciones,
                  oc: data.oc,
                  ocVencido: data.ocVencido,
                  ocVigente: data.ocVigente,
                  org: data.org,
                  orgNoBotica: data.orgNoBotica,
                  parcial: data.parcial,
                  plazoPago: data.plazoPago,
                  preCompra: data.preCompra,
                  promMes: data.promMes,
                  relacionado: data.relacionado,
                  secRelacion: data.secRelacion,
                  total: data.total,
                  totalNoBotica: data.totalNoBotica,
                  totalParcial: data.totalParcial,
                  unidadEmpaque: data.unidadEmpaque,
                  usuarioAutoriza: data.usuarioAutoriza,
                  ventaSubDist: data.ventaSubDist,
                  isNewRow: false,

                });
              });
              this.rows = response.detalleProductos;
              this.rowsDataTotal = response.detalleProductos;
              this.createMenuListHeaderAC();

            } else {
              this.AlertToast(`Información: ${response.message}`, 'info');
            }
            this.calculateTotal();
          } else {
            this.AlertToast(`${response.message}`, 'warning');
          }
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        this.AlertToast(`Error: ${error}`, 'error2');
      }
    );
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
        this.openModalSubstitutes();
        break;
      case 'filters':
        this.showFilterTable = !this.showFilterTable;
        break;
      case 'edit':
        alert('✏️ Editar');
        break;
      case 'addProduct':
        this.openModalAddProduct();
        break;
      case 'delete':
        this.deleteProductList();
        break;
      case 'O-AZ':
        this.getACOrderAZ();
        break;
      case 'excel':
        switch (this.tableSelectedExcel) {
          case 'UC':
            this.ExportExcel_UC();
            break;
          case 'UI':
            this.ExportExcel_UI();
            break;
          case 'AC':
            this.ExportExcel();
            break;
        }
        break;
      case 'O-ZA':
        this.getACOrderZA()
        break;
      case 'finalZero':
        this.compraFinalcero();
        break
      case 'stockDetail':
        this.showStockBotica();
        break;
      case 'infraStock':
        this.showInfraStock();
        break;
      case 'discounts':
        this.getDescDisaggregated();
        break;

    }
  }

  // ------ * -----

  addHeadeTable() {
    this.headTableAnalisisCompra = [
      { description: AppConstants.TitleTableHeadAC.COD_PROD, check: true },
      { description: AppConstants.TitleTableHeadAC.DESCRIPCION, check: true },
      { description: AppConstants.TitleTableHeadAC.LABORATORIO, check: true },
      { description: AppConstants.TitleTableHeadAC.CANT_UNID_EMPAQUE, check: true },
      { description: AppConstants.TitleTableHeadAC.CONDICION, check: true },
      { description: AppConstants.TitleTableHeadAC.TIPO, check: true },
      { description: this.showMonth('mesquinto'), check: true },
      { description: this.showMonth('mescuarto'), check: true },
      { description: this.showMonth('mestercero'), check: true },
      { description: this.showMonth('messegundo'), check: true },
      { description: this.showMonth('mesprimero'), check: true },
      { description: this.showMonth('mesActual'), check: true },
      { description: this.showMonth('mesProyectado'), check: true }, //12
      { description: AppConstants.TitleTableHeadAC.PROM_MES, check: true },
      { description: AppConstants.TitleTableHeadAC.PRE_COMPRA, check: true },
      { description: AppConstants.TitleTableHeadAC.COMPRA_FINAL, check: true },
      { description: AppConstants.TitleTableHeadAC.BONIFICADO, check: true },
      { description: AppConstants.TitleTableHeadAC.ALMACEN, check: true },
      { description: AppConstants.TitleTableHeadAC.ORGANIZACION, check: true },
      { description: AppConstants.TitleTableHeadAC.CANJE, check: true },
      { description: AppConstants.TitleTableHeadAC.LOGIS_INVER, check: true },
      { description: AppConstants.TitleTableHeadAC.OC, check: true },
      { description: AppConstants.TitleTableHeadAC.COBERTURA_ORGANIZACIONAL, check: true },
      { description: AppConstants.TitleTableHeadAC.MAXI_INFRASTOCK, check: true },
      { description: AppConstants.TitleTableHeadAC.VVF, check: true },
      { description: AppConstants.TitleTableHeadAC.VVFNUEVO, check: true }, //25
      { description: AppConstants.TitleTableHeadAC.DESC1, check: true },
      { description: AppConstants.TitleTableHeadAC.DESC2, check: true },
      { description: AppConstants.TitleTableHeadAC.DESC3, check: true },
      { description: AppConstants.TitleTableHeadAC.DESC4, check: true },
      { description: AppConstants.TitleTableHeadAC.COSCON, check: true },
      { description: AppConstants.TitleTableHeadAC.PARCIAL, check: true },
      { description: AppConstants.TitleTableHeadAC.IGV, check: true },
      { description: AppConstants.TitleTableHeadAC.TOTAL, check: true },
      { description: AppConstants.TitleTableHeadAC.OBSERVACION, check: true }, //34

    ];

    this.headTableUltimasCompras = [
      AppConstants.TitleTableHeadUC.PROVEEDOR,
      AppConstants.TitleTableHeadUC.S_ORDEN,
      AppConstants.TitleTableHeadUC.FECHA,
      AppConstants.TitleTableHeadUC.CANT_E,
      AppConstants.TitleTableHeadUC.CANT_F,
      AppConstants.TitleTableHeadUC.VVF,
      AppConstants.TitleTableHeadUC.DESC1,
      AppConstants.TitleTableHeadUC.DESC2,
      AppConstants.TitleTableHeadUC.DESC3,
      AppConstants.TitleTableHeadUC.DESC4,
      AppConstants.TitleTableHeadUC.BONI,
    ];

    this.headTableUltimosIngresos = [
      AppConstants.TitleTableHeadUI.INVRUM,
      AppConstants.TitleTableHeadUI.PROVEEDOR,
      AppConstants.TitleTableHeadUI.DOCUMENTO,
      AppConstants.TitleTableHeadUI.FECHA_INGRESO,
      AppConstants.TitleTableHeadUI.ORDEN_COMPRA,
      AppConstants.TitleTableHeadUI.CANT_E,
      AppConstants.TitleTableHeadUI.CANT_F,
      AppConstants.TitleTableHeadUI.VVF,
      AppConstants.TitleTableHeadUI.DESC1,
      AppConstants.TitleTableHeadUI.DESC2,
      AppConstants.TitleTableHeadUI.DESC3,
      AppConstants.TitleTableHeadUI.DESC4,
      AppConstants.TitleTableHeadUI.BONI,
    ];
  }

  showColumn() {
    let dataRequest: GetHeaderTableReq = {
      useusr: this.dataUsuario.usuario,
      idService: 'PLANE'
    }
    this.parameterService.getheaderTable(dataRequest).subscribe(response => {

      if (response.estado == true) {

        let listHead: string[] = JSON.parse(response.parametros)
        this.headTableAnalisisCompra.forEach(data => {
          let headExist = listHead.filter(p => p == data.description);
          if (headExist.length == 0) {
            data.check = false;
          } else {
            data.check = true;
          }
        });

      } else {
        this.AlertToast('WARNING: no se puedo cargar preferencias de las columnas', 'warning');
      }
    });
  }

  saveColumn() {
    if (!this.isOpen) {
      console.log('Entro');
      let filterColumnaSave = this.headTableAnalisisCompra.filter(p => p.check).map(x => x.description);

      let dataRequest: AddHeaderTableReq = {
        useusr: this.dataUsuario.usuario,
        idService: 'PLANE',
        estado: true,
        parametros: JSON.stringify(filterColumnaSave),
      }

      this.parameterService.postAddHeaderTable(dataRequest).subscribe(response => { });
    }
  }


  deleteColumn(headColumna: HeadTableAC) {
    headColumna.check = !headColumna.check;
  }

  toggleFromDiv(event: MouseEvent, checkbox: HTMLInputElement) {
    if (event.target === checkbox) {
      return;
    }
    checkbox.click();
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

  getTableUltimasCompras(data: any) {
    this.idCondicion = data.condicion;
    this.idProducto = data.codProducto;
    this.valueCompraFinal = data.compraFinal;
    if (this.isRowHover == this.isRowSelected) {
      return;
    }

    //this.loading = true;
    this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
    this.conscomImpto = undefined;



    let dataRequets: IUltimasComprasReq = {
      codProveedor: this.proveedor,
      codLab: data.codLaboratorio,
      codProducto: data.codProducto,
      usuarioLogin: this.dataUsuario.usuario,
      codUsuario: Number(this.dataUsuario.codigoUsuario)
    }

    this.ordenCompraService.getUltimasCompras(dataRequets).subscribe((response: any) => {

      if (response.codStatus == 1) {
        if (response.message != "OK") {
          this.AlertToast(response.message, 'warning');
        } else {
          if (response.ultimasCompras != null && response.ultimasCompras.length > 0) {
            this.rowsUCompras = response.ultimasCompras;
          }

          if (response.ultimosIngresos != null && response.ultimosIngresos.length > 0) {
            this.rowsUIngresos = response.ultimosIngresos;
          }

          this.conscom = response.costoCompra;
          this.conscomImpto = response.costoCompraIGV;
        }
      }
      else {
        this.AlertToast(response.message, 'error2');
      }
      this.loading = false;
    }, (error: HttpErrorResponse) => {
      this.loading = false;
      this.AlertToast(`Error: ${error}`, 'error2');
    });

  }
  // Menu click derecho excel
  openContextExcel(event: MouseEvent, opcionMenu: number, tabla: string = '') {
    event.preventDefault();
    this.tableSelectedExcel = tabla;
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
  }
  // Menu click derecho Tabla AC
  openContextMenu(event: MouseEvent, opcionMenu: number, headerColumnAC: string = '') {
    event.preventDefault();
    this.tableSelectedExcel = 'AC';
    this.contextMenu.filterColumn = headerColumnAC;
    this.contextMenu.dataFilter = [];
    this.rows.forEach((element: any) => {
      this.contextMenu.dataFilter.push({
        codProducto: element.codProducto.toString(),
        description: element.nombreProducto.toString(),
        laboratorio: element.nombreLaboratorio.toString(),
        tipo: element.ABC,
        compraFinal: Math.trunc(Number(element.compraFinal) * 100) / 100,
        condicion: element.condicion.toString(),
        check: true,
      })
    });
    this.createMenuListHeaderAC();
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
  }

  denyRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  clearField() {
    this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
    this.conscomImpto = undefined;
    this.laboratorios = [];
    this.rows = [];
    this.rowsDataTotal = [];
    this.opcionesForm.get('todos')?.disable();
    this.totalIGV = 0;
    this.totalPagar = 0;
    this.totalParcial = 0;
    this.proveedor = "0";
    this.isRowSelected = -1;
    this.idProductSelected = '';
    this.idCondicionCbo = '';
    this.idCondicion = '';
    this.isOCAnterior = false;
  }

  clearDataTablesSecond() {
    this.isRowSelected = -1;
    this.idProductSelected = '';
    this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
    this.conscomImpto = undefined;
  }

  calculateTotal() {
    let sumaParcial: number = 0;
    let sumaIGV: number = 0;
    let sumaPagar: number = 0;

    this.rows.forEach((data: any) => {
      if (Number(data.compraFinal) > 0) {
        sumaParcial += Number(data.parcial);
        sumaIGV += Number(data.igv);
        sumaPagar += Number(data.total);
      }
    });

    this.totalParcial = sumaParcial;
    this.totalIGV = sumaIGV;
    this.totalPagar = sumaPagar;
  }

  getCondiciones() {
    this.loading = true;
    this.purchaseService.getCondiciones().subscribe((response: any) => {
      if (response.length > 0) {
        response.forEach((data: any) => {
          this.condiciones.push({
            codigoCondicion: data.codigoCondicion,
            descripcion: data.descripcion
          })
        });
      }
    }, (error: HttpErrorResponse) => {
      this.loading = false;
    });
  }

  getNameCondicion(cod: string = ''): string {
    let filtrado = this.condiciones.find(condicion =>
      condicion.codigoCondicion.toString().trim() == cod.trim()
    );
    return filtrado ? filtrado.descripcion : '';
  }

  addNewProductoList(dataProduct: any) {
    let dataProductoExists = this.rows.filter(p => p.codProducto == dataProduct.codigoProducto);

    if (dataProductoExists.length > 0) {
      this.AlertToast("Warning: Este Producto ya se encuentra agregado.", 'warning');
      return;
    }

    let dataRequest: IAdicionarProductoCalculoReq = { codProducto: dataProduct.codigoProducto }
    let newData: PurchaseOrder = {
      ABC: "",
      ObservacionAutoriza: "",
      VVF1: "0.00",
      VVF2: "0.00",
      almacen: "0.00",
      asociado: "",
      bonificacion: "0.00",
      botica: "0.00",
      canje: "0.00",
      clasificacion: "",
      cobOrgAct: "0.00",
      cobOrgActCalcNoBotica: "0.00",
      cobOrgActNoBotica: "0.00",
      codLaboratorio: dataProduct.codigoLaboratorio,
      codProducto: dataProduct.codigoProducto,
      compraFinal: "0.00",
      condicion: "",
      cosCom: "00.00",
      descuento1: "00.00",
      descuento2: "0.00",
      descuento3: "0.00",
      descuento4: "0.00",
      fracUnidad: "0",
      igv: "0.00",
      igvProducto: "18.00",
      incentivo: "0.00",
      logisticaInversa: "0.00",
      maxBot: "0.00",
      maxInfraStock: "0.00",
      mesActual: "0.00",
      mesActualProyeccion: "0.00",
      mesCuarto: "0.00",
      mesPrimero: "0.00",
      mesQuinto: "0.00",
      mesSegundo: "0.00",
      mesTercero: "0.00",
      nombreLaboratorio: dataProduct.descripcionLaboratorio,
      nombreProducto: dataProduct.descripcionProducto,
      nroOC: "",
      observaciones: "",
      oc: "0.00",
      ocVencido: "0.00",
      ocVigente: "0.00",
      org: "0.00",
      orgNoBotica: "0.00",
      parcial: "0.00",
      plazoPago: "00.00",
      preCompra: "0.00",
      promMes: "0.00",
      relacionado: "",
      secRelacion: "0",
      total: "0.00",
      totalNoBotica: "0.00",
      totalParcial: "0.00",
      unidadEmpaque: "0",
      usuarioAutoriza: "",
      ventaSubDist: "0",
      isNewRow: true,
    };

    this.ordenCompraService.getAdicionarProductoCalculo(dataRequest).subscribe(response => {
      if (response.codStatus == 1) {
        if (response.message != "OK") {
          this.AlertToast(response.message, 'warning');
        } else {
          if (response.detalleProductos != null && response.detalleProductos.length > 0) {
            newData.relacionado = response.detalleProductos[0].relacionado;
            newData.incentivo = response.detalleProductos[0].incentivo;
            newData.codProducto = response.detalleProductos[0].codProducto;
            newData.nombreProducto = response.detalleProductos[0].nombreProducto;
            newData.codLaboratorio = response.detalleProductos[0].codLaboratorio;
            newData.nombreLaboratorio = response.detalleProductos[0].nombreLaboratorio;
            newData.fracUnidad = response.detalleProductos[0].fracUnidad;
            newData.unidadEmpaque = Number(response.detalleProductos[0].unidadEmpaque).toString();
            newData.condicion = response.detalleProductos[0].condicion;
            newData.clasificacion = response.detalleProductos[0].clasificacion;
            newData.ABC = response.detalleProductos[0].ABC;
            newData.plazoPago = Number(response.detalleProductos[0].plazoPago).toString();
            newData.mesQuinto = Number(response.detalleProductos[0].mesQuinto).toString();
            newData.mesCuarto = Number(response.detalleProductos[0].mesCuarto).toString();
            newData.mesTercero = Number(response.detalleProductos[0].mesTercero).toString();
            newData.mesSegundo = Number(response.detalleProductos[0].mesSegundo).toString();
            newData.mesPrimero = Number(response.detalleProductos[0].mesPrimero).toString();
            newData.mesActual = Number(response.detalleProductos[0].mesActual).toString();
            newData.mesActualProyeccion = response.detalleProductos[0].mesActualProyeccion;
            newData.promMes = Number(response.detalleProductos[0].promMes).toString();
            newData.preCompra = Number(response.detalleProductos[0].preCompra).toString();
            newData.compraFinal = Number(response.detalleProductos[0].compraFinal).toString();
            newData.bonificacion = Number(response.detalleProductos[0].bonificacion).toString();
            newData.botica = response.detalleProductos[0].botica;
            newData.almacen = response.detalleProductos[0].almacen;
            newData.org = response.detalleProductos[0].org;
            newData.canje = response.detalleProductos[0].canje;
            newData.logisticaInversa = response.detalleProductos[0].logisticaInversa;
            newData.ocVigente = response.detalleProductos[0].ocVigente;
            newData.ocVencido = response.detalleProductos[0].ocVencido;
            newData.oc = response.detalleProductos[0].oc;
            newData.total = Number(response.detalleProductos[0].total).toString();
            newData.cobOrgAct = response.detalleProductos[0].cobOrgAct;
            newData.maxBot = response.detalleProductos[0].maxBot;
            newData.maxInfraStock = response.detalleProductos[0].maxInfraStock;
            newData.asociado = response.detalleProductos[0].asociado;
            newData.nroOC = response.detalleProductos[0].nroOC;
            newData.secRelacion = response.detalleProductos[0].secRelacion;
            newData.usuarioAutoriza = response.detalleProductos[0].usuarioAutoriza;
            newData.ObservacionAutoriza = response.detalleProductos[0].ObservacionAutoriza;
            newData.ventaSubDist = response.detalleProductos[0].ventaSubDist;
            newData.orgNoBotica = response.detalleProductos[0].orgNoBotica;
            newData.totalNoBotica = response.detalleProductos[0].totalNoBotica;
            newData.cobOrgActNoBotica = response.detalleProductos[0].cobOrgActNoBotica;
            newData.cobOrgActCalcNoBotica = response.detalleProductos[0].cobOrgActCalcNoBotica;
            newData.VVF1 = response.detalleProductos[0].VVF1;
            newData.VVF2 = response.detalleProductos[0].VVF2;
            newData.descuento1 = response.detalleProductos[0].descuento1;
            newData.descuento2 = response.detalleProductos[0].descuento2;
            newData.descuento3 = response.detalleProductos[0].descuento3;
            newData.descuento4 = response.detalleProductos[0].descuento4;
            newData.cosCom = response.detalleProductos[0].cosCom;
            newData.igvProducto = response.detalleProductos[0].igvProducto;
            newData.parcial = response.detalleProductos[0].parcial;
            newData.igv = response.detalleProductos[0].igv;
            newData.totalParcial = response.detalleProductos[0].totalParcial;
            newData.observaciones = response.detalleProductos[0].observaciones;

            newData.isNewRow = true;
            this.rows.push(newData);
            this.AlertToast("Success: Se agrego el nuevo productro.", 'success');
          }
        }
      }
      else {
        this.AlertToast(response.message, 'error2');
      }
    });
  }

  deleteProductList() {
    if (this.isRowSelected == -1) {
      this.AlertToast("Warning: Debe de seleccionar el producto primero.", 'warning');
    }

    if (!confirm('¿Estás seguro de continuar?')) {
      return;
    }

    let dataRowDelete = this.rows.filter((p: any) => p.codProducto == this.idProductSelected);

    if (dataRowDelete.length > 0) {
      if (dataRowDelete[0].isNewRow) {
        this.rows = this.rows.filter((p: any) => p.codProducto != this.idProductSelected);
      } else {
        this.AlertToast("Warning: Solo se puede eliminar los registros nuevos.", 'warning');
      }
    }
    this.clearDataTablesSecond();
  }

  // Filtro tabla Analisis de compra
  createMenuListHeaderAC() {
    let dataMenUfilterComplete: OptionsCLickHeadMenuAC[] = [];

    this.rowsDataTotal.forEach((element: any) => {
      dataMenUfilterComplete.push({
        codProducto: element.codProducto.toString(),
        description: element.nombreProducto.toString(),
        laboratorio: element.nombreLaboratorio.toString(),
        tipo: element.ABC,
        compraFinal: Math.trunc(Number(element.compraFinal) * 100) / 100,
        condicion: element.condicion.toString(),
        check: true,
      })
    });

    this.contextMenu.dataProductos = dataMenUfilterComplete;
    this.contextMenu.dataFilter = dataMenUfilterComplete;

    let listado: string[] = [];
    let menuOption: OptionsClickHeadMenuAC2[] = [];

    // Producto
    menuOption = [];
    listado = [...new Set(dataMenUfilterComplete.map(u => u.description.toString()))];
    listado.forEach((element: string) => {
      menuOption.push({
        description: element,
        check: true,
        visible: true,
      });
    });
    this.contextMenu.menuListProducto = menuOption;

    // Laboratorio
    menuOption = [];
    listado = [...new Set(dataMenUfilterComplete.map(u => u.laboratorio.toString()))];
    listado.forEach((element: string) => {
      menuOption.push({
        description: element,
        check: true,
        visible: true,
      });
    });
    this.contextMenu.menuListLabora = menuOption;

    // Tipo
    menuOption = [];
    listado = [...new Set(dataMenUfilterComplete.map(u => u.tipo.toString()))];
    listado.forEach((element: string) => {
      menuOption.push({
        description: element,
        check: true,
        visible: true
      });
    });
    this.contextMenu.menuLisTipo = menuOption;

    // Compra Final
    menuOption = [];
    listado = [...new Set(dataMenUfilterComplete.map(u => u.compraFinal.toString()))];
    listado.forEach((element: string) => {
      menuOption.push({
        description: element,
        check: true,
        visible: true,
      });
    });
    this.contextMenu.menuListCompraFinal = menuOption;

    // Condiciones
    menuOption = [];
    listado = [...new Set(dataMenUfilterComplete.map(u => u.condicion.toString()))];
    listado.forEach((element: string) => {
      menuOption.push({
        description: this.condiciones.find(p => p.codigoCondicion.includes(element))?.descripcion ?? '',
        codCondiciones: element,
        check: true,
        visible: true,
      });
    });

    this.contextMenu.menuListCondiciones = menuOption;
  }

  getACOrderAZ() {
    if (this.contextMenu.filterColumn == 'Descripción') {
      this.rows.sort((a: any, b: any) =>
        a.nombreProducto.toString().trim().localeCompare(b.nombreProducto).toString().trim()
      );
    }

    if (this.contextMenu.filterColumn == 'Tipo') {
      this.rows.sort((a: any, b: any) =>
        (a.ABC ?? "").toString().trim().localeCompare((b.ABC ?? "").toString().trim())
      );
    }
    if (this.contextMenu.filterColumn == 'Labora.') {

      this.rows = this.rows.sort((a: any, b: any) =>
        (a.nombreLaboratorio ?? "").toString().trim().localeCompare(b.nombreLaboratorio ?? "").toString().trim()
      );
    }

    if (this.contextMenu.filterColumn == 'Compra final') {
      this.rows = this.rows.sort((a: any, b: any) =>
        (a.compraFinal ?? "").toString().trim().localeCompare(b.compraFinal ?? "").toString().trim()
      );
    }

    this.isRowSelected = -1;
    this.isRowSelected = this.rows.findIndex((p: any) => p.codProducto == this.idProductSelected);

  }

  getACOrderZA() {
    if (this.contextMenu.filterColumn == 'Descripción') {
      this.rows = this.rows.sort((a: any, b: any) =>
        b.nombreProducto.toString().trim().localeCompare(a.nombreProducto).toString().trim()
      );
    }

    if (this.contextMenu.filterColumn == 'Tipo') {
      this.rows = this.rows.sort((a: any, b: any) =>
        (b.ABC ?? "").toString().trim().localeCompare(a.ABC ?? "").toString().trim()
      );
    }

    if (this.contextMenu.filterColumn == 'Labora.') {
      this.rows = this.rows.sort((a: any, b: any) =>
        (b.nombreLaboratorio ?? "").toString().trim().localeCompare(a.nombreLaboratorio ?? "").toString().trim()
      );
    }

    if (this.contextMenu.filterColumn == 'Compra final') {
      this.rows = this.rows.sort((a: any, b: any) =>
        (b.compraFinal ?? "").toString().trim().localeCompare(a.compraFinal ?? "").toString().trim()
      );
    }

    this.isRowSelected = -1;
    this.isRowSelected = this.rows.findIndex((p: any) => p.codProducto == this.idProductSelected);
  }

  filterData(filter: string) {
    this.contextMenu.closeHeadTableAC();
    if (this.contextMenu.primerFiltro.length == 0) {
      this.contextMenu.primerFiltro = this.contextMenu.filterColumn;
    }
    let productFilter: string[] = filter.split('-');

    let dataFilter = this.rowsDataTotal.filter((element: any) =>
      productFilter.includes(element.codProducto)
    );
    this.rows = dataFilter;
    this.calculateTotal();
  }

  updateFilterHeader(event: any, codigo: any) {

    if (event.target.id.includes("idCondicionCbo")) {
      const nuevoValor = event.target.value.split(' ')[1];
      const indexSelect = this.rows.findIndex(p => p.codProducto == codigo);
      const modalConfirmacion = this.modalService.open(ConfirmacionModalComponent, {
        windowClass: "modal-confirmacion",
        backdrop: true,
        scrollable: true
      });

      modalConfirmacion.componentInstance.message = '¿Está seguro que desea actualizar la condición del producto?';

      modalConfirmacion.closed.subscribe((confirm: any) => {
        if (confirm) {
          this.idCondicionCbo = nuevoValor;
          this.rows = this.rows.map((p: any) => p.codProducto == codigo ? { ...p, condicion: this.idCondicionCbo } : p);

          this.loading = true;
          let dataReq: IUPdateCondicionProduct = {
            codProducto: this.rows[indexSelect].codProducto,
            // codUsuario: Number(this.global.getDataUserLogin().codigoUsuario),
            codUsuario: Number(this.dataUsuario.codigoUsuario),
            codCondicion: this.idCondicionCbo,
            asociado: this.rows[indexSelect].asociado,
          }
          this.ordenCompraService.postUpdateCondicionProducto(dataReq).subscribe(response => {
            this.loading = false;
            if (response.codStatus == 1) {
              this.AlertToast(response.message, 'success');
            }
          });

        } else {
          this.idCondicionCbo = "";
          this.idCondicionCbo = this.idCondicion;
          this.rows = this.rows.map((p: any) => p.codProducto == codigo ? { ...p, condicion: this.idCondicion } : p);
        }
      });

    }
    this.createMenuListHeaderAC();
  }
  // End Filtro tabla Analisis de compra

  // hover tabla Analisis Compra
  onRowHover(index: number) {
    this.isRowHover = index;
  }

  siRowSelectedHover(index: number, codProduct: string) {
    let rowStyle = 'background-white-fixed-column';

    if (this.isRowSelected == index) {
      rowStyle = 'background-selected-column';
      this.idProductSelected = codProduct;
      this.idCondicionCbo = this.rows.find((p: any) => p.codProducto == codProduct)?.condicion ?? '';
      this.inputCompraFinal = this.rows.find((p: any) => p.codProducto == codProduct)?.compraFinal ?? '';
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

  // Modals
  openModalInveventoryPolicy() {
    const modalInvPoli = this.modalService.open(InventoryPolicyComponent, {
      windowClass: "modal-inventori-policy",
      backdrop: false,
      scrollable: true
    });
  }

  openModalSubstitutes() {
    if (this.isRowSelected != -1) {
      const modalSUbs = this.modalService.open(ShowSubstitutesComponent, {
        windowClass: "modal-Substitutes",
        backdrop: false,
        scrollable: true
      });
      let data = this.rows.filter((p: any) => p.codProducto == this.idProductSelected);
      modalSUbs.componentInstance.codProv = this.proveedor;
      modalSUbs.componentInstance.codProduct = data[0].codProducto;
      modalSUbs.componentInstance.codLabora = data[0].codLaboratorio;
    } else {
      this.AlertToast("Warning: Debe de seleccionar el producto primero.", 'warning');
    }
  }

  calculatevvf2_PurchaseOrder(dataRowAC: PurchaseOrder, itemValue: string, nconValue: string): PurchaseOrder_table_modal {
    let vvf1 = Number(dataRowAC.VVF2);
    let d1 = Number(dataRowAC.descuento1);
    let d2 = Number(dataRowAC.descuento2);
    let d3 = Number(dataRowAC.descuento3);
    let d4 = Number(dataRowAC.descuento4);
    let d5 = 0;
    if (Number(dataRowAC.bonificacion) == 0 && Number(dataRowAC.compraFinal) == 0) {
      d5 = 0
    } else {
      d5 = (Number(dataRowAC.bonificacion) / (Number(dataRowAC.compraFinal) + Number(dataRowAC.bonificacion))) * 100;
    }
    let igvpro = Number(dataRowAC.igvProducto);
    let cantidad = Number(dataRowAC.compraFinal);
    let parcial = Number(dataRowAC.parcial);
    let igv = Number(dataRowAC.igv);
    let total = Number(dataRowAC.total);

    let coscom = ((((vvf1 - (vvf1 * (d1 / 100))) -
      ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) -
      (((vvf1 - (vvf1 * (d1 / 100))) - ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) * (d3 / 100))) -
      ((((vvf1 - (vvf1 * (d1 / 100))) - ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) -
        (((vvf1 - (vvf1 * (d1 / 100))) - ((vvf1 - (vvf1 * (d1 / 100))) * (d2 / 100))) * (d3 / 100))) * ((d4 + d5) / 100)));

    parcial = parseFloat(coscom.toFixed(2)) * (cantidad + Number(dataRowAC.bonificacion));
    igv = parseFloat(parcial.toFixed(2)) * (igvpro / 100);
    total = parcial + igv;
    let coscom_vvf2 = parseFloat(coscom.toFixed(2));
    let parcial_vvf2 = parseFloat(parcial.toFixed(2));
    let igv_vvf2 = parseFloat(igv.toFixed(2));
    let total_vvf2 = parseFloat(total.toFixed(2));

    return {
      item: itemValue,
      codProd: dataRowAC.codProducto,
      producto: dataRowAC.nombreProducto,
      codLab: dataRowAC.codLaboratorio,
      laboratorio: dataRowAC.nombreLaboratorio,
      EAN: '',
      cantE: Number(dataRowAC.compraFinal).toString(),
      cantF: "0",
      boni: Number(dataRowAC.bonificacion).toString(),
      vvf1: dataRowAC.VVF1,
      vvf2: dataRowAC.VVF2,
      desct1: dataRowAC.descuento1,
      desct2: dataRowAC.descuento2,
      desct3: dataRowAC.descuento3,
      desct4: dataRowAC.descuento4,
      coscom: coscom_vvf2.toString(),
      igv: igv_vvf2.toString(),
      igvpro: dataRowAC.igvProducto,
      parcial: parcial_vvf2.toString(),
      total: total_vvf2.toString(),
      pro_mes: dataRowAC.promMes,
      total_stock: dataRowAC.total,
      Observacion: dataRowAC.observaciones,
      VVF_Temp: dataRowAC.VVF1,
      asociado: dataRowAC.asociado,
      observacion_autoriza: dataRowAC.ObservacionAutoriza,
      usuario_autoriza: dataRowAC.usuarioAutoriza,
      SecOrden: nconValue,
      cantE_temp: dataRowAC.compraFinal,
      cant_Unid_empa: dataRowAC.unidadEmpaque
    }

  }

  async openModalPurchaseOrder() {
    if (this.rows.length == 0) {
      this.AlertToast("Warning: La tabla Analisis de compra no cuenta con información para procesar.", 'warning');
      return;
    }
    let dataRowPurchaseOrder: PurchaseOrder_table_modal[] = []
    let item: number = 0;
    let nCom: number = 0;
    let accion_restriccion: Number = 0;

    for (const data of this.rows) {
      if ((Number(data.compraFinal) + Number(data.bonificacion)) > 0) {
        let prom_mes: number = 0;
        if (Number(data.promMes) == 0) {
          prom_mes = 9999;
        } else {
          prom_mes = Number(data.promMes);
        }

        if (((Number(data.org) / prom_mes * 30 >= 120) || (Number(data.almacen) / prom_mes * 30 >= 45)) &&
          (accion_restriccion == 0 || accion_restriccion == 2)) {
          if (accion_restriccion == 0) {

            const modalConfirmacionClave = this.modalService.open(ConfirmacionClaveModalComponent, {
              windowClass: "modal-confirmacion-clave",
              backdrop: false,
              scrollable: true
            });

            try {
              const dataconfirm: any = await modalConfirmacionClave.result;
              accion_restriccion = dataconfirm ? 1 : 0;
              if (dataconfirm) {
                item += 1;
                if (Number(data.VVF2) > 0) {
                  let dataInsert = this.calculatevvf2_PurchaseOrder(data, item.toString(), nCom.toString());
                  dataRowPurchaseOrder.push(dataInsert);

                } else {
                  dataRowPurchaseOrder.push({
                    item: item.toString(),
                    codProd: data.codProducto,
                    producto: data.nombreProducto,
                    codLab: data.codLaboratorio,
                    laboratorio: data.codLaboratorio,
                    EAN: "",
                    cantE: data.compraFinal,
                    cantF: "0",
                    boni: data.bonificacion,
                    vvf1: data.VVF1,
                    vvf2: data.VVF2,
                    desct1: data.descuento1,
                    desct2: data.descuento2,
                    desct3: data.descuento3,
                    desct4: data.descuento4,
                    coscom: data.cosCom,
                    igv: data.igv,
                    igvpro: data.igvProducto,
                    parcial: data.parcial,
                    total: data.totalParcial,
                    pro_mes: data.promMes,
                    total_stock: data.total,
                    asociado: data.asociado,
                    VVF_Temp: data.VVF1,
                    Observacion: data.observaciones,
                    SecOrden: nCom.toString(),
                    observacion_autoriza: data.ObservacionAutoriza,
                    usuario_autoriza: data.usuarioAutoriza,
                    cantE_temp: data.compraFinal,
                    cant_Unid_empa: data.unidadEmpaque
                  });

                }
                if (item % 25 == 0) { nCom += 1 }
              }
            } catch {
              return;
            }
          }

        } else {
          item += 1;
          if (Number(data.VVF2) > 0) {
            let dataInsert = this.calculatevvf2_PurchaseOrder(data, item.toString(), nCom.toString());
            dataRowPurchaseOrder.push(dataInsert);
          } else {
            dataRowPurchaseOrder.push({
              item: item.toString(),
              codProd: data.codProducto,
              producto: data.nombreProducto,
              codLab: data.codLaboratorio,
              laboratorio: data.codLaboratorio,
              EAN: "",
              cantE: data.compraFinal,
              cantF: "0",
              boni: data.bonificacion,
              vvf1: data.VVF1,
              vvf2: data.VVF2,
              desct1: data.descuento1,
              desct2: data.descuento2,
              desct3: data.descuento3,
              desct4: data.descuento4,
              coscom: data.cosCom,
              igv: data.igv,
              igvpro: data.igvProducto,
              parcial: data.parcial,
              total: data.totalParcial,
              pro_mes: data.promMes,
              total_stock: data.total,
              asociado: data.asociado,
              VVF_Temp: data.VVF1,
              Observacion: data.observaciones,
              SecOrden: nCom.toString(),
              observacion_autoriza: data.ObservacionAutoriza,
              usuario_autoriza: data.usuarioAutoriza,
              cantE_temp: data.compraFinal,
              cant_Unid_empa: data.unidadEmpaque
            });
          }
          if (item % 25 == 0) { nCom += 1 }
        }
      }
    };

    let dataPorv = this.proveedores.find(p => p.codigoProveedor == this.proveedor);
    const modalPurchaseOrder = this.modalService.open(PurchaseOrderComponent, {
      windowClass: "modal-PurchaseOrder",
      backdrop: false,
      scrollable: true

    });

    modalPurchaseOrder.componentInstance.dataRows = dataRowPurchaseOrder;
    modalPurchaseOrder.componentInstance.scodPorv = dataPorv?.codigoProveedor;
    modalPurchaseOrder.componentInstance.sdesProv = dataPorv?.descripcion;

    let dataFilter = this.laboratorios.filter(x => x.selected == true);
    if (dataFilter.length == 1) {
      modalPurchaseOrder.componentInstance.sdesProv = dataFilter[0].codigoLab;
    } else {
      modalPurchaseOrder.componentInstance.sdesProv = "";
    }

  }

  openModalAddProduct() {
    if (this.proveedor.trim().length == 0 || this.proveedor == '0' || this.proveedor == null || this.proveedor == undefined) {
      this.AlertToast("Warning: Debe de seleccionar un proveedor.", 'warning');
      return;
    }

    if (this.laboratorios.length == 0) {
      this.AlertToast("Warning: El proveedor debe de tener al menos un laboratorio relacionado.", 'warning');
      return;
    }

    const modalAddProd = this.modalService.open(AddProductComponent, {
      windowClass: "modal-product",
      backdrop: false,
      scrollable: true
    });

    let codLab = 'x';
    modalAddProd.componentInstance.codProv = this.proveedor;
    modalAddProd.componentInstance.codLab = codLab;

    modalAddProd.closed.subscribe((response: any) => {
      this.addNewProductoList(response);
    });

  }

  showStockBotica() {
    if (this.idProductSelected.length == 0 || this.idProductSelected == '-1') {
      this.AlertToast("Warning: Debe de seleccionar el producto", 'warning');
    }

    let modalDetalleStock = this.modalService.open(DetalleStockBoticaComponent, {
      windowClass: "modal-detalleStock",
      backdrop: false,
      scrollable: true
    });

    modalDetalleStock.componentInstance.title = 'Detalle Stock Botica';
    modalDetalleStock.componentInstance.option = AppConstants.DetalleStockBotica.DETALLESTOCKBOTICA;
    modalDetalleStock.componentInstance.codPro = this.idProductSelected;

  }

  showInfraStock() {
    if (this.idProductSelected.length == 0 || this.idProductSelected == '-1') {
      this.AlertToast("Warning: Debe de seleccionar el producto", 'warning');
    }

    let modalDetalleStock = this.modalService.open(DetalleStockBoticaComponent, {
      windowClass: "modal-detalleStock",
      backdrop: false,
      scrollable: true
    });

    modalDetalleStock.componentInstance.title = 'Detalle InfraStock';
    modalDetalleStock.componentInstance.option = AppConstants.DetalleStockBotica.DETALLEINFRASTOCK;
    modalDetalleStock.componentInstance.codPro = this.idProductSelected;

  }

  showOCs() {

    let modalShowOCs = this.modalService.open(ShowOCsComponent, {
      windowClass: "modal-showOCs",
      backdrop: false,
      scrollable: true
    });

  }

  // End Modals

  //Calcular valores sobre la tabla de AC
  savePreviousValue(data: PurchaseOrder) {
    console.log('Previo');
    this.previousValueRow = {
      ABC: "",
      ObservacionAutoriza: "",
      VVF1: "",
      VVF2: "",
      almacen: "",
      asociado: "",
      bonificacion: "",
      botica: "",
      canje: "",
      clasificacion: "",
      cobOrgAct: "",
      cobOrgActCalcNoBotica: "",
      cobOrgActNoBotica: "",
      codLaboratorio: "",
      codProducto: "",
      compraFinal: "",
      condicion: "",
      cosCom: "",
      descuento1: "",
      descuento2: "",
      descuento3: "",
      descuento4: "",
      fracUnidad: "",
      igv: "",
      igvProducto: "",
      incentivo: "",
      logisticaInversa: "",
      maxBot: "",
      maxInfraStock: "",
      mesActual: "",
      mesActualProyeccion: "",
      mesCuarto: "",
      mesPrimero: "",
      mesQuinto: "",
      mesSegundo: "",
      mesTercero: "",
      nombreLaboratorio: "",
      nombreProducto: "",
      nroOC: "",
      observaciones: "",
      oc: "",
      ocVencido: "",
      ocVigente: "",
      org: "",
      orgNoBotica: "",
      parcial: "",
      plazoPago: "",
      preCompra: "",
      promMes: "",
      relacionado: "",
      secRelacion: "",
      total: "",
      totalNoBotica: "",
      totalParcial: "",
      unidadEmpaque: "",
      usuarioAutoriza: "",
      ventaSubDist: "",
      isNewRow: true,
    }
    this.previousValueRow = { ...data };
  }

  averageThreeMonth(): number {
    const hoy = new Date();
    let totalDias = 0;

    for (let i = 1; i <= 3; i++) {
      // Restamos i meses al mes actual
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);

      // Calculamos cuántos días tiene ese mes
      const diasDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
      totalDias += diasDelMes;
    }

    return totalDias / 3;
  }

  calcular_Valores_Input(nameColumn: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.inputCompraFinal = input.value.trim();
    let indexSelected = this.rows.findIndex(a => a.codProducto == this.idProductSelected.toString());
    let averageMonth = this.averageThreeMonth();
    let usuario = this.dataUsuario.usuario;

    let nCompra_Final = 0;
    let dataRequest: ICompraFinalReq = {
      codPro: this.rows[indexSelected].codProducto,
      codLab: this.rows[indexSelected].codLaboratorio,
      cant_Unid_Empa: Number(this.rows[indexSelected].unidadEmpaque),
      pre_Compra: Number(this.rows[indexSelected].preCompra),
      asociado: this.rows[indexSelected].asociado,
    }

    // validar unidad de empaque
    if (nameColumn == AppConstants.TitleTableHeadAC.CANT_UNID_EMPAQUE && (this.rows[indexSelected].unidadEmpaque.toString().length == 0 || isNaN(Number(this.rows[indexSelected].unidadEmpaque)))) {
      this.AlertToast("Warning: El valor de Unidad de empaque debe de tener información.", 'warning');
      this.rows[indexSelected].unidadEmpaque = this.previousValueRow.unidadEmpaque;
      return;
    }

    if (nameColumn == AppConstants.TitleTableHeadAC.CANT_UNID_EMPAQUE) {

      const modalConfirmacionUE = this.modalService.open(ConfirmacionModalComponent, {
        windowClass: "modal-confirmacion",
        backdrop: true,
        scrollable: true
      });

      modalConfirmacionUE.componentInstance.message = '¿Está seguro que desea actualizar la Unidad de Empaque del producto?';
      modalConfirmacionUE.closed.subscribe((confirm: any) => {
        if (!confirm) {
          this.rows[indexSelected].unidadEmpaque = this.previousValueRow.unidadEmpaque;
        } else {
          this.calcular_Desc();
          this.calculateTotal();
        }
      });
      return;
    }

    // Valida que los descuentos del 1 al 4 sean mayores de 0 y menores de 100
    if (
      Number(this.inputCompraFinal) > 0 ||
      Number(this.rows[indexSelected].bonificacion) > 0 ||
      Number(this.rows[indexSelected].VVF1) > 0 ||
      Number(this.rows[indexSelected].VVF2) > 0 ||
      Number(this.rows[indexSelected].descuento1) > 0 ||
      Number(this.rows[indexSelected].descuento2) > 0 ||
      Number(this.rows[indexSelected].descuento3) > 0 ||
      Number(this.rows[indexSelected].descuento4) > 0 ||
      Number(this.rows[indexSelected].cosCom) > 0
    ) {
      if (Number(this.rows[indexSelected].descuento1) < 0 || Number(this.rows[indexSelected].descuento1) > 100) {
        this.AlertToast("Warning: El valor de descuento 1 debe de ser mayor o igual a cero y mayor e igual a 100.", 'warning');
        this.rows[indexSelected].descuento1 = "0";
        return;
      }
      if (Number(this.rows[indexSelected].descuento2) < 0 || Number(this.rows[indexSelected].descuento2) > 100) {
        this.AlertToast("Warning: El valor de descuento 2 debe de ser mayor o igual a cero y mayor e igual a 100.", 'warning');
        this.rows[indexSelected].descuento2 = "0";
        return;
      }
      if (Number(this.rows[indexSelected].descuento3) < 0 || Number(this.rows[indexSelected].descuento3) > 100) {
        this.AlertToast("Warning: El valor de descuento 3 debe de ser mayor o igual a cero y mayor e igual a 100.", 'warning');
        this.rows[indexSelected].descuento3 = "0";
        return;
      }
      if (Number(this.rows[indexSelected].descuento4) < 0 || Number(this.rows[indexSelected].descuento4) > 100) {
        this.AlertToast("Warning: El valor de descuento 4 debe de ser mayor o igual a cero y mayor e igual a 100.", 'warning');
        this.rows[indexSelected].descuento4 = "0";
        return;
      }
    }

    this.loading = true;

    this.ordenCompraService.getCompraFinal(dataRequest).subscribe(response => {
      this.inputCompraFinal = input.value.trim();
      this.loading = false;
      nCompra_Final = response.Compra_Final;

      // Validar que catn_unidad de empaque
      if (nameColumn == AppConstants.TitleTableHeadAC.CANT_UNID_EMPAQUE && this.rows[indexSelected].unidadEmpaque.toString().length != 0) {
        if (Number(this.rows[indexSelected].unidadEmpaque) == 0) {
          this.AlertToast("Warning: El valor de Unidad de empaque no debe de tener valor de 0.", 'warning');

          this.rows[indexSelected].unidadEmpaque = '1';
          if (this.calculate_Compra_Final(nCompra_Final)) {
            this.calcular_Desc();
            this.calculateTotal();
          }
          return;
        }

        if (this.calculate_Compra_Final(nCompra_Final)) {
          this.calcular_Desc();
          this.calculateTotal();
        }
        return;
      }

      // validar Compra final

      if (nameColumn == AppConstants.TitleTableHeadAC.COMPRA_FINAL && Number(this.inputCompraFinal) != 0) {
        let nCanMaxCompra: number;
        nCanMaxCompra = ((Number(this.rows[indexSelected].promMes) / averageMonth) * 120) - (Number(this.rows[indexSelected].total) + Number(this.inputCompraFinal) + Number(this.inputCompraFinal));

        if (nCanMaxCompra < 0) {
          this.AlertToast(`Warning: Cantidad maxima de compra : ${Math.round(Number(this.rows[indexSelected].preCompra))}`, 'warning');
        } else {
          this.AlertToast(`Warning: Cantidad maxima de compra : ${Math.round(nCanMaxCompra)}`, 'warning');
        }

        if (Number(this.inputCompraFinal) != 0 && Number(this.rows[indexSelected].promMes) == 0) {
          if (usuario == 'VPAUCAR') {
            this.AlertToast(`Warning: Solo puede cambiar cantidades de Productos Preferidos`, 'warning');
            if (Number(this.rows[indexSelected]) != 0) {
              if (this.calculate_Compra_Final(nCompra_Final)) {
                this.calculateTotal();
              }
            }
            this.calculateTotal();
            return;
          } else {
            this.rows[indexSelected].ObservacionAutoriza = '';
            this.rows[indexSelected].usuarioAutoriza = usuario;
            this.calculateTotal();
            return;
          }
        }

        if (Number(this.rows[indexSelected].promMes) != 0 &&
          (((Number(this.rows[indexSelected].total) + Number(this.inputCompraFinal)) / Number(this.rows[indexSelected].promMes) * averageMonth) > 120 &&
            Number(this.inputCompraFinal) > nCompra_Final)
        ) {

          const modalConfirmacion = this.modalService.open(ConfirmacionModalComponent, {
            windowClass: "modal-confirmacion",
            backdrop: true,
            scrollable: true
          });

          modalConfirmacion.componentInstance.message = 'La compra no puede ser mayor a 4 meses de inventario.';
          modalConfirmacion.closed.subscribe((confirm: any) => {
            if (confirm) {

              let modalAutorizacion = this.modalService.open(AutorizacionModalComponent, {
                windowClass: "modal-autorizacion",
                backdrop: true,
                scrollable: true
              });

              modalAutorizacion.closed.subscribe((confirm: any) => {
                if (confirm) {
                  this.rows[indexSelected].compraFinal = input.value.trim();;
                  this.inputCompraFinal = input.value.trim();
                  this.calcular_Desc();
                  this.calculateTotal();
                } else {
                  this.inputCompraFinal = '';
                  this.inputCompraFinal = this.valueCompraFinal;
                  this.rows = this.rows.map((p: any) => p.codProducto == this.idProductSelected ? { ...p, comprafinal: this.valueCompraFinal } : p);
                }
              });
            } else {
              this.inputCompraFinal = '';
              this.inputCompraFinal = this.valueCompraFinal;
              this.rows = this.rows.map((p: any) => p.codProducto == this.idProductSelected ? { ...p, comprafinal: this.valueCompraFinal } : p);
            }

          });
        } else {
          if (usuario == "VPAUCAR") {
            this.AlertToast(`Warning: Solo puede cambiar cantidades de Productos Preferidos.`, 'warning');
            if (this.calculate_Compra_Final(nCompra_Final) == true) {
              this.calculateTotal();
            }
          } else {
            if (this.calculate_Compra_Final(nCompra_Final) == true) {
              this.calculateTotal();
            }
          }
        }
      }

    });
  }

  calculate_Compra_Final(ncompraFinal: any) {
    if (this.idProductSelected.trim() != '' || this.idProductSelected.trim().length != 0) {
      let indexSelected = this.rows.findIndex(a => a.codProducto == this.idProductSelected.toString());
      this.rows[indexSelected].compraFinal = ncompraFinal.toString();

      if (this.rows[indexSelected].asociado.length == 5 && this.rows[indexSelected].asociado != this.rows[indexSelected].codProducto) {
        this.rows.forEach(dataRow => {
          if ((this.rows[indexSelected].asociado == dataRow.codProducto) && (dataRow.asociado == this.rows[indexSelected].codProducto)) {
            dataRow.compraFinal = ncompraFinal.toString();
          }
        });
      } else {
        if (this.rows[indexSelected].asociado.length == 5 && this.rows[indexSelected].asociado != this.rows[indexSelected].codProducto) {
          this.rows.forEach(datarow => {
            if (datarow.codProducto == this.rows[indexSelected].asociado && datarow.asociado == this.rows[indexSelected].codProducto) {
              datarow.compraFinal = ncompraFinal.toString();
            }

            if (datarow.codProducto == this.rows[indexSelected].asociado && datarow.asociado == this.rows[indexSelected].codProducto) {
              datarow.compraFinal = ncompraFinal.toString();
            }

          });
        }
      }
      return true;
    }
    return false;
  }

  calcular_Desc() {
    let rowSelectData = this.rows.filter(p => p.codProducto == this.idProductSelected.toString())[0];
    let indexSelected = this.rows.findIndex(a => a.codProducto == this.idProductSelected.toString());
    let vvf: number = 0;
    let desc1: number = 0;
    let desc2: number = 0;
    let desc3: number = 0;
    let desc4: number = 0;
    let d5: number = 0;

    let coscom: number = 0;
    let igvPro: number = 0;
    let cantidad: number = 0;
    let parcial: number = 0;
    let igv: number = 0;
    let total: number = 0;
    let bonificacion: number = 0;

    if (Number(rowSelectData.VVF2) > 0) {
      vvf = Number(rowSelectData.VVF2);
    } else {
      vvf = Number(rowSelectData.VVF1);
    }

    desc1 = Number(rowSelectData.descuento1);
    desc2 = Number(rowSelectData.descuento2);
    desc3 = Number(rowSelectData.descuento3);
    desc4 = Number(rowSelectData.descuento4);
    igvPro = Number(rowSelectData.igvProducto);
    cantidad = Number(rowSelectData.compraFinal);
    parcial = Number(rowSelectData.parcial);
    igv = Number(rowSelectData.igv);
    total = Number(rowSelectData.total);
    bonificacion = Number(rowSelectData.bonificacion);

    if (Number(rowSelectData.bonificacion) == 0 && Number(rowSelectData.compraFinal) == 0) {
      d5 = 0;
    } else {
      d5 = (Number(rowSelectData.bonificacion) / (Number(rowSelectData.compraFinal) + Number(rowSelectData.bonificacion))) * 100
    }

    coscom = ((((vvf - (vvf * (desc1 / 100))) -
      ((vvf - (vvf * (desc1 / 100))) * (desc2 / 100))) -
      (((vvf - (vvf * (desc1 / 100))) - ((vvf - (vvf * (desc1 / 100))) * (desc2 / 100))) * (desc3 / 100))) -
      ((((vvf - (vvf * (desc1 / 100))) - ((vvf - (vvf * (desc1 / 100))) * (desc2 / 100))) -
        (((vvf - (vvf * (desc1 / 100))) - ((vvf - (vvf * (desc1 / 100))) * (desc2 / 100))) * (desc1 / 100))) * ((desc4 + d5) / 100)));

    parcial = coscom * (cantidad + bonificacion);
    igv = parcial * (igvPro / 100);
    total = parcial + igv;

    this.rows[indexSelected].total = total.toString();
    this.rows[indexSelected].igv = igv.toString();
    this.rows[indexSelected].parcial = parcial.toString();
    this.calculateTotal();
    this.AlertToast("Success: Se actualizo los montos.", 'success');
  }

  calcular_CosCom() {
    console.log('CALCULO COSCOM');
    let rowSelectData = this.rows.filter(p => p.codProducto == this.idProductSelected.toString())[0];
    let indexSelected = this.rows.findIndex(a => a.codProducto == this.idProductSelected.toString());
    let vvf: number = 0;
    let vvf2: number = 0;
    let desc1: number = 0;
    let desc2: number = 0;
    let desc3: number = 0;
    let desc4: number = 0;

    let coscom: number = 0;
    let igvPro: number = 0;
    let cantidad: number = 0;
    let parcial: number = 0;
    let igv: number = 0;
    let total: number = 0;
    let bonificacion: number = 0;

    vvf = Number(rowSelectData.VVF1);
    vvf2 = Number(rowSelectData.VVF2);
    desc1 = Number(rowSelectData.descuento1);
    desc2 = Number(rowSelectData.descuento2);
    desc3 = Number(rowSelectData.descuento3);
    desc4 = Number(rowSelectData.descuento4);
    igvPro = Number(rowSelectData.igvProducto);
    cantidad = Number(rowSelectData.compraFinal);
    parcial = Number(rowSelectData.parcial);
    igv = Number(rowSelectData.igv);
    total = Number(rowSelectData.total);
    bonificacion = Number(rowSelectData.bonificacion);
    coscom = Number(rowSelectData.cosCom);


    if (vvf2 > 0) {
      vvf = vvf2
    }

    desc1 = 0;
    desc2 = 0;
    desc3 = 0;
    desc4 = 0;

    desc1 = ((vvf - coscom) / vvf) * 100
    parcial = coscom * (cantidad + bonificacion);
    igv = parcial * (igvPro / 100)
    total = parcial + igv;

    this.rows[indexSelected].descuento1 = desc1.toString();
    this.rows[indexSelected].descuento2 = desc2.toString();
    this.rows[indexSelected].descuento3 = desc3.toString();
    this.rows[indexSelected].descuento4 = desc4.toString();
    this.rows[indexSelected].parcial = parcial.toString();
    this.rows[indexSelected].igv = igv.toString();
    this.rows[indexSelected].total = total.toString();
    this.calculateTotal();
    this.AlertToast("Success: Se actualizo los montos.", 'success');
  }

  // Detalle OC Anterior
  getDetalleOCAnterior() {
    if (this.ocAntrior == 0) {
      this.AlertToast("Warning: Debe de ingresar un numero de orden de compra.", 'warning');
      return;
    }

    this.loading = true;
    let dataRequest: IDetalleOCAnterior = {
      username: this.dataUsuario.usuario,
      proveedor: "prv",
      numeroOCs: [{
        key: this.ocAntrior.toString(),
        value: ''
      }]
    }
    this.ordenCompraService.getDetalleOXAnterior(dataRequest).subscribe(response => {
      this.rows = [];
      this.loading = false;

      if (response.codStatus == 1) {
        if (response.message == 'OK') {

          response.detalleProductos.forEach((data: any) => {
            this.rows.push({
              ABC: data.ABC,
              ObservacionAutoriza: data.ObservacionAutoriza,
              VVF1: Number(data.VVF1).toString(),
              VVF2: Number(data.VVF2).toString(),
              almacen: data.almacen,
              asociado: data.asociado,
              bonificacion: Number(data.bonificacion).toString(),
              botica: data.botica,
              canje: data.canje,
              clasificacion: data.clasificacion,
              cobOrgAct: data.cobOrgAct,
              cobOrgActCalcNoBotica: data.cobOrgActCalcNoBotica,
              cobOrgActNoBotica: data.cobOrgActNoBotica,
              codLaboratorio: data.codLaboratorio,
              codProducto: data.codProducto,
              compraFinal: Number(data.compraFinal).toString(),
              condicion: data.condicion,
              cosCom: Number(data.cosCom).toString(),
              descuento1: Number(data.descuento1).toString(),
              descuento2: Number(data.descuento2).toString(),
              descuento3: Number(data.descuento3).toString(),
              descuento4: Number(data.descuento4).toString(),
              fracUnidad: data.fracUnidad,
              igv: data.igv,
              igvProducto: data.igvProducto,
              incentivo: data.incentivo,
              logisticaInversa: data.logisticaInversa,
              maxBot: data.maxBot,
              maxInfraStock: data.maxInfraStock,
              mesActual: data.mesActual,
              mesActualProyeccion: data.mesActualProyeccion,
              mesCuarto: data.mesCuarto,
              mesPrimero: data.mesPrimero,
              mesQuinto: data.mesQuinto,
              mesSegundo: data.mesSegundo,
              mesTercero: data.mesTercero,
              nombreLaboratorio: data.nombreLaboratorio,
              nombreProducto: data.nombreProducto,
              nroOC: data.nroOC,
              observaciones: data.observaciones,
              oc: data.oc,
              ocVencido: data.ocVencido,
              ocVigente: data.ocVigente,
              org: data.org,
              orgNoBotica: data.orgNoBotica,
              parcial: data.parcial,
              plazoPago: data.plazoPago,
              preCompra: data.preCompra,
              promMes: data.promMes,
              relacionado: data.relacionado,
              secRelacion: data.secRelacion,
              total: data.total,
              totalNoBotica: data.totalNoBotica,
              totalParcial: data.totalParcial,
              unidadEmpaque: data.unidadEmpaque,
              usuarioAutoriza: data.usuarioAutoriza,
              ventaSubDist: data.ventaSubDist,
              isNewRow: false,
            });

            this.proveedor = response.observation;
            this.laboratorios = [];
            this.isOCAnterior = true;
            this.ocAntrior = 0;
          });
          document.getElementById('ocAnteriorBtnClose')?.click();
        } else {
          this.AlertToast("Warning: No se encontro la orden.", 'warning');
          return;
        }
      } else {
        this.AlertToast("Warning: No se encontro la orden.", 'warning');
        return;
      }

    });

  }

  //click derecho
  compraFinalcero() {
    this.rows.forEach(datarow => {
      datarow.compraFinal = "0";
    });

    this.calcular_Desc();
    this.calculateTotal();
  }

  getDescDisaggregated() {
    if (this.idProductSelected.trim().length == 0 || this.idProductSelected.trim() == '') {
      this.AlertToast("Warning: Se debe de selccionar un producto primero.", 'warning');
      return;
    }
    let indexSelect = this.rows.findIndex(p => p.codProducto == this.idProductSelected);

    this.ordenCompraService.getDescDescagregadorItem(this.idProductSelected).subscribe(response => {
      this.rows[indexSelect].descuento1 = response.dscto1;
      this.rows[indexSelect].descuento2 = response.dscto2;
      this.rows[indexSelect].descuento3 = response.dscto3;
      this.rows[indexSelect].descuento4 = response.dscto4;
      this.calcular_Desc();
      this.calculateTotal();
    });
  }

  // Export Excel
  ExportExcel() {
    let today = new Date();
    let dataExcel: any[] = [];

    const NombreArchivo = "TablaAnalisisCompra_" + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds();
    if (this.rows.length == 0) {
      this.AlertToast("La tabla Analisis de Compra no tiene información.", 'warning');
      return;
    }

    let headInfo: string[] = [];
    this.headTableAnalisisCompra.forEach(dataHeader => {
      headInfo.push(dataHeader.description);
    });

    dataExcel.push(headInfo);

    this.rows.forEach(dataBody => {
      dataExcel.push([dataBody.codProducto,
      dataBody.nombreProducto,
      dataBody.nombreLaboratorio,
      dataBody.unidadEmpaque,
      this.getNameCondicion(dataBody.condicion),
      dataBody.ABC,
      dataBody.mesQuinto,
      dataBody.mesCuarto,
      dataBody.mesTercero,
      dataBody.mesSegundo,
      dataBody.mesPrimero,
      dataBody.mesActual,
      dataBody.mesActualProyeccion,
      dataBody.promMes,
      dataBody.preCompra,
      dataBody.compraFinal,
      dataBody.bonificacion,
      dataBody.almacen,
      dataBody.org,
      dataBody.canje,
      dataBody.logisticaInversa,
      dataBody.oc,
      dataBody.cobOrgAct,
      dataBody.maxInfraStock,
      dataBody.VVF1,
      dataBody.VVF2,
      dataBody.descuento1,
      dataBody.descuento2,
      dataBody.descuento3,
      dataBody.descuento4,
      dataBody.cosCom,
      dataBody.parcial,
      dataBody.igv,
      dataBody.total,
      dataBody.observaciones
      ]);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, NombreArchivo + '.xlsx');
  }

  ExportExcel_UC() {
    let today = new Date();
    let dataExcel: any[] = [];

    const NombreArchivo = "TablaUltimaCompra_" + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds();
    if (this.rowsUCompras.length == 0) {
      this.AlertToast("La tabla Ultimas de Compra no tiene información.", 'warning');
      return;
    }

    let headInfo: string[] = [];
    this.headTableUltimasCompras.forEach(dataHeader => {
      headInfo.push(dataHeader);
    });

    dataExcel.push(headInfo);

    this.rowsUCompras.forEach(data => {
      dataExcel.push(
        [
          data.nombreProveedor,
          data.orden,
          data.fecha,
          data.cantE,
          data.cantF,
          data.vvf,
          data.dscto1,
          data.dscto2,
          data.dscto3,
          data.dscto4,
          data.bonificacion
        ]
      );
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, NombreArchivo + '.xlsx');

  }

  ExportExcel_UI() {
    let today = new Date();
    let dataExcel: any[] = [];

    const NombreArchivo = "TablaUltimaIngresos_" + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds();
    console.log(this.rowsUIngresos.length);
    if (this.rowsUIngresos.length == 0) {
      this.AlertToast("La tabla Ultimas de Ingreso no tiene información.", 'warning');
      return;
    }

    let headInfo: string[] = [];
    this.headTableUltimosIngresos.forEach(dataHeader => {
      headInfo.push(dataHeader);
    });

    dataExcel.push(headInfo);

    this.rowsUIngresos.forEach(data => {
      dataExcel.push(
        [
          data.invNum,
          data.nombreProveedor,
          data.documento,
          data.fechaIngreso,
          data.ordenCompra,
          data.cantE,
          data.cantF,
          data.VVF,
          data.dscto1,
          data.dscto2,
          data.dscto3,
          data.dscto4,
          data.bonificacion,
        ]
      );
    });
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, NombreArchivo + '.xlsx');

  }

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }


}
