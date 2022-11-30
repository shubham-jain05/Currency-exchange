import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import * as  _ from "lodash";

export interface PeriodicElement {
  date: string;
  event: string;
  action: any;
}

@Component({
  selector: 'app-conversion-history',
  templateUrl: './conversion-history.component.html',
  styleUrls: ['./conversion-history.component.css']
})
export class ConversionHistoryComponent implements OnInit, AfterViewInit {
  hoverRow = 1;
  displayedColumns: string[] = ['date', 'event', 'action'];
  ELEMENT_DATA: PeriodicElement[] = [];
  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator: any;

  constructor(private store: Store, private router: Router) { }

  ngOnInit(): void {
    let state = this.store.select(state => state.users.users);
    state.subscribe(res => {
      if (res?.length > 0) {
        this.ELEMENT_DATA = res?.map((item: any) => {
          return { date: item?.date, event: `Converted an amount of ${item?.amount} from ${item?.from} to ${item?.to}`, action: item }
        });
        this.ELEMENT_DATA = _.uniqWith(this.ELEMENT_DATA, _.isEqual);
        this.setItem('history', this.ELEMENT_DATA);
      } else {
        this.ELEMENT_DATA = this.getItem('history') || [];
        this.ELEMENT_DATA = _.uniqWith(this.ELEMENT_DATA, _.isEqual);
        this.setItem('history', this.ELEMENT_DATA);
      }
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  mouseEnter(event: any) {
    this.hoverRow = event?.target?.rowIndex;
  }

  onView(event: PeriodicElement) {
    this.router.navigate(['currencyConverter'], { state: event?.action });
  }

  onDelete(event: PeriodicElement, index: number) {
    this.ELEMENT_DATA.splice(index, 1);
    this.setItem('history', this.ELEMENT_DATA);
  }

  setItem(key: string, Data: any) {
    let data = JSON.stringify(Data);
    localStorage.setItem(key, data);
    this.dataSource = new MatTableDataSource<PeriodicElement>(Data);
  }

  getItem(key: string) {
    const data = localStorage.getItem(key) as string;
    return JSON.parse(data);
  }
}
