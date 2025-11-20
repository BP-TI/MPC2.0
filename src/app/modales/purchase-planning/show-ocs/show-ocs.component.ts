import { Component, ElementRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-show-ocs',
  standalone: false,
  templateUrl: './show-ocs.component.html',
  styleUrl: './show-ocs.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ShowOCsComponent implements OnInit {

  loading: boolean = false;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  constructor(
    private activeModal: NgbActiveModal,
    public global: GlobalService,
    private el: ElementRef,
  ) {

  }

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

  ngOnInit(): void {

  }

  closeModal() {
    this.activeModal.close();
  }

}
