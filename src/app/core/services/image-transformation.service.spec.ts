import { TestBed } from '@angular/core/testing';

import { ImageTransformationService } from './image-transformation.service';

describe('ImageTransformationService', () => {
  let service: ImageTransformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageTransformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
