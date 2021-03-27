import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackunlockComponent } from './snackunlock.component';

describe('SnackunlockComponent', () => {
  let component: SnackunlockComponent;
  let fixture: ComponentFixture<SnackunlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackunlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackunlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
