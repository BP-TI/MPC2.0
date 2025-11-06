import { Injectable } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAdicionarProductosReq, IUltimasComprasReq } from '../../models/ordenCompra';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {

  constructor(private httpClient: HttpClient) { }

  private POST_ENDPOINT: string = 'OrdenCompra';
  private BASE_URL: string = HelperService.buildRequestURL(environment.apiUrl);
  private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;


  getCalularCompra(proveedor: string, laboratorios: string, usuario: string): Observable<any> {
    var request = {
      codProveedor: proveedor,
      codLab: laboratorios,
      usuarioLogin: usuario
    };
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetCalculoCompra`, request);
  }

  getUltimasCompras(request: IUltimasComprasReq): Observable<any> {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetUltimasCompras`, request);
  }

  getAdicionarProducto(request: IAdicionarProductosReq): Observable<any> {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/AdicionarProductos`, request);
  }



}
