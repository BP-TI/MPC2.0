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
    asociado:string,
}

export interface IUPdateCondicionProduct{
    codProducto: string;
    codUsuario: number;
    codCondicion: string;
    asociado: string;
}

export interface IDetalleStockBotica {
    codpro:string,
    repo: number
}

export interface IAdicionarProductoCalculoReq{
    codProducto: string;
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