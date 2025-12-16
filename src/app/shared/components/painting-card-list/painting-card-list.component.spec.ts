import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintingCardListComponent } from './painting-card-list.component';

describe('PaintingCardListComponent', () => {
  let component: PaintingCardListComponent;
  let fixture: ComponentFixture<PaintingCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaintingCardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaintingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
