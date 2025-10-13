export class Usuario {
    usuario:string;
    codigoUsuario:string;
    codigoGrupo:string;
    siscod:string;
    NombreUsuario:string;
    cargoUsuario:string;
    codigo:number;
    message:string;
    permisos:permisos[];
}

export class permisos{
    key:string;
    value:string;
}
