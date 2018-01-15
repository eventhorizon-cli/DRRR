import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import { FromEventObservable } from 'rxjs/observable/FromEventObservable';
import { Subscription } from 'rxjs/Subscription';

import { BsModalService } from 'ngx-bootstrap/modal';

import swal from 'sweetalert2';

import { ChatRoomListService } from './chat-room-list.service';
import { ChatRoomDto } from '../dtos/chat-room.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { ChatRoomCreateComponent } from '../chat-room-create/chat-room-create.component';
import { AuthService } from '../../core/services/auth.service';
import { Roles } from '../../core/models/roles.enum';
import { SystemMessagesService } from '../../core/services/system-messages.service';
import { SiteInfoService } from '../../core/services/site-info.service';

@Component({
  selector: 'app-chat-room-list',
  templateUrl: './chat-room-list.component.html',
  styleUrls: ['./chat-room-list.component.css']
})
export class ChatRoomListComponent implements OnInit, OnDestroy {

  keyword: string;

  roomList: ChatRoomDto[];

  pagination: PaginationDto;

  currentPage: number;

  private routeParams: Subscription;

  private keyup: Subscription;

  // 是否显示加载消息框
  private showLoading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatRoomListService: ChatRoomListService,
    private modalService: BsModalService,
    private auth: AuthService,
    private msg: SystemMessagesService,
    private siteInfoService: SiteInfoService
  ) {
    // 默认显示加载消息框
    this.showLoading = true;
  }

  ngOnInit() {
    this.routeParams = this.route.params
      .map(params => +params['page'] || 1)
      .subscribe(page => {
        this.refresh(page);
      });

    this.keyup = FromEventObservable
      .create<Event>(document.querySelector('[name=keyword]'), 'keyup')
      .debounceTime(250)
      .subscribe(() => {
        // 不显示加载消息框
        this.showLoading = false;
        this.search();
      });
  }

  ngOnDestroy() {
    this.routeParams.unsubscribe();
    this.keyup.unsubscribe();
  }

  /**
   * 根据关键词和页码进行检索
   */
  search() {
    const page = this.currentPage || 1;
    const params = this.keyword ? { keyword: this.keyword, page } : { page };
    this.router.navigate(['../rooms', params]);
    // 请空当前页，这样的话，每次检索还是从第一页开始
    this.currentPage = 0;
  }

  /**
   * 翻页
   * @param {number} page 页码
   */
  onPageChanged({ page }: {page: number}) {
    this.currentPage = page;
    // 把关键词输入框还原成和路由参数一致的状态
    this.keyword = this.route.snapshot.params['keyword'];
    this.search();
  }

  /**
   * 创建房间
   * @param {HTMLButtonElement} btnCreate 创建房间按钮
   */
  create(btnCreate: HTMLButtonElement) {
    const role = this.auth.getPayloadFromToken('access_token').role;

    if (role === Roles.guest) {
      this.msg.showConfirmMessage('question',
        this.msg.getMessage('I009'), {
          text: this.msg.getMessage('I010')
        }).then(result => {
          if (result.value) {
            this.router.navigate(['/register']);
          }
      });
      return;
    }

    btnCreate.disabled = true;
    this.chatRoomListService.applyForCreatingRoom()
      .subscribe(res => {
        btnCreate.disabled = false;
        if (res.error) {
          this.msg.showAutoCloseMessage('error', 'E000', res.error);
        } else {
          this.modalService.show(ChatRoomCreateComponent,
            {
              backdrop: 'static',
              animated: false,
              class: 'animated flipInY'
            });
        }
      });
  }

  /**
   * 刷新列表
   * @param {number} page 页码
   */
  refresh(page?: number) {
    // 刚进入房间时或者显示了无法进入已被删除的房间的错误时，不显示加载信息
    const showLoading = this.showLoading && !swal.isVisible();
    // 还原成默认
    this.showLoading = true;
    if (showLoading) {
      this.msg.showLoadingMessage('I005', '数据请求');
    }
    page = page || +this.route.snapshot.params['page'] || 1;
    this.chatRoomListService.getList(this.keyword, page)
      .subscribe(data => {
        this.roomList = data.chatRoomList;
        this.pagination = data.pagination;
        if (showLoading) {
          this.msg.closeLoadingMessage();
        }
      });
    this.siteInfoService.refreshSiteStatus();
  }

  /**
   * 进入房间失败
   */
  onFailedToJoinTheRoom() {
    // 刷新房间列表
    this.refresh();
  }
}
