import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alertToast',
  standalone: false,
  templateUrl: './alertToast.component.html',
  styleUrls: ['./alertToast.component.css']
})
export class AlertToastComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error2' | 'info' | 'warning' = 'info';
  @Input() duration: number = 3000;

  isVisible: boolean = false;

  constructor() { }

  ngOnInit() {
    this.showToast();
  }

  showToast() {
    this.isVisible = true;
    setTimeout(() => {
      this.isVisible = false;
    }, this.duration);
  }

}
