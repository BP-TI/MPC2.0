export interface IUltimasComprasReq {
    codProveedor: string;
    codLab: string;
    codProducto: string;
    usuarioLogin: string;
    codUsuario: Number;
}

export interface IUltimasComprasAbadiReq {
    codProveedor: string;
    codLab: string;
    codProducto: string;
    usuarioLogin: string;
    codigoAlmacen: string;
    codUsuario: Number;
}

export interface IAdicionarProductosReq {
    codProveedor: string;
    codLab: string;
}

export interface ICompraFinalReq {
    codPro: string,
    codLab: string,
    cant_Unid_Empa: Number,
    pre_Compra: Number,
    asociado: string,
}

export interface IAdicionarProductoCalculoReq {
    codProducto: string;
}

export interface IGenerarOrdenCompra {
    secuencia: string,
    codAlmacen: string,
    sisCod: string,
    codProveedor: string,
    fecha: string,
    obs: string,
    username: string,
    fechaEntrega: string,
    direccion: string,
    detalleProducts: IDataPorduct[]
}

export interface IDataPorduct {
    item: string,
    codPro: string,
    producto: string,
    codLab: string,
    laboratorio: string,
    ean: string,
    cantE: string,
    cantF: string,
    boni: string,
    vvF1: string,
    vvF2: string,
    dscto1: string,
    dscto2: string,
    dscto3: string,
    dscto4: string,
    cosCom: string,
    igvpro: string,
    parcial: string,
    igv: string,
    total: string,
    prom_Mes: string,
    total_Stock: string,
    asociado: string,
    observacion: string,
    vvF_Temp: string,
    secOrden: string,
    observacion_autoriza: string,
    usuario_autoriza: string,
    cantE_Temp: string,
    cant_Unid_Empa: string
}

export interface IAdicionarProductoCalculo2Req {
    codProveedor: string;
    codLab: string;
    codProducto: string;
    usuarioLogin: string;
    codUusario: string;
    flag: number;
}

export interface IUPdateCondicionProduct {
    codProducto: string;
    codUsuario: number;
    codCondicion: string;
    asociado: string;
}

export interface IDetalleStockBotica {
    codpro: string,
    repo: number
}

export class ReporteProductosCompra {
    id: string;
    producto: string;
    stock: string;
    precio: number;
}

export class HeadTableAC {
    description: string;
    check: boolean;
}

export class PurchaseOrder {
    ABC: string;
    ObservacionAutoriza: string;
    VVF1: string;
    VVF2: string;
    almacen: string;
    asociado: string;
    bonificacion: string;
    botica: string;
    canje: string;
    clasificacion: string;
    cobOrgAct: string;
    cobOrgActCalcNoBotica: string;
    cobOrgActNoBotica: string;
    codLaboratorio: string;
    codProducto: string;
    compraFinal: string;
    condicion: string;
    cosCom: string;
    descuento1: string;
    descuento2: string;
    descuento3: string;
    descuento4: string;
    fracUnidad: string;
    igv: string;
    igvProducto: string;
    incentivo: string;
    logisticaInversa: string;
    maxBot: string;
    maxInfraStock: string;
    mesActual: string;
    mesActualProyeccion: string;
    mesCuarto: string;
    mesPrimero: string;
    mesQuinto: string;
    mesSegundo: string;
    mesTercero: string;
    nombreLaboratorio: string;
    nombreProducto: string;
    nroOC: string;
    observaciones: string;
    oc: string;
    ocVencido: string;
    ocVigente: string;
    org: string;
    orgNoBotica: string;
    parcial: string;
    plazoPago: string;
    preCompra: string;
    promMes: string;
    relacionado: string;
    secRelacion: string;
    total: string;
    totalNoBotica: string;
    totalParcial: string;
    unidadEmpaque: string;
    usuarioAutoriza: string;
    ventaSubDist: string;
    isNewRow: boolean;
}

export class PurchaseOrder_table_modal {
    item: string;
    codProd: string;
    producto: string;
    codLab: string;
    laboratorio: string;
    EAN: string;
    cantE: string;
    cantF: string;
    boni: string;
    vvf1: string;
    vvf2: string;
    desct1: string;
    desct2: string;
    desct3: string;
    desct4: string;
    coscom: string;
    igv: string;
    igvpro: string;
    parcial: string;
    total: string;
    pro_mes: string;
    total_stock: string;
    Observacion: string;
    VVF_Temp: string;
    asociado: string;
    observacion_autoriza: string;
    usuario_autoriza: string;
    SecOrden: string;
    cantE_temp: string;
    cant_Unid_empa: string;
}

export class bodyMail {
    CorreoAsunto: string;
    CorreoFormatoFin: string;
    CorreoMensaje1: string;
    CorreoMensaje2: string;
    CorreoMensaje3: string;
    CorreoMensaje4: string;
    CorreoMensaje5: string;
    CorreoRutaAdjuntar: string;
    Tipo: string;
    codStatus: string;
    message: string;
    observation: string;
}

