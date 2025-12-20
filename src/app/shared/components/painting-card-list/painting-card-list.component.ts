
import { Component, computed, EventEmitter, input, Output, Signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Painting } from '@app/shared/models/painting.model';
import { ConfirmationModalComponent } from '@shared/components/modals/confirmation-modal/confirmation-modal.component';

@Component({
  selector: '[app-painting-card-list]',
  imports: [RouterLink, ConfirmationModalComponent],
  templateUrl: './painting-card-list.component.html',
  styleUrl: './painting-card-list.component.scss'
})
export class PaintingCardListComponent {
  painting = input.required<Painting>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmationModalComponent) modal!: ConfirmationModalComponent;

  public readonly formattedDimensions: Signal<string> = computed(() => {
    const p = this.painting();

    if (p && p.dimensions && p.dimensions.width && p.dimensions.height) {
      return `${p.dimensions.width}x${p.dimensions.height} cm`;
    }

    return '';
  });

  onDeleteRequest(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.modal.open()
  }

  confirmDelete(): void {
    this.delete.emit(this.painting().id);
  }
}
