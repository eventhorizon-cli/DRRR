import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

import { SiteInfoService } from '../../core/services/site-info.service';
import { SiteStatusDto } from '../../core/dtos/site-status.dto';

@Component({
  selector: 'app-site-state',
  templateUrl: './site-state.component.html',
  styleUrls: ['./site-state.component.css']
})
export class SiteStateComponent implements OnInit, OnDestroy {

  currentTime: Date;

  siteStatus: Subject<SiteStatusDto>;

  private intervalSubscription: Subscription;

  constructor(
    private siteInfoService: SiteInfoService
  ) {
    this.currentTime = new Date();
    this.siteStatus = this.siteInfoService.siteStatus;
  }

  ngOnInit() {
    this.intervalSubscription = IntervalObservable.create(1000)
      .subscribe(() => this.currentTime = new Date());
    this.siteInfoService.refreshSiteStatus();
  }

  ngOnDestroy () {
    this.intervalSubscription.unsubscribe();
  }
}
