import { Component, ElementRef, HostListener, Input, input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AgentOutlook } from '../../shared/models/agentOutlook';
import { AlertMail } from '../../shared/services/alert-mail';
import { NgbActiveModal, NgbCalendar, NgbDateAdapter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { dataDirectionOC, IAdicionarProductoCalculo2Req, IAdicionarProductoCalculoReq, ICompraFinalReq, ICondicionesPago, ICondicionesPagoResp, IDataPorduct, IGenerarOrdenCompra, IGetPDFZip, IKeyValue, PurchaseOrder_table_modal } from '../../models/ordenCompra';
import { OrdenCompraService } from '../../services/PurchasePlanning/ordenCompra.service';
import { AppConstants } from '../../shared/constants/app.constants';
import { GlobalService } from '../../shared/services/global.service';
import { UserDataLogin } from '../../models/persona';
import { OptionClickComponent } from '../../shared/components/option-click/option-click.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AddProductComponent } from '../add-product/add-product.component';
import { ConfirmacionModalComponent } from '../../modales/confirmacionModal/confirmacionModal.component';
import { ParameterService } from '../../services/Parametros/parameter.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  @Input() scodLab!: string;
  @ViewChild(OptionClickComponent) contextMenu!: OptionClickComponent;
  // -----------------

  rucProv: string;
  today: Date = new Date();
  creationDate: any;
  deliveryDate: any;
  valorAnterior: any;
  isGenerationOC: boolean = false;
  directionSelect: dataDirectionOC = {
    ssiscod: '',
    scodalm: '',
    facturarA: '',
    direccionEntrega: '',
    distrito: '',
    direccionCompleta: '',
  };
  condicionesPagoSelect: ICondicionesPagoResp;
  condicionesPaog: ICondicionesPagoResp[] = [];
  obs: string = "Generar Orden";
  nrOrderCompra: string = '';
  // parametros
  arrayDirections: dataDirectionOC[] = [];
  arrayParametros: any;
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
    private modalService: NgbModal,
    private parameterService: ParameterService,
  ) { }

  ngOnInit(): void {
    this.arrayMenuOrigen();
    this.getCondicionesPago();
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

  getCondicionesPago() {
    let dataRequest: ICondicionesPago = {
      codigoProveedor: this.scodPorv,
      codigoLaboratorio: this.scodLab,
      codigoProducto: '',
    };

    this.parameterService.getCondicionesPago(dataRequest).subscribe(response => {

      response.forEach((dataCondicionesPago: any) => {
        this.condicionesPaog.push({
          codCondicion: dataCondicionesPago.codCondicion,
          descripcion: dataCondicionesPago.descripcion
        });
      });

      this.condicionesPagoSelect = this.condicionesPaog[0];

    });

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

  //Direcciones
  async GetParametersAsync(array: Array<number>) {
    let modelRequest = { headerId: array };
    this.loading = true;
    await this.parameterService.getParametersList(modelRequest).toPromise().then((response) => {
      this.arrayParametros = response;
      this.loading = false;
    },
      (error: HttpErrorResponse) => {
        this.loading = false;
      });
  }

  async arrayMenuOrigen() {
    await this.GetParametersAsync([
      AppConstants.ParameterCode.DIRECCIONES_ENTREGA
    ]);

    this.arrayDirections = this.arrayParametros.filter((x: any) => x.tabCabId === AppConstants.ParameterCode.DIRECCIONES_ENTREGA)
      .map((x: any) => ({
        ssiscod: x.tabDet001,
        scodalm: x.tabDet002,
        facturarA: x.tabDet003,
        direccionEntrega: x.tabDet007,
        distrito: x.tabDet008,
        direccionCompleta: x.tabDet007 + x.tabDet008,
      }));
    this.directionSelect = this.arrayDirections[0]
  }

  // click derecho
  handleMenuAction(action: string) {
    switch (action) {
      case 'excel':
        this.exportExcel();
        break;
      case 'deleteProduct':
        this.deleteRow();
        break;
      case 'addProduct':
        this.addRow();
        break;
      case 'consider':
        this.consider();
        break;
      case 'noconsider':
        this.noConsider();
        break;
    }
  }

  addRow() {
    const modalAddProd = this.modalService.open(AddProductComponent, {
      windowClass: "modal-product",
      backdrop: false,
      scrollable: true
    });

    let codLab = 'x';
    modalAddProd.componentInstance.codProv = this.scodPorv;
    modalAddProd.componentInstance.codLab = codLab;

    modalAddProd.closed.subscribe((response: any) => {
      this.addNewProductoList(response);
    });
    this.calculateTotal();
  }

  addNewProductoList(dataProduct: any) {
    let dataProductExist = this.dataRows.filter(p => p.codProd == dataProduct.codigoProducto);

    if (dataProductExist.length > 0) {
      this.AlertToast("WARNING: Este Producto ya se encuentra agregado.", 'warning');
      return;
    }
    let dataRequest: IAdicionarProductoCalculoReq = { codProducto: dataProduct.codigoProducto }
    let newDate: PurchaseOrder_table_modal = {
      item: '',
      codProd: '',
      producto: '',
      codLab: '',
      laboratorio: '',
      EAN: '',
      cantE: '',
      cantF: '',
      boni: '',
      vvf1: '',
      vvf2: '',
      desct1: '',
      desct2: '',
      desct3: '',
      desct4: '',
      coscom: '',
      igv: '',
      igvpro: '',
      parcial: '',
      total: '',
      pro_mes: '',
      total_stock: '',
      Observacion: '',
      VVF_Temp: '',
      asociado: '',
      observacion_autoriza: '',
      usuario_autoriza: '',
      SecOrden: '',
      cantE_temp: '',
      cant_Unid_empa: '',
    };
    this.loading = true;
    this.orderCompraService.getAdicionarProductoCalculo(dataRequest).subscribe(response => {
      this.loading = false;


      if (response.codStatus == 1) {
        if (response.message != "OK") {
          this.AlertToast(response.message, 'warning');
        } else {
          if (response.detalleProductos != null && response.detalleProductos.length > 0) {

            newDate.item = (this.dataRows.length + 1).toString();
            newDate.codProd = response.detalleProductos[0].codProducto.toString();
            newDate.producto = response.detalleProductos[0].nombreProducto;
            newDate.codLab = response.detalleProductos[0].codLaboratorio;
            newDate.laboratorio = response.detalleProductos[0].nombreLaboratorio;
            newDate.EAN = '';
            newDate.cantE = response.detalleProductos[0].compraFinal;
            newDate.cantF = '0.00';
            newDate.boni = response.detalleProductos[0].bonificacion;
            newDate.vvf1 = response.detalleProductos[0].VVF1;
            newDate.vvf2 = response.detalleProductos[0].VVF2;
            newDate.desct1 = response.detalleProductos[0].descuento1;
            newDate.desct2 = response.detalleProductos[0].descuento2;
            newDate.desct3 = response.detalleProductos[0].descuento3;
            newDate.desct4 = response.detalleProductos[0].descuento4;
            newDate.coscom = response.detalleProductos[0].cosCom;
            newDate.igv = response.detalleProductos[0].igv;
            newDate.igvpro = response.detalleProductos[0].igvProducto;
            newDate.parcial = response.detalleProductos[0].parcial;
            newDate.total = response.detalleProductos[0].total;
            newDate.pro_mes = response.detalleProductos[0].promMes;
            newDate.total_stock = response.detalleProductos[0].total;
            newDate.Observacion = response.detalleProductos[0].observaciones;
            newDate.VVF_Temp = response.detalleProductos[0].VVF1;
            newDate.asociado = response.detalleProductos[0].asociado;
            newDate.observacion_autoriza = response.detalleProductos[0].ObservacionAutoriza;
            newDate.usuario_autoriza = response.detalleProductos[0].usuarioAutoriza;
            newDate.SecOrden = this.dataRows[0].coscom;
            newDate.cantE_temp = response.detalleProductos[0].compraFinal;
            newDate.cant_Unid_empa = response.detalleProductos[0].unidadEmpaque;
          }

          this.dataRows.push(newDate);
        }
      } else {
        this.AlertToast(response.message, 'warning');
      }
    });

    this.calculateTotal();
  }

  deleteRow() {
    if (this.isRowSelectedGOC == -1) {
      this.AlertToast("WARNING: Debe de seleccionar una fila.", 'warning');
      return;
    }

    this.dataRows.splice(this.isRowSelectedGOC, 1);
    this.isRowSelectedGOC = -1;
    this.AlertToast("SUCCESS: Se elimino el producto.", 'success');
    this.calculateTotal();
  }

  openContextMenuGOC(event: MouseEvent, opcionMenu: number) {
    event.preventDefault();
    this.contextMenu.open(event.pageX, event.pageY, opcionMenu);
  }

  consider() {
    if (this.dataRows.length == 0) {
      this.AlertToast(`Warning: No hay productos seleccionados.`, 'warning');
      return;
    }

    if (this.isRowSelectedGOC == -1) {
      this.AlertToast(`Warning: No se selecciono un producto.`, 'warning');
      return;
    }

    let modalConfirm = this.modalService.open(ConfirmacionModalComponent, {
      windowClass: "modal-confirmacion",
      backdrop: true,
      scrollable: true
    });

    modalConfirm.componentInstance.message = '¿Desea considerar la Bonificación en el Costo de Compra del producto seleccionado?';

    modalConfirm.closed.subscribe((confirn: any) => {
      if (confirn) {

        this.calculateDesc(this.isRowSelectedGOC);;
        this.calculateTotal();

      } else {
        this.dataRows[this.isRowSelectedGOC].cantE = this.valorAnterior;
        return;
      }

    });

  }

  noConsider() {
    if (this.dataRows.length == 0) {
      this.AlertToast(`Warning: No hay productos seleccionados.`, 'warning');
      return;
    }

    if (this.isRowSelectedGOC == -1) {
      this.AlertToast(`Warning: No se selecciono un producto.`, 'warning');
      return;
    }

    let modalConfirm = this.modalService.open(ConfirmacionModalComponent, {
      windowClass: "modal-confirmacion",
      backdrop: true,
      scrollable: true
    });

    modalConfirm.componentInstance.message = '¿Desea considerar la Bonificación en el Costo de Compra del producto seleccionado?';

    this.calculateDesc(this.isRowSelectedGOC);
    this.calculateTotal();
  }

  // ExportarExcel
  exportExcel() {
    if (this.dataRows.length == 0) {
      this.AlertToast("WARNING: La tabla Analisis de Compra no tiene información.", 'warning');
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
    console.log(this.valorAnterior);
  }
  calcularValoresInputGOC(nameColumn: string, index: number) {
    // valida que los valores no este vacio

    if (this.dataRows[index].cantE == null || this.dataRows[index].cantE == undefined) {
      this.dataRows[this.isRowSelectedGOC].cantE = this.valorAnterior;
    }

    if (
      this.dataRows[index].cantE == null || this.dataRows[index].cantE == undefined ||
      this.dataRows[index].boni == null || this.dataRows[index].boni == undefined ||
      this.dataRows[index].vvf2 == null || this.dataRows[index].vvf2 == undefined ||
      this.dataRows[index].desct1 == null || this.dataRows[index].desct1 == undefined ||
      this.dataRows[index].desct2 == null || this.dataRows[index].desct2 == undefined ||
      this.dataRows[index].desct3 == null || this.dataRows[index].desct3 == undefined ||
      this.dataRows[index].desct4 == null || this.dataRows[index].desct4 == undefined ||
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

      let dataRquest: IAdicionarProductoCalculo2Req = {
        codProveedor: '',
        codLab: '',
        codProducto: this.dataRows[this.isRowSelectedGOC].codProd,
        usuarioLogin: '',
        codUusario: '',
        flag: 2
      }

      this.orderCompraService.getAdicionarProductoCalculo2(dataRquest).subscribe(response => {

        let nProm_Ultimos3Meses: number = 0;
        let nCanMaxCompra: number = 0;

        if (response.codStatus == 1) {
          if (response.message == 'OK') {
            console.log(response.detalleProductos[0].prom_ult3Meses);
            nProm_Ultimos3Meses = Number(response.detalleProductos[0].prom_ult3Meses);

            nCanMaxCompra = (((Number(response.detalleProductos[0].promMes)) / (nProm_Ultimos3Meses / 3)) * 120) - ((Number(response.detalleProductos[0].total)) + Number(this.dataRows[this.isRowSelectedGOC].cantE)) + Number(this.dataRows[this.isRowSelectedGOC].cantE);

            if (nCanMaxCompra < 0) {
              this.AlertToast(`Warning: Cantidad máxima a comprar: ${response.detalleProductos[0].preCompra}.`, 'warning');
            } else {
              this.AlertToast(`Warning: Cantidad máxima a comprar: ${Math.round(nCanMaxCompra)}.`, 'warning');
            }


            let dataCFReq: ICompraFinalReq = {
              codPro: this.dataRows[this.isRowSelectedGOC].codProd,
              codLab: this.dataRows[this.isRowSelectedGOC].codLab,
              cant_Unid_Empa: (Number(this.dataRows[this.isRowSelectedGOC])) ? Number(this.dataRows[this.isRowSelectedGOC].cantE) : 1,
              pre_Compra: Number(this.dataRows[this.isRowSelectedGOC].cantE_temp),
              asociado: this.dataRows[this.isRowSelectedGOC].asociado,
            }
            this.loading = true;
            let nCompra_Final: number = 0;
            this.orderCompraService.getCompraFinal(dataCFReq).subscribe(responseCF => {
              this.loading = false;
              nCompra_Final = responseCF.Compra_Final;

              if (Number(this.dataRows[this.isRowSelectedGOC].pro_mes) == 0 && Number(response.detalleProductos[0].promMes) == 0) {

                let modalConfirm = this.modalService.open(ConfirmacionModalComponent, {
                  windowClass: "modal-confirmacion",
                  backdrop: true,
                  scrollable: true
                });

                modalConfirm.componentInstance.message = 'El producto no tiene Venta en los últimos 3 meses.';

                modalConfirm.closed.subscribe(confirn => {
                  if (confirn) {
                    let proIncentivo = '';
                    this.orderCompraService.getProductoIncentivo(this.dataRows[this.isRowSelectedGOC].codProd).subscribe(responseProIn => {
                      if (responseProIn.codStatus == 1) {
                        if (responseProIn.message = 'OK') {

                          proIncentivo = responseProIn.compro;
                          if (this.dataUsuario.codigoUsuario == 'VPAUCAR' && Number(proIncentivo) == 0) {
                            this.AlertToast(`Warning: Solo puede cambiar cantidades de Productos Preferidos.`, 'warning');

                            if (Number(this.dataRows[this.isRowSelectedGOC].cantE) != 0) {
                              this.calculateCompraFinal2();
                              this.calculateDesc(this.isRowSelectedGOC);
                              this.calculateTotal();

                            } else {
                              this.calculateCompraFinal2();
                              this.calculateDesc(this.isRowSelectedGOC);
                              this.calculateTotal();
                            }

                          } else {
                            return;
                          }

                        }
                      }
                    });

                  } else {
                    this.calculateDesc(this.isRowSelectedGOC);
                    this.calculateTotal();
                  }
                });

                if (((Number(response.detalleProductos[0].total) + Number(this.dataRows[this.isRowSelectedGOC].cantE)) / response.detalleProductos[0].prom_Mes * (nProm_Ultimos3Meses / 3)) > 120 && Number(this.dataRows[this.isRowSelectedGOC].cantE) > nCompra_Final) {
                  let modelConfirm4Mese = this.modalService.open(ConfirmacionModalComponent, {
                    windowClass: "modal-confirmacion",
                    backdrop: true,
                    scrollable: true
                  });
                  modelConfirm4Mese.componentInstance.message = 'La compra no puede ser mayor a 4 meses de inventario.';

                  modelConfirm4Mese.closed.subscribe((confirm: any) => {
                    let proIncentivo: string = '';
                    if (confirm) {
                      this.orderCompraService.getProductoIncentivo(this.dataRows[this.isRowSelectedGOC].codProd).subscribe(responseInc => {
                        if (responseInc.codStatus == 1) {
                          if (responseInc.message = 'OK') {
                            proIncentivo = responseInc.compro;
                            if (this.dataUsuario.codigoUsuario == 'VPAUCAR' && Number(proIncentivo) == 0) {
                              this.AlertToast(`Warning: Solo puede cambiar cantidades de Productos Preferidos.`, 'warning');

                              if (Number(this.dataRows[this.isRowSelectedGOC].cantE) != 0) {
                                this.calculateCompraFinal2();
                                this.calculateDesc(this.isRowSelectedGOC);
                                this.calculateTotal();

                              } else {
                                this.calculateCompraFinal2();
                                this.calculateDesc(this.isRowSelectedGOC);
                                this.calculateTotal();
                              }

                            } else {
                              return;
                            }
                          }
                        }
                      });
                    } else {

                    }
                  });

                } else {
                  let proIncentivo: string = '';
                  this.orderCompraService.getProductoIncentivo(this.dataRows[this.isRowSelectedGOC].codProd).subscribe(responseProIn => {
                    if (responseProIn.codStatus == 1) {
                      if (responseProIn.message = 'OK') {

                        proIncentivo = responseProIn.compro;
                        if (this.dataUsuario.codigoUsuario == 'VPAUCAR' && Number(proIncentivo) == 0) {
                          this.AlertToast(`Warning: Solo puede cambiar cantidades de Productos Preferidos.`, 'warning');

                          if (Number(this.dataRows[this.isRowSelectedGOC].cantE) != 0) {
                            this.calculateCompraFinal2();
                            this.calculateDesc(this.isRowSelectedGOC);
                            this.calculateTotal();

                          } else {
                            this.calculateCompraFinal2();
                            this.calculateDesc(this.isRowSelectedGOC);
                            this.calculateTotal();
                          }

                        } else {
                          return;
                        }

                      }
                    }
                  });
                }

              }

            });

          } else {
            this.calculateCompraFinal2();
            this.calculateDesc(this.isRowSelectedGOC);
            this.calculateTotal();
          }
        }

      });

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

  calculateCompraFinal2() {
    let dataRequest: ICompraFinalReq = {
      codPro: this.dataRows[this.isRowSelectedGOC].codProd,
      codLab: this.dataRows[this.isRowSelectedGOC].codLab,
      cant_Unid_Empa: Number(this.dataRows[this.isRowSelectedGOC].cant_Unid_empa),
      pre_Compra: Number(this.dataRows[this.isRowSelectedGOC].cantE),
      asociado: this.dataRows[this.isRowSelectedGOC].asociado,
    }

    let nCompra_Final: number = 0;
    this.orderCompraService.getCompraFinal(dataRequest).subscribe(response => {
      nCompra_Final = response.Compra_Final;

      this.dataRows[this.isRowSelectedGOC].cantE = nCompra_Final.toString();
      if (this.dataRows[this.isRowSelectedGOC].asociado.length == 5 && this.dataRows[this.isRowSelectedGOC].asociado != this.dataRows[this.isRowSelectedGOC].codProd) {

        this.dataRows.forEach(dataRow => {
          if (dataRow.codProd == this.dataRows[this.isRowSelectedGOC].asociado) {
            dataRow.asociado = this.dataRows[this.isRowSelectedGOC].codProd;
            dataRow.cantE = nCompra_Final.toString();
          }
        });

      } else {
        if (this.dataRows[this.isRowSelectedGOC].asociado.length > 5 && this.dataRows[this.isRowSelectedGOC].asociado != this.dataRows[this.isRowSelectedGOC].codProd) {

          this.dataRows.forEach(dataRow => {
            if (dataRow.codProd == this.dataRows[this.isRowSelectedGOC].asociado) {
              dataRequest.asociado = this.dataRows[this.isRowSelectedGOC].codProd;
              dataRow.cantE = nCompra_Final.toString();
            }
            if (dataRow.codProd == this.dataRows[this.isRowSelectedGOC].asociado.substring(6, 11) && dataRow.asociado == this.dataRows[this.isRowSelectedGOC].codProd) {
              dataRow.cantE = nCompra_Final.toString();
            }
          });

        }
      }

    });
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
    let todayFormat = this.today.getDate() + '-' + (this.today.getMonth() + 1) + '-' + this.today.getFullYear();

    setTimeout(() => {
      this.loading = false;
      this.orderCompraService.getCuerpoCorreo().subscribe(response => {

        let massageAsunto = response.CorreoAsunto.replace('{1}', todayFormat);
        massageAsunto = massageAsunto.replace('{0}', this.nrOrderCompra);
        let massageFooter = 'Gracias por su gentil atención.' + "\n\n" + "Atentamente" + "\n" + this.dataUsuario.NombreUsuario;
        let massageBody = response.CorreoMensaje1 + "\n\n" + response.CorreoMensaje2 + "\n" + response.CorreoMensaje3 + "\n" + response.CorreoMensaje4 + "\n" + response.CorreoMensaje5 + "\n\n" + massageFooter
        massageBody = massageBody.replace(/<br\s*\/?>/gi, "").trim();

      let body: AgentOutlook = {
        subject: massageAsunto,
        body: massageBody,
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
