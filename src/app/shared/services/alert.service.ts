import { Injectable } from '@angular/core';
import { ToastaService, ToastOptions } from 'ngx-toasta';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastaService: ToastaService) { }

  public showMessage(title:string, message:string, severity:any, timeout = 7000) {
    var toastOptions: ToastOptions = {
      title: title,
      msg: message,
      showClose: true,
      timeout: timeout,
      theme: 'bootstrap'
    };
    if (severity == MessageSeverity.info)
      this.toastaService.info(toastOptions);
    else if (severity == MessageSeverity.default)
      this.toastaService.default(toastOptions);
    else if (severity == MessageSeverity.success)
      this.toastaService.success(toastOptions);
    else if (severity == MessageSeverity.error)
      this.toastaService.error(toastOptions);
    else if (severity == MessageSeverity.warning)
      this.toastaService.warning(toastOptions);
  }

  


}

 export enum MessageSeverity {
    default,
    info,
    success,
    error,
    warning
  }