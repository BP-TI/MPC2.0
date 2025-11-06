import { Component, EventEmitter,ElementRef, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConstants } from '../../shared/constants/app.constants';
import { IUltimasComprasAbadiReq } from '../../models/ordenCompra';
import { ReporteProductosCompra } from '../../models/ordenCompra';
import { Laboratorios, Proveedores, Boticas, Condiciones } from '../../models/parametros';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DirectSupplyService } from '../../services/DirectSupply/directSupply.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OrdenCompraAbadiService } from '../../services/DirectSupply/ordenCompraAbadi.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import { GlobalService } from '../../shared/services/global.service';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../shared/models/option-click';
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
  headTableUltimasCompras: string[] = []
  headTableUltimosIngresos: string[] = []
   deleteColumnAC: string[] = [];  
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
    this.cargarProveedores();
    this.crearGrupoChecks();
    this.addHeadeTable();
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
              this.rows = response.detalleProductos;
            } else {
              this.AlertToast(`Información: ${response.message}`, 'info');
            }
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


  handleMenuAction(action: string) {
    switch (action) {
      case 'view':
        this.modalService.open(this.verSustitutosModal, { size: 'xl', centered: true, backdrop: false, scrollable: true });

        break;

      case 'filters':
         console.log('Entro');
        this.showFilterTable = !this.showFilterTable;
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
      AppConstants.TitleTableHeadACAbadi.R,
      AppConstants.TitleTableHeadACAbadi.COD_PROD,
      AppConstants.TitleTableHeadACAbadi.DESCRIPCION,
      AppConstants.TitleTableHeadACAbadi.LABORATORIO,
      AppConstants.TitleTableHeadACAbadi.ESTABLECIMIENTO,
      AppConstants.TitleTableHeadACAbadi.CANT_UNID_EMPAQUE,
      AppConstants.TitleTableHeadACAbadi.CONDICION,
      this.showMonth('mesquinto'),
      this.showMonth('mescuarto'),
      this.showMonth('mestercero'),
      this.showMonth('messegundo'),
      this.showMonth('mesprimero'),
      this.showMonth('mesActual'),
      this.showMonth('mesProyectado'),
      AppConstants.TitleTableHeadACAbadi.PROM_MES,
      AppConstants.TitleTableHeadACAbadi.PRE_COMPRA,
      AppConstants.TitleTableHeadACAbadi.COMPRA_FINAL,
      AppConstants.TitleTableHeadACAbadi.BONIFICADO,
      AppConstants.TitleTableHeadACAbadi.OCVIGENTE,
      AppConstants.TitleTableHeadACAbadi.OCVENCIDA,
      AppConstants.TitleTableHeadACAbadi.OC,
      AppConstants.TitleTableHeadACAbadi.BOTICAOC,
      AppConstants.TitleTableHeadACAbadi.COBERTURA_BOTICA,
      AppConstants.TitleTableHeadACAbadi.OBSERVACION,
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

    showColumn(headColumn: string) {
    if (this.deleteColumnAC.find(p => p == headColumn)) {
      return true;
    } else {
      return false;
    }
  }
  deleteColumn(headColumna: string, event: Event) {
    let isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.deleteColumnAC.push(headColumna);
    } else {
      this.deleteColumnAC = this.deleteColumnAC.filter(p => p != headColumna);
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
    AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }

}
