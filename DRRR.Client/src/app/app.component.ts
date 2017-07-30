import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  /**
   * 选中菜单选项以滑动方式隐藏菜单
   * @param {string} expanded 表示菜单是否属于展开状态
   * @param {HTMLInputElement} el 触发菜单展开和关闭的按钮
   */
  slideUp(expanded: string, el: HTMLInputElement) {
    if (expanded === 'true') {
      el.click();
    }
  }
}
