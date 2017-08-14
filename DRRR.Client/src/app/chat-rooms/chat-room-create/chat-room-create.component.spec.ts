import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomCreateComponent } from './chat-room-create.component';

describe('ChatRoomCreateComponent', () => {
  let component: ChatRoomCreateComponent;
  let fixture: ComponentFixture<ChatRoomCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatRoomCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
