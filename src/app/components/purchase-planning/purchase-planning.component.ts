import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Laboratorios, Proveedores, Condiciones } from '../../models/parametros';
import { IAdicionarProductoCalculoReq, IUltimasComprasReq, PurchaseOrder } from '../../models/ordenCompra';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from '../../shared/services/global.service';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../shared/models/option-click';
import { AppConstants } from '../../shared/constants/app.constants';
import { AgentOutlook } from '../../shared/models/agentOutlook';
import { AlertMail } from '../../shared/services/alert-mail';
import { ShowSubstitutesComponent } from '../show-substitutes/show-substitutes.component';
import { AddProductComponent } from '../add-product/add-product.component';
import { InventoryPolicyComponent } from '../inventory-policy/inventory-policy.component';
import { HeadTableAC } from '../../models/ordenCompra';
import { PurchaseOrderComponent } from '../purchase-order/purchase-order.component';
import { ConfirmacionModalComponent } from '../../modales/confirmacionModal/confirmacionModal.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-purchase-planning',
  standalone: false,
  templateUrl: './purchase-planning.component.html',
  styleUrls: ['./purchase-planning.component.css'],
})
export class PurchasePlanningComponent implements OnInit, AfterViewInit {

  @ViewChild('verSustitutosModal') verSustitutosModal: any;

  sustitutos = [
    { codpro: 'P001', despro: 'Paracetamol 500mg', prisal: 1.2, stk_alm: 50, stk_alm_m: 10, codlab: 'LAB01', ubipro: 'A1', codgen: 'GEN01', moncod: 'PEN', stkfra: 5, codlam: 'L001', dtoprox: '10%', categvta: 'A' },
    { codpro: 'P002', despro: 'Ibuprofeno 400mg', prisal: 2.5, stk_alm: 40, stk_alm_m: 15, codlab: 'LAB02', ubipro: 'B2', codgen: 'GEN02', moncod: 'PEN', stkfra: 8, codlam: 'L002', dtoprox: '5%', categvta: 'B' },
  ];

  showFilters: boolean = false;
  filteredRows: any[] = [];
  filters: { [key: string]: any } = {};

  // headTableAnalisisCompra: string[] = []
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
  idProductSelected: Number = 0;
  deleteColumnAC: HeadTableAC[] = [];
  showFilterTable: boolean = false;

  showToast = false;
  toastMessage = '';
  idCondicion = "";
  idProducto = "";
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';
  idCondicionCbo = "";
  valorAnterior = "";


  @ViewChild("actionTemplate") actionTemplate: TemplateRef<any>;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;

  constructor(private fb: FormBuilder,
    private purchaseService: PurchasePlanningService,
    private ordenCompraService: OrdenCompraService,
    private modalService: NgbModal,
    public global: GlobalService,
    private el: ElementRef,
    private alertMail: AlertMail) { }


  ngOnInit() {
    this.addHeadeTable();
    this.cargarProveedores();
    this.getCondiciones();
    this.global.setGlobalVar('Módulo planificación de compra');

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
                  VVF1: data.VVF1,
                  VVF2: data.VVF2,
                  almacen: data.almacen,
                  asociado: data.asociado,
                  bonificacion: data.bonificacion,
                  botica: data.botica,
                  canje: data.canje,
                  clasificacion: data.clasificacion,
                  cobOrgAct: data.cobOrgAct,
                  cobOrgActCalcNoBotica: data.cobOrgActCalcNoBotica,
                  cobOrgActNoBotica: data.cobOrgActNoBotica,
                  codLaboratorio: data.codLaboratorio,
                  codProducto: data.codProducto,
                  compraFinal: data.compraFinal,
                  condicion: data.condicion,
                  cosCom: data.cosCom,
                  descuento1: data.descuento1,
                  descuento2: data.descuento2,
                  descuento3: data.descuento3,
                  descuento4: data.descuento4,
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
                  isNewRow: false
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
        case'excel':
        this.ExportExcel();
        break;
      case 'O-ZA':
        this.getACOrderZA()
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

    this.deleteColumnAC = this.headTableAnalisisCompra;

    this.headTableUltimasCompras = [
      'Proveedor',
      ' S - Orden',
      ' Fecha',
      ' Cant.-E',
      ' Cant.- F',
      ' V.V.F',
      ' Dscto1(%)',
      ' Dscto2(%)',
      ' Dscto3(%)',
      ' Dscto4(%)',
      ' Boni',
    ];

    this.headTableUltimosIngresos = [
      'Invnum',
      'Proveedor',
      'Documento',
      'Fecha de ingreso',
      'Orden de Compra',
      'Cant.-E',
      'Cant.-F',
      'V.V.F',
      'Dsct1(%)',
      'Dsct2(%)',
      'Dsct3(%)',
      'Dsct4(%)',
      'Boni',
    ];
  }

  deleteColumn(headColumna: HeadTableAC) {
    headColumna.check = !headColumna.check;
    if (headColumna.check) {
      this.deleteColumnAC.push(headColumna);
    } else {
      this.deleteColumnAC = this.deleteColumnAC.filter(p => p.check);
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

  getTableUltimasCompras(data: any) {
    this.idCondicion = data.condicion;
    this.idProducto = data.codProducto;
    if (this.isRowHover == this.isRowSelected) {
      return;
    }

    //this.loading = true;
    this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
    this.conscomImpto = undefined;

    let dataUsuario = this.global.getDataUserLogin();

    let dataRequets: IUltimasComprasReq = {
      codProveedor: this.proveedor,
      codLab: data.codLaboratorio,
      codProducto: data.codProducto,
      usuarioLogin: dataUsuario.usuario,
      codUsuario: Number(dataUsuario.codigoUsuario)
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

  openContextMenu(event: MouseEvent, opcionMenu: number, headerColumnAC: string = '') {
    event.preventDefault();
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
    this.idProductSelected = 0;
  }

  clearDataTablesSecond() {
    this.isRowSelected = -1;
    this.idProductSelected = 0;
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
        this.condiciones = response;
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
            newData.unidadEmpaque = response.detalleProductos[0].unidadEmpaque;
            newData.condicion = response.detalleProductos[0].condicion;
            newData.clasificacion = response.detalleProductos[0].clasificacion;
            newData.ABC = response.detalleProductos[0].ABC;
            newData.plazoPago = response.detalleProductos[0].plazoPago;
            newData.mesQuinto = response.detalleProductos[0].mesQuinto;
            newData.mesCuarto = response.detalleProductos[0].mesCuarto;
            newData.mesTercero = response.detalleProductos[0].mesTercero;
            newData.mesSegundo = response.detalleProductos[0].mesSegundo;
            newData.mesPrimero = response.detalleProductos[0].mesPrimero;
            newData.mesActual = response.detalleProductos[0].mesActual;
            newData.mesActualProyeccion = response.detalleProductos[0].mesActualProyeccion;
            newData.promMes = response.detalleProductos[0].promMes;
            newData.preCompra = response.detalleProductos[0].preCompra;
            newData.compraFinal = response.detalleProductos[0].compraFinal;
            newData.bonificacion = response.detalleProductos[0].bonificacion;
            newData.botica = response.detalleProductos[0].botica;
            newData.almacen = response.detalleProductos[0].almacen;
            newData.org = response.detalleProductos[0].org;
            newData.canje = response.detalleProductos[0].canje;
            newData.logisticaInversa = response.detalleProductos[0].logisticaInversa;
            newData.ocVigente = response.detalleProductos[0].ocVigente;
            newData.ocVencido = response.detalleProductos[0].ocVencido;
            newData.oc = response.detalleProductos[0].oc;
            newData.total = response.detalleProductos[0].total;
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

  updateFilterHeader(event: any,codigo:any) {    
    if(event.target.id.includes("idCondicionCbo")){
      const nuevoValor = event.target.value;
      const confirmar = confirm(`¿Deseas cambiar de opción en el campo de comisión`);
      
      if (confirmar) {        
        this.idCondicionCbo = nuevoValor;
        this.rows = this.rows.map((p:any )=> p.codProducto == codigo ? { ...p, condicion: this.idCondicionCbo } : p);
      } else { 
        this.idCondicionCbo = "";       
        this.idCondicionCbo = this.idCondicion;   
        this.rows = this.rows.map((p:any )=> p.codProducto == codigo ? { ...p, condicion: this.idCondicion } : p);
      }
    }
    this.createMenuListHeaderAC();
  }


  // hover tabla Analisis Compra
  onRowHover(index: number) {
    this.isRowHover = index;
  }

  siRowSelectedHover(index: number, codProduct: string) {
    let rowStyle = 'background-white-fixed-column';

    if (this.isRowSelected == index) {
      rowStyle = 'background-selected-column';
      this.idProductSelected = Number(codProduct);
      this.idCondicionCbo = this.rows.find((p:any) => p.codProducto == codProduct)?.condicion ?? '';
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

  openModalPurchaseOrder() {
    const modalPurchaseOrder = this.modalService.open(PurchaseOrderComponent, {
      windowClass: "modal-PurchaseOrder",
      backdrop: true,
      scrollable: true
    });
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

  // calcular columnas
  calcular_Valores_Input(nameColumn: string) {

    let indexSelected = this.rows.findIndex(a => a.codProducto == this.idProductSelected.toString());
    let averageMonth = this.averageThreeMonth();
    let usuario = '';
    let nCompra_Final = 0; //ACA debo de obtener el valor de la compra final desde el SP

    if (
      Number(this.rows[indexSelected].promMes) != 0 &&
      (((Number(this.rows[indexSelected].total) + Number(this.rows[indexSelected].compraFinal)) / Number(this.rows[indexSelected].promMes) * (averageMonth / 3)) > 120) &&
      Number(this.rows[indexSelected].compraFinal) > nCompra_Final
    ) {
      //--------
      if (!confirm('La compra no puede ser mayor a 4 meses de inventario.¿Desea que de todas formas se aumente el pedido?')) {
        if (usuario = "VPAUCAR") {
          this.AlertToast("Solo puede cambiar cantidades de Productos Preferidos.", 'warning');
        } else {
          this.rows[indexSelected].observaciones = "";
          this.rows[indexSelected].usuarioAutoriza = usuario;

        }
      }
    }

    if (nameColumn == AppConstants.TitleTableHeadAC.VVFNUEVO
      || nameColumn == AppConstants.TitleTableHeadAC.DESC1
      || nameColumn == AppConstants.TitleTableHeadAC.DESC2
      || nameColumn == AppConstants.TitleTableHeadAC.DESC3
      || nameColumn == AppConstants.TitleTableHeadAC.DESC4
      || nameColumn == AppConstants.TitleTableHeadAC.COMPRA_FINAL
      || nameColumn == AppConstants.TitleTableHeadAC.BONIFICADO
    ) {
      this.calcular_Desc();
    }

    if (nameColumn == AppConstants.TitleTableHeadAC.COSCON) {
      this.calcular_CosCom();
    }

  }

  validateCalculateColumn() {
    let ncompraFinal = 0; //ACA debo de obtener el valor de la compra final desde el SP
    let indexSelected = this.rows.findIndex(a => a.codProducto == this.idProductSelected.toString());

    if (ncompraFinal > 0) {
      if (this.rows[indexSelected].asociado.length == 5 && (this.rows[indexSelected].asociado) != this.rows[indexSelected].codProducto) {

        this.rows.forEach(data => {
          if (data.codProducto == this.rows[indexSelected].asociado) {
            data.compraFinal = ncompraFinal.toString();
          }



        });

      }
    }
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

  // End Modals

  // Export Excel
  ExportExcel() {
    let today = new Date();
    let dataExcel: any[] = [];

    const NombreArchivo = "TablaAnalisisCompra_" + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes() + today.getSeconds();
    if (this.rows.length < 0) {
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

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }


}
