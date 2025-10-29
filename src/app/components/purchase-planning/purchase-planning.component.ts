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
// import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
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

  headTableAnalisisCompra: string[] = []
  headTableUltimasCompras: string[] = []
  headTableUltimosIngresos: string[] = []
  rows: any = [];
  rowsLb: any[];
  rowsUCompras: any[];
  rowsUIngresos: any[];
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

  @ViewChild("actionTemplate") actionTemplate: TemplateRef<any>;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;


  constructor(private fb: FormBuilder,
    private purchaseService: PurchasePlanningService,
    private ordenCompraService: OrdenCompraService,
    private modalService: NgbModal,
    public global: GlobalService) { }


  ngOnInit() {
    this.addHeadeTable();
    this.cargarProveedores();
    this.crearGrupoChecks();
    this.global.setGlobalVar('Módulo planificación de compra');
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
    this.laboratorios = [];
    this.clearField();

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
            this.calculateTotal();
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

  getTableUltimasCompras(data: any) {
    this.loading = true;
    this.rowsUCompras = [];
    this.rowsUIngresos = [];
    this.conscom = undefined;
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
      this.loading = false;
    }, (error: HttpErrorResponse) => {
      this.loading = false;
    });

  }

  openContextMenu(event: MouseEvent, opcionMenu: number) {
    event.preventDefault();
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
    this.opcionesForm.get('todos')?.disable();
    this.totalIGV = 0;
    this.totalPagar = 0;
    this.totalParcial = 0;
  }

  calculateTotal() {
    let sumaParcial: number = 0;
    let sumaIGV: number = 0;
    let sumaPagar: number = 0;

    this.rows.forEach((data: any) => {
      if (parseFloat(data.promMes) > 0) {
        sumaParcial += parseFloat(data.parcial);
        sumaIGV += parseFloat(data.igv);
        sumaPagar += parseFloat(data.total);
      }
    });

    this.totalParcial = sumaParcial;
    this.totalIGV = sumaIGV;
    this.totalPagar = sumaPagar;
  }

}
