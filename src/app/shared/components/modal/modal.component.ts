// src/app/shared/components/modal/modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() visible   = false;
  @Input() titulo    = 'Registro';
  @Input() guardando = false;
  @Output() cerrar  = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as Element).classList.contains('modal-overlay')) {
      this.cerrar.emit();
    }
  }
}