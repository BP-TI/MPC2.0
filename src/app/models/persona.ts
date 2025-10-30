import { BaseModel } from "../shared/models/base.model";

export class Cliente {
    Nombres: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    NumeroDocumento: string;
    TipoDocumento: string;
    NumeroSolicitud: string;
    TipoDocumentoString: string;
    WFInstance: string;
    CodigoPolica: string;
    MiddleName: string;
    userCreation: string;
    offersearchdate: string;
}

export class UserPasswordModel extends BaseModel {
    userId: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export class UserDataLogin {
    NombreUsuario: string;
    cargoUsuario: string;
    codigo: string;
    codigoGrupo: string;
    codigoUsuario: string;
    message: string;
    permisos: string;
    siscod: string;
    usuario: string;
}