import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AddHeaderTableReq, GetHeaderTableReq, Parameter } from '../../models/parametros';
import { ICondicionesPago } from '../../models/ordenCompra';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {

  constructor(private httpClient: HttpClient) { }

  private POST_ENDPOINT: string = 'Parameter';
  private BASE_URL: string = HelperService.buildRequestURL(environment.apiUrl);
  private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;

  getParametersList(request: any): Observable<Parameter[]> {
    return this.httpClient.post<Parameter[]>(`${this.REQUEST_URL}/GetParametros`, request);
  }

  getCondicionesPago(reques: ICondicionesPago) {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetCondicionesPago`, reques);
  }

  postAddHeaderTable(reques: AddHeaderTableReq) {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/AddHeaderTable`, reques);
  }

  getheaderTable(reques: GetHeaderTableReq) {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetHeaderTable`, reques);
  }

}
