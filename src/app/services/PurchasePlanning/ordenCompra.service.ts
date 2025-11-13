import { Injectable } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAdicionarProductoCalculoReq, IAdicionarProductosReq, ICompraFinalReq, IDetalleStockBotica, IUltimasComprasReq, IUPdateCondicionProduct } from '../../models/ordenCompra';

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

  getAdicionarProductoCalculo(request: IAdicionarProductoCalculoReq): Observable<any> {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/AdicionarProductoCalculo`, request);
  }

  getCompraFinal(request: ICompraFinalReq) {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetCompraFinal`, request);
  }

  getDetalleStockBotica(request: IDetalleStockBotica) {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetDetalleStockBotica`, request);
  }

  postUpdateCondicionProducto(request: IUPdateCondicionProduct) {
    return this.httpClient.post<any>(`${this.REQUEST_URL}/UpdateCondicionProducto`, request);
  }

  getClaveAutorizacion1(clave: string) {
    let request = {
      "clave": clave
    }
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetClaveAutorizacion1`, request);
  }

  getDescDescagregadorItem(codProd: string) {
    let request = {
      "codpro": codProd,
    }
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetDescDesagregadosItem`, request);
  }

  getRucProveedor(codProd: string) {
    let request = {
      "codprv": codProd,
    }
    return this.httpClient.post<any>(`${this.REQUEST_URL}/GetRucProveedor`, request);
  }

}
