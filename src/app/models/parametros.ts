export class Laboratorios {
    codigoLab: string;
    descripcion: string;
    selected: boolean = false;
  
}
export class Proveedores {
    codigoProveedor: string;
    descripcion: string;    
}

export class Politicas{
    ABC:string;
    puntoVenta:number;
    MaxAlmacen:number;
    Total:number;
}
export class Boticas{
    codAlmacen: String
    descripcionAlmacen: String
    selected: boolean =false;
}

export class Condiciones {
    codigoCondicion: string;
    descripcion: string;
}

export class Substitutes {
    codigoProveedor:string;
    codigoLaboratorio:string;
    codigoProducto:string;
}

