import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'rxjs/add/operator/map';

import { BsModalService } from 'ngx-bootstrap/modal';

import { ChatRoomListService } from './chat-room-list.service';
import { ChatRoomDto } from '../dtos/chat-room.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { ChatRoomCreateComponent } from '../chat-room-create/chat-room-create.component';

@Component({
  selector: 'app-chat-room-list',
  templateUrl: './chat-room-list.component.html',
  styleUrls: ['./chat-room-list.component.css']
})
export class ChatRoomListComponent implements OnInit {

  keyword: string;

  roomList: ChatRoomDto[];

  pagination: PaginationDto;

  currentPage: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatRoomListService: ChatRoomListService,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.route.params
      .map(params => +params['page'] || 1)
      .subscribe(page => {
        this.chatRoomListService.getList(this.keyword, page)
          .subscribe(data => {
            this.roomList = data.chatRoomList;
            this.pagination = data.pagination;
          });
      });
  }

  /**
   * 根据关键词进行检索
   */
  search() {
    const page = this.currentPage || 1;
    const params = this.keyword ? { keyword: this.keyword, page } : { page };
    this.router.navigate(['../rooms', params]);
    // 请空当前页，这样的话，每次点检索还是从第一页开始
    this.currentPage = 0;
  }

  /**
   * 翻页
   * @param {any} page 页码
   */
  onPageChanged({ page }) {
    this.currentPage = page;
    // 把关键词输入框还原成和路由参数一致的状态
    this.keyword = this.route.snapshot.params['keyword'];
    this.search();
  }

  /**
   * 创建房间
   */
  create() {
    this.modalService.show(ChatRoomCreateComponent,
      {
        backdrop: 'static',
        animated: 'inmodal'
      });
  }
}
