import { Injectable } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraAbadiService {

  constructor(private httpClient: HttpClient) { }

  private POST_ENDPOINT: string = 'OrdenCompraAbadi';
  private BASE_URL: string = HelperService.buildRequestURL(environment.apiUrl);
  private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;


  getCalularCompra(proveedor: string, laboratorios: string,producto: string="", usuario: string, almacenes:string): Observable<any> {
    var request = {
      codProveedor: proveedor,
      codLab: laboratorios,
      codigoAlmacen: almacenes,
      usuarioLogin: usuario
    };
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetCalculoCompra`, request);
  }


}
