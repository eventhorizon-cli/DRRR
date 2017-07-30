import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomMainComponent } from './chat-room-main.component';

describe('ChatRoomMainComponent', () => {
  let component: ChatRoomMainComponent;
  let fixture: ComponentFixture<ChatRoomMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatRoomMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
