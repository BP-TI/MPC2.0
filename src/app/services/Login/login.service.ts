import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HelperService } from '../../shared/services/helper.service';
import { Observable } from 'rxjs';
import { Usuario } from '../../shared/models/Usuario';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) 
  {
  }

  private POST_ENDPOINT: string = 'Login';
  private BASE_URL: string = HelperService.buildRequestURL(environment.apiUrl);
  private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;

  getUserLogin(usuario: string, password:string ): Observable<Usuario> {
    var request = {
      userName:usuario,
      password:password
    };
    return this.httpClient.post<Usuario>(`${this.REQUEST_URL}/GetUserLogin`, request);
  }

}
