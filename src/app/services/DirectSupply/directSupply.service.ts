import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../../shared/services/helper.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Laboratorios,Proveedores, Boticas} from '../../models/parametros';

@Injectable({
  providedIn: 'root'
})
export class DirectSupplyService {

  constructor(private httpClient: HttpClient) { }
  
  private POST_ENDPOINT: string = 'Parameter';
    private BASE_URL: string = HelperService.buildRequestURL(environment.apiUrl);
    private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;

    getProveedores():Observable<Proveedores[]>{
      return this.httpClient.get<Proveedores[]>(`${this.REQUEST_URL}/GetProveedoresAbadi`);
    }

    getLaboratorios(proveedor: string, funcionalidad:string = "" ): Observable<Laboratorios[]> {
      var request = {
        proveedor:proveedor,
        funcionalidad:funcionalidad
      };
      return this.httpClient.post<Laboratorios[]>(`${this.REQUEST_URL}/GetLaboratoriosAbadi`, request);
    }
    getBoticas(codigoProveedor:string, codigoLaboratorio: string): Observable<Boticas[]>{
      var request={
        codigoProveedor:codigoProveedor,
        codigoLaboratorio:codigoLaboratorio
      };
      return this.httpClient.post<Boticas[]>(`${this.REQUEST_URL}/GetBoticas`, request);

    }

}
