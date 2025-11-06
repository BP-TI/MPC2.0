export class ReporteProductosCompra {
    id:string;
    producto:string;
    stock:string;
    precio:number;
}

export interface IUltimasComprasReq {
    codProveedor:string;    
    codLab:string;    
    codProducto:string;    
    usuarioLogin:string;    
    codUsuario:Number;    
}
export interface IUltimasComprasAbadiReq {
    codProveedor:string;    
    codLab:string;    
    codProducto:string;    
    usuarioLogin:string;   
    codigoAlmacen:string; 
    codUsuario:Number;    
}
export interface IAdicionarProductosReq{
    codProveedor:string;
    codLab:string;
}