import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from './helper.service';
import { environment } from '../../../environments/environment';
import { AgentOutlook } from '../models/agentOutlook';

@Injectable({
  providedIn: 'root'
})
export class AlertMail {
  constructor(private httpClient: HttpClient) { }

  private POST_ENDPOINT: string = 'compose';
  private BASE_URL: string = HelperService.buildRequestURL(environment.apiAgentOutlook);
  private REQUEST_URL: string = `${this.BASE_URL}/${this.POST_ENDPOINT}`;



  openMail(request: AgentOutlook): Observable<any[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-LOCAL-SECRET': 'mi_super_secreto_local_123'
    });
    return this.httpClient.post<any[]>(`${this.REQUEST_URL}`, request, { headers });

  }

}
