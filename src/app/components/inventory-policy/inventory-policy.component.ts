import { Component, ElementRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-inventory-policy',
  standalone: false,
  templateUrl: './inventory-policy.component.html',
  styleUrl: './inventory-policy.component.css',
  encapsulation: ViewEncapsulation.None
})
export class InventoryPolicyComponent implements OnInit {

  loading: boolean = false;
  rowsLb: any[];
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private purchaseService: PurchasePlanningService,
    private el: ElementRef,
  ) { }

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    const dialog = this.el.nativeElement.closest('.modal-dialog');
    const rect = dialog.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const dialog = this.el.nativeElement.closest('.modal-dialog');

    const newLeft = event.clientX - this.offsetX;
    const newTop = event.clientY - this.offsetY;

    const maxLeft = window.innerWidth - dialog.offsetWidth;
    const maxTop = window.innerHeight - dialog.offsetHeight;

    const limitedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const limitedTop = Math.max(0, Math.min(newTop, maxTop));

    dialog.style.left = `${limitedLeft}px`;
    dialog.style.top = `${limitedTop}px`;

  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }
  /**/

  ngOnInit() {
    this.cargarPoliticas();
  }

  cargarPoliticas() {
    this.loading = true;
    this.purchaseService.getPoliticas().subscribe(
      (response) => {
        this.loading = false;
        this.rowsLb = response;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      }
    );
  }

  closeModal() {
    this.activeModal.dismiss();
  }

}
