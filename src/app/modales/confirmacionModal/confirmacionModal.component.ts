import { Component, ElementRef, HostListener, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchasePlanningService } from '../../services/PurchasePlanning/purchasePlanning.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-confirmacionModal',
  standalone: false,
  templateUrl: './confirmacionModal.component.html',
  styleUrls: ['./confirmacionModal.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmacionModalComponent implements OnInit {

  @Input() message: string;

  loading: boolean = false;

  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(private activeModal: NgbActiveModal,
    private el: ElementRef,) { }

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

  // -----

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close(false);
  }

  confirmModal() {
    this.activeModal.close(true);
  }


}
