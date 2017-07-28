import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomListComponent } from './chat-room-list.component';

describe('ChatRoomListComponent', () => {
  let component: ChatRoomListComponent;
  let fixture: ComponentFixture<ChatRoomListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatRoomListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
