import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { SiteInfoService } from '../../core/services/site-info.service';
import { SiteStatusDto } from '../../core/dtos/site-status.dto';

@Component({
  selector: 'app-site-state',
  templateUrl: './site-state.component.html',
  styleUrls: ['./site-state.component.css']
})
export class SiteStateComponent implements OnInit {

  currentTime: Date = new Date();

  siteStatus: Subject<SiteStatusDto>;

  constructor(
    private siteInfoService: SiteInfoService
  ) {
    this.siteStatus = this.siteInfoService.siteStatus;
  }

  ngOnInit() {
    setInterval(
      () => this.currentTime = new Date()
      , 1000);
    this.siteInfoService.refreshSiteStatus();
  }

}
