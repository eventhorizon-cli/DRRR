import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AuthService } from './auth.service';
import { SiteStatusDto } from '../dtos/site-status.dto';

@Injectable()
export class SiteInfoService {

  /**
   * 网站状态
   */
  siteStatus: Subject<SiteStatusDto>;

  constructor(private auth: AuthService) {
    this.siteStatus = new Subject();
  }

  /**
   * 获取网站
   * @return {Observable<SiteStatusDto>}
   */
  refreshSiteStatus() {
    return this.auth.http
      .get<SiteStatusDto>('/api/site/status')
      .subscribe(status => this.siteStatus.next(status));
  }
}
