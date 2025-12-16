import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() text: string = 'Cliquez-moi';
  @Input() customClass: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;

  @Output() btnClick = new EventEmitter<void>();

  constructor() {}

  onClick(): void {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
