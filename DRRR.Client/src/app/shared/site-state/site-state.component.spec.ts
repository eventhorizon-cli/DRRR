import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteStateComponent } from './site-state.component';

describe('SiteStateComponent', () => {
  let component: SiteStateComponent;
  let fixture: ComponentFixture<SiteStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
