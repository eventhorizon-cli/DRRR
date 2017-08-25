import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {

  @Input() currentUsers: number;

  @Input() maxUsers: number;

  status: string[];

  width: string;

  constructor() {
  }

  ngOnInit() {
    // 按成员人数占总人数比例显示不同的颜色,共5种颜色
    const classList = ['', 'success', 'info', 'warning', 'danger'];
    const level = classList[Math.floor(this.currentUsers / this.maxUsers * 4)];
    this.status = level && [`progress-bar-${level}`];
    this.width = `${this.currentUsers / this.maxUsers * 100}%`;
  }

}
