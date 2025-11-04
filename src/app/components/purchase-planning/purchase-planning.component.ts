import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Laboratorios, Proveedores, Condiciones } from '../../models/parametros';
import { IUltimasComprasReq } from '../../models/ordenCompra';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse, JsonpClientBackend } from '@angular/common/http';
import { GlobalService } from '../../shared/services/global.service';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OptionsCLickHeadMenuAC, OptionsClickHeadMenuAC2 } from '../../shared/models/option-click';

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

  headTableAnalisisCompra: string[] = []
  headTableUltimasCompras: string[] = []
  headTableUltimosIngresos: string[] = []
  rows: any = [];
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

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error2' | 'info' | 'warning' = 'info';


  @ViewChild("actionTemplate") actionTemplate: TemplateRef<any>;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;

  constructor(private fb: FormBuilder,
    private purchaseService: PurchasePlanningService,
    private ordenCompraService: OrdenCompraService,
    private modalService: NgbModal,
    public global: GlobalService,
    private el: ElementRef) { }


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
    console.log(action);
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
      case 'O-AZ':
        this.getACOrderAZ();
        break;
      case 'O-ZA':
        this.getACOrderZA()
        break;

    }
  }

  // ------ * -----


  addHeadeTable() {
    this.headTableAnalisisCompra = [
      'cod.',
      'Descripción',
      'Labora.',
      'Cant. Unid. Empaque',
      'Condición',
      'Tipo',
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
      'Almacén',
      'Organización',
      'Canje',
      'logis_inver',
      'O/C',
      'Cobertura Organizacional',
      'Maximo Infrastock',
      'V.V.F',
      'V.V.F Nuevo',
      'Dsct.1',
      'Dsct.2',
      'Dsct.3',
      'Dsct.4',
      'CosCom',
      'Parcial',
      'Igv',
      'Total',
      'Observación',
    ];

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

  deleteColumn(headColumna: string, nombreTabla: string, event: Event) {

    let tabla: any = document.getElementById(nombreTabla);
    let row = tabla.rows;
    let idColumna: number = 99999;
    let isChecked = (event.target as HTMLInputElement).checked;

    for (let i = 0; i < row.length; i++) {
      let celdas = row[i].cells;
      for (let j = 0; j < celdas.length; j++) {
        if (headColumna.trim() === celdas[j].innerText.trim()) {
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
            celdas[j].setAttribute("style", "display: none; !important");

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

  getNameCondicion(cod: string): string {
    let filtrado = this.condiciones.find(condicion =>
      condicion.codigoCondicion.toString().trim() == cod.trim()
    );
    return filtrado ? filtrado.descripcion : '';
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
    this.contextMenu.menuLisCompraFinal = menuOption;
  }

  getACOrderAZ() {
    if ( this.contextMenu.filterColumn == 'Descripción') {
      this.rows.sort((a: any, b: any) =>
        a.nombreProducto.toString().trim().localeCompare(b.nombreProducto).toString().trim()
      );
    }

    if ( this.contextMenu.filterColumn == 'Tipo') {
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
    this.contextMenu.dataFilter = [];
    dataFilter.forEach(element => {
      this.contextMenu.dataFilter.push({
        codProducto: element.codProducto,
        description: element.nombreProducto,
        laboratorio: element.nombreLaboratorio,
        compraFinal: Number(element.compraFinal),
        tipo: element.ABC,
        check: true,
      });
    });

    this.calculateTotal();
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
  // End hover tabla Analisis Compra

  AlertToast(message: string, type: 'success' | 'error2' | 'info' | 'warning' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 5000);
  }

}
