import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Laboratorios, Politicas, Proveedores } from '../../models/parametros';
import { LabelItem } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class PurchasePlanningService {

  constructor(private httpClient: HttpClient) { }
  
  private POST_ENDPOINT: string = 'Parameter';
    private BASE_URL: string = HelperService.buildRequestURL(environment.apiUrl);
    private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;

    getProveedores():Observable<Proveedores[]>{
      return this.httpClient.get<Proveedores[]>(`${this.REQUEST_URL}/GetProveedores`);
    }
  
    getLaboratorios(proveedor: string, funcionalidad:string = "" ): Observable<Laboratorios[]> {
      var request = {
        proveedor:proveedor,
        funcionalidad:funcionalidad
      };
      return this.httpClient.post<Laboratorios[]>(`${this.REQUEST_URL}/GetLaboratorios`, request);
    }

    getPoliticas():Observable<Politicas[]>{
      return this.httpClient.get<Politicas[]>(`${this.REQUEST_URL}/GetPoliticas`);
    }
}
