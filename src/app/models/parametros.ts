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

export class Parameter {
    tabDetId: number;
    tabCabId: number;
    estado: boolean;
    tabDet001: string;
    tabDet002: string;
    tabDet003: string;
    tabDet004?: number;
    tabDet005?: number;
    tabDet006?: number;
    tabDet007: string;
    tabDet008: string;
    tabDet009: string;

}
