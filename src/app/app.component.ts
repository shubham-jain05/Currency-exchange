import { Component, DoCheck } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements DoCheck {


  navLinks = [
    {
      label: 'Currency Converter',
      path: 'currencyConverter',
      isActive: true
    },
    {
      label: 'View Conversion History',
      path: 'viewConversionHistory',
      isAvtive: false
    }
  ];

  ngDoCheck(): void {
    this.setActiveUrl();
  }

  onTabChange(index: number) {
    this.navLinks = this.navLinks.map(function (item, i) {
      item.isActive = index == i;
      return item;
    });
  }

  setActiveUrl() {
    const href = window.location.href;
    this.navLinks = this.navLinks.map(function (item, i) {
      item.isActive = href?.search(item?.path) > -1;
      return item;
    });
  }
}
