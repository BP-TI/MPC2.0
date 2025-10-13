import { Component, OnInit } from '@angular/core';
import { AppConstants } from '../../shared/constants/app.constants';
import Chart from 'chart.js/auto';



declare const hideMessage: any;
declare const showMessage: any;
@Component({
  selector: 'app-Home',
  standalone:false,
  templateUrl: './Home.component.html',
  styleUrls: ['./Home.component.css']
})
export class HomeComponent implements OnInit {

  title:string = "";
  agencyCode: string = sessionStorage.getItem(AppConstants.Session.AGENCYCODE) ?? "";
  agencyName: string = sessionStorage.getItem(AppConstants.Session.AGENCYNAME) ?? "";
  usersessionId: string = sessionStorage.getItem(AppConstants.Session.USERID) ?? "";
  channelName: string = sessionStorage.getItem(AppConstants.Session.SALES_CHANNEL_DESCRIPTION) ?? "";
  loading= false;
  constructor() { }

  ngOnInit() {
    this.loadScript('assets/js/demo/chart-area-demo.js');
    
    this.loadScript('assets/js/demo/chart-pie-demo.js');
    
  }

  private loadScript(scriptUrl: string) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);
  
  }
  showMessage() {
  
  }

  hideMessage() {
  }

}
