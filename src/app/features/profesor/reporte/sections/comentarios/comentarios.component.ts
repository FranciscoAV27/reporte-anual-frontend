// src/app/features/profesor/sections/comentarios/comentarios.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent {
  @Input()  comentarios = '';
  @Output() comentariosChange = new EventEmitter<string>();

  colapsado = false;
  toggleSeccion(): void { this.colapsado = !this.colapsado; }
}