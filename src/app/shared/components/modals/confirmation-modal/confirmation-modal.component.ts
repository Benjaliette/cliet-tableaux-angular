import { Component, EventEmitter, Output, signal, input } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  title = input<string>('Êtes-vous sûr ?');
  message = input<string>('Cette action est irréversible.');

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  isOpen = signal(false);

  public open(): void {
    this.isOpen.set(true);
  }

  confirm(): void {
    this.isOpen.set(false);
    this.onConfirm.emit();
  }

  cancel(): void {
    this.isOpen.set(false);
    this.onCancel.emit();
  }
}

