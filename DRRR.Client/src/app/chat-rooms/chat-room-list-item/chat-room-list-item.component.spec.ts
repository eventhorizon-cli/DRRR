import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomListItemComponent } from './chat-room-list-item.component';

describe('ChatRoomListItemComponent', () => {
  let component: ChatRoomListItemComponent;
  let fixture: ComponentFixture<ChatRoomListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatRoomListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
