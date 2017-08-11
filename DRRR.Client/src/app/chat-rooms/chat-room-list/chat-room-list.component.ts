import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { ChatRoomListService } from './chat-room-list.service';
import { ChatRoomDto } from '../dtos/chat-room.dto';

@Component({
  selector: 'app-chat-room-list',
  templateUrl: './chat-room-list.component.html',
  styleUrls: ['./chat-room-list.component.css']
})
export class ChatRoomListComponent implements OnInit {

  keyword: string;

  roomList: ChatRoomDto[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatRoomListService: ChatRoomListService
  ) {}

  ngOnInit() {
    this.route.params
      .subscribe((params: Params) => {
        this.keyword = params['keyword'];
        const page = +params['page'] || 1;
        this.chatRoomListService.getList(this.keyword, page)
          .subscribe(data => this.roomList = data.chatRoomList);
      });
  }

  /**
   * 根据关键词进行检索
   */
  search() {
    const params = this.keyword ? {keyword: this.keyword, page: 1} : {page: 1};
    this.router.navigate(['../rooms', params]);
  }
}
