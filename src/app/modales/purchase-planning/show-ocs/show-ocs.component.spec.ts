import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowOCsComponent } from './show-ocs.component';

describe('ShowOCsComponent', () => {
  let component: ShowOCsComponent;
  let fixture: ComponentFixture<ShowOCsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowOCsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowOCsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
