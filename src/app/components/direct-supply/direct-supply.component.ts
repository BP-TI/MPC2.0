import { Component,ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AppConstants } from '../../shared/constants/app.constants';
import { IUltimasComprasAbadiReq,PurchaseOrderAbadi } from '../../models/ordenCompra';
import { Laboratorios, Proveedores, Boticas, Condiciones } from '../../models/parametros';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HeadTableAC } from '../../models/ordenCompra';
import { DirectSupplyService } from '../../services/DirectSupply/directSupply.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenCompraAbadiService } from '../../services/DirectSupply/ordenCompraAbadi.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import { GlobalService } from '../../shared/services/global.service';
import { ShowSubstitutesAbadiComponent } from '../show-substitutesAbadi/show-substitutesAbadi.component';
import { AddProductAbadiComponent } from '../add-product-abadi/add-productAbadi.component';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../shared/models/option-click';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-direct-supply',
  standalone: false,
  templateUrl: './direct-supply.component.html',
  styleUrls: ['./direct-supply.component.css'],
})
export class DirectSupplyComponent implements OnInit {

  showFilters: boolean = false;
  filteredRows: any[] = [];
  filters: { [key: string]: any } = {};

  title: string = "";
  agencyCode: string = sessionStorage.getItem(AppConstants.Session.AGENCYCODE) ?? "";
  agencyName: string = sessionStorage.getItem(AppConstants.Session.AGENCYNAME) ?? "";
  usersessionId: string = sessionStorage.getItem(AppConstants.Session.USERID) ?? "";
  channelName: string = sessionStorage.getItem(AppConstants.Session.SALES_CHANNEL_DESCRIPTION) ?? "";

  titulo = "Planificacion de Compra Directa a Boticas";
  rows: PurchaseOrderAbadi[] = [];
  headTableAnalisisCompra: HeadTableAC[] = []
   deleteColumnAC: HeadTableAC[] = [];
  headTableUltimasCompras: string[] = []
  headTableUltimosIngresos: string[] = [] 
  rowsLb: any[];
  rowsUCompras: any[];
  rowsUIngresos: any[];
  rowsDataTotal: any[];
  conscom: any = undefined;
  conscomImpto: any = undefined;
  loading: boolean = false;
  columns: any = [];
  columnasLb: any = [];
  tipoDocumento: string = "1";
  nombres: string = "";
  nroDocumento: string;
  proveedores: Proveedores[];
  laboratorios: Laboratorios[];
  boticas: Boticas[];
  loadingIndicator: boolean = false;
  currentFilter: string = "active";
  idProductSelected: Number = 0;
  condiciones: Condiciones[] = [];
  totalWidth = 0;
  totalParcial: number = 0;
  totalIGV: number = 0;
  totalPagar: number = 0;
  isHovering: boolean = false;
  isRowHover: Number = -1;
  isRowSelected: Number = -1;
  validaCorreo: boolean = false;
  showFilterTable: boolean = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';
  tableSelectedExcel: string = '';

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
    public global: GlobalService,
  private el: ElementRef) { }


  ngOnInit() {
    this.addHeadeTable();
    this.cargarProveedores();
    this.crearGrupoChecks();
    this.global.setGlobalVar('Módulo Abastecimiento Directo');
  }

  
    ngAfterViewInit() {
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
    this.clearDataTablesSecond();
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
    this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
    this.conscomImpto = undefined;
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
    this.rowsDataTotal = [];
    this.clearDataTablesSecond();

    let labChecks = this.laboratorios?.filter(p => p.selected === true) || [];
    if (labChecks.length === 0) {
      this.loading = false;
      this.AlertToast(`Advertencia: Debes seleccionar al menos un laboratorio para continuar.`, 'warning')
      return;
    }
     let BotChecks = this.boticas?.filter(p => p.selected === true) || [];
    if (BotChecks.length === 0) {
      this.loading = false;
      this.AlertToast(`Advertencia: Debes seleccionar al menos una botica para continuar.`, 'warning')
      return;
    }
    let cadenaLab = labChecks.map(p => p.codigoLab).join(',');
    let cadenaBot = BotChecks.map(p => p.codAlmacen).join(',');

    this.ordenCompraService.getCalularCompra(this.proveedor, cadenaLab, "","",cadenaBot).subscribe(
      (response) => {
        this.loading = false;
        if (response == null) {
          this.AlertToast(`Información: No se encontraron registros.`, 'info');

        } else {
          if (response.codStatus === 1) {
            if (response.message === "OK") {
              response.detalleProductos.forEach((data: any) => {
                this.rows.push({
                    relacionado:data.relacionado,
                    incentivo: data.incentivo,
                    codProducto:data.codProducto,
                    nombreProducto:data.nombreProducto,
                    codLaboratorio:data.codLaboratorio,
                    nombreLaboratorio:data.nombreLaboratorio,
                    codigoAlmacen:data.codigoAlmacen,
                    establecimiento:data.establecimiento,
                    fracUnidad:data.fracUnidad,
                    unidadEmpaque:data.unidadEmpaque,
                    condicion:data.condicion,
                    clasificacion:data.clasificacion,
                    ABC:data.ABC,
                    plazoPago:data.plazoPago,
                    mesQuinto:data.mesQuinto,
                    mesCuarto:data.mesCuarto,
                    mesTercero:data.mesTercero,
                    mesSegundo:data.mesSegundo,
                    mesPrimero:data.mesPrimero,
                    mesActual:data.mesActual,
                    mesActualProyeccion:data.mesActualProyeccion,
                    promMes:data.promMes,
                    preCompra:data.preCompra,
                    compraFinal:data.compraFinal,
                    bonificacion:data.bonificacion,
                    botica:data.botica,
                    almacen:data.almacen,
                    org:data.org,
                    canje:data.canje,
                    ocVigente:data.ocVigente,
                    ocVencido:data.ocVencido,
                    oc:data.oc,
                    total:data.total,
                    cobOrgAct: data.cobOrgAct,
                    maxBot:data.maxBot,
                    maxInfraStock:data.maxInfraStock,
                    asociado:data.asociado,
                    nroOC:data.nroOC,
                    secRelacion: data.secRelacion,
                    usuarioAutoriza: data.usuarioAutoriza,
                    ObservacionAutoriza: data.ObservacionAutoriza,
                    ventaSubDist: data.ventaSubDist,
                    orgNoBotica: data.orgNoBotica,
                    totalNoBotica: data.totalNoBotica,
                    cobOrgActNoBotica: data.cobOrgActNoBotica,
                    cobOrgActCalcNoBotica: data.cobOrgActCalcNoBotica,
                    observaciones: data.observaciones,
                    observacionesAbadi: data.observacionesAbadi,
                    isNewRow: false,
                })
              })
              this.rows = response.detalleProductos;
              this.rowsDataTotal = response.detalleProductos;
              this.createMenuListHeaderAC();
            } else {
              this.AlertToast(`Información: ${response.message}`, 'info');
            }
            this.calculateTotal();
          } else {
            this.AlertToast(`Atención: ${response.message}`, 'warning');
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

  openContextExcel(event: MouseEvent, opcionMenu: number, tabla: string = '') {
    event.preventDefault();
    this.tableSelectedExcel = tabla;
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
  }

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
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
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
      case 'O-ZA':
        this.getACOrderZA()
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
    }
  }

  // tabla

  addHeadeTable() {
    this.headTableAnalisisCompra = [
      {description: AppConstants.TitleTableHeadACAbadi.R,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.COD_PROD,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.DESCRIPCION,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.LABORATORIO,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.ESTABLECIMIENTO,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.CANT_UNID_EMPAQUE,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.CONDICION,check:true},
      {description: this.showMonth('mesquinto'),check:true},
      {description: this.showMonth('mescuarto'),check:true},
      {description: this.showMonth('mestercero'),check:true},
      {description: this.showMonth('messegundo'),check:true},
      {description: this.showMonth('mesprimero'),check:true},
      {description: this.showMonth('mesActual'),check:true},
      {description: this.showMonth('mesProyectado'),check:true},
      {description: AppConstants.TitleTableHeadACAbadi.PROM_MES,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.PRE_COMPRA,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.COMPRA_FINAL,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.BONIFICADO,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.BOTICA,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.OCVIGENTE,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.OCVENCIDA,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.OC,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.BOTICAOC,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.COBERTURA_BOTICA,check:true},
      {description: AppConstants.TitleTableHeadACAbadi.OBSERVACION,check:true},
    ];
    this.deleteColumnAC = this.headTableAnalisisCompra;

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
      if (this.isRowHover == this.isRowSelected) {
        return;
      }
  
      //this.loading = true;
      this.rowsUCompras = [];
      this.rowsUIngresos = [];
      this.conscom = undefined;
      this.conscomImpto = undefined;
  
      let dataUsuario = this.global.getDataUserLogin();
  
      let dataRequets: IUltimasComprasAbadiReq = {
        codProveedor: this.proveedor,
        codLab: data.codLaboratorio,
        codProducto: data.codProducto,
        usuarioLogin: dataUsuario.usuario,
        codigoAlmacen: data.codigoAlmacen,
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

     addNewProductoList(dataProduct: any) {
    let newData: any = {
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
      unidadEmpaque: "6",
      usuarioAutoriza: "",
      ventaSubDist: "0",
    }

    this.rows.push(newData);
  }

  deleteProductList() {
    if (!confirm('¿Estás seguro de continuar?')) {
      return;
    }

    if (this.isRowSelected != -1) {
      let data = this.rows.filter((p: any) => p.codProducto == this.idProductSelected);
      this.rows = this.rows.filter((p: any) => p != data);
    } else {
      this.AlertToast("Warning: Debe de seleccionar el producto primero.", 'warning');
    }
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
    
        // Produccto
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
    
      updateFilterHeader() {
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

    openModalSubstitutes() {
      if (this.isRowSelected != -1) {
        const modalSUbs = this.modalService.open(ShowSubstitutesAbadiComponent, {
          windowClass: "modal-Substitutes",
          centered: true,
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
  
    openModalAddProduct() {
      if (this.proveedor.trim().length == 0 || this.proveedor == '0' || this.proveedor == null || this.proveedor == undefined) {
        this.AlertToast("Warning: Debe de seleccionar un proveedor.", 'warning');
        return;
      }
  
      if (this.laboratorios.length == 0) {
        this.AlertToast("Warning: El proveedor debe de tener al menos un laboratorio relacionado.", 'warning');
        return;
      }
  
      const modalAddProd = this.modalService.open(AddProductAbadiComponent, {
        windowClass: "modal-product",
        keyboard: true,
        backdrop: false,
        backdropClass: 'modal-backdrop',
        
      });
      
      let codLab = 'x';
      modalAddProd.componentInstance.codProv = this.proveedor;
      modalAddProd.componentInstance.codLab = codLab;
       modalAddProd.componentInstance.boticas = this.boticas;
      modalAddProd.closed.subscribe((response: any) => {
        this.addNewProductoList(response);
      });
  
    }
  // End hover tabla Analisis Compra
    AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
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
            dataExcel.push([
            dataBody.relacionado,
            dataBody.codProducto,
            dataBody.nombreProducto,
            dataBody.nombreLaboratorio,
            dataBody.establecimiento,
            dataBody.unidadEmpaque,
            dataBody.condicion,
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
            dataBody.botica,
            dataBody.ocVigente,
            dataBody.ocVencido,
            dataBody.oc,
            dataBody.total,
            dataBody.cobOrgAct,
            dataBody.observacionesAbadi
            ]);
          });
      
          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExcel);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      
          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(dataBlob, NombreArchivo + '.xlsx');
        }

}
