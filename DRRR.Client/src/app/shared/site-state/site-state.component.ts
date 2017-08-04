import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-site-state',
  templateUrl: './site-state.component.html',
  styleUrls: ['./site-state.component.css']
})
export class SiteStateComponent implements OnInit {

  currentTime: Date;

  constructor() { }

  ngOnInit() {
    setInterval(
      () => this.currentTime = new Date()
      , 1000);
  }

}
