import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from "lodash";
import * as moment from 'moment';
import { AddcurrencyHistory } from '../userState/user.action';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';

export interface countryElement {
  country: string;
  currency_code: string;
  code: string;
  emoji: string;
  unicode: string;
  image: string;
  dial_code: string;
}

export interface PeriodicElement {
  date: string;
  exchangeRate: number;
}

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.css']
})
export class CurrencyConverterComponent implements OnInit {
  currForm: FormGroup = {} as any;
  submitted = false;
  currCode: string[] = [];
  private stateData = {} as any;
  public isLoading = false;
  public isHistoryLoading = false;
  public queryRes = {} as any;

  public optionSelect = 'table';

  // -- Table var
  displayedColumns: string[] = ['date', 'exchangeRate'];
  displayedColumns2: string[] = ['state', 'data'];
  dataSource = [] as any;
  dataSource2 = [] as any;
  // -- Table Var

  //Chart variable
  title = 'Exchanger Rates';
  type = 'BarChart';
  data = [];
  columnNames = ['Date', 'Rates'];
  options = {
    legend: 'none',
    colors: ['#009688', '#94c720', '#c70d38']
  };
  width = 500;
  height = 500;
  // -- Chart var

  constructor(private formBuilder: FormBuilder,
    private http: HttpClient,
    private store: Store,
    private router: Router
  ) {
    this.stateData = this.router.getCurrentNavigation()?.extras?.state;
  }

  ngOnInit(): void {
    this.getCountryData();
    this.formInit();
  }

  formInit() {
    this.currForm = this.formBuilder.group({
      amount: [null, [Validators.required, Validators.maxLength(15)]],
      from: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      to: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    });

    if (!!this.stateData) {
      this.queryRes = { result: this.stateData?.rate };
      this.submitted = true;
      this.currForm?.controls['from']?.setValue(this.stateData?.from);
      this.currForm?.controls['to']?.setValue(this.stateData?.to);
      this.currForm?.controls['amount']?.setValue(this.stateData?.amount);
      let currDate = moment().format("YYYY-MM-DD");
      let subDate = moment().subtract(7, "days").format("YYYY-MM-DD");
      this.getConversionHistory(subDate, currDate);
    }
  }

  get formControls(): any {
    return this.currForm?.controls;
  }

  getCountryData() {
    this.http.get('../../assets/country.json').subscribe(
      (res: any) => {
        if (res?.success) {
          this.currCode = _.uniq(res?.data?.map((item: any) => item?.currency_code));
        }
      }
    );
  }

  getConversionRate(from: string, to: string, amount: number) {
    if (!!from && !!to) {
      this.isLoading = true;
      this.queryRes = null;
      this.http.get(`https://api.exchangerate.host/convert?from=${from}&to=${to}`).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res?.success) {
            this.queryRes = res;
            let date = moment(new Date).format('DD/MM/YYYY @ HH:MM')?.toString();
            this.store.dispatch(new AddcurrencyHistory({ from, to, date, rate: this.queryRes?.result, amount }));
            let currDate = moment().format("YYYY-MM-DD");
            let subDate = moment().subtract(7, "days").format("YYYY-MM-DD");
            this.getConversionHistory(subDate, currDate);
          }
        },
        (error: any) => {
          this.isLoading = false;
          console.error('conversion api issue ->', error);
        }
      );
    }
  }

  getConversionHistory(start_date: string, end_date: string) {
    if (!!start_date && !!end_date) {
      //due to lack of data set year 2020 insted of current year 
      start_date = start_date?.replace('2022', '2020');
      end_date = start_date?.replace('2022', '2020');
      // -- date change done 
      this.isHistoryLoading = true;
      this.http.get(`https://api.exchangerate.host/timeseries?start_date=${start_date}&end_date=${end_date}`).subscribe(
        (res: any) => {
          this.isHistoryLoading = false;
          if (Object.keys(res?.rates).length > 0 && !!this.currForm?.value?.from) {
            let histaryData = [];
            let chartData = [] as any;
            let countData = [];
            let state = {} as any;
            const baseCur = this.currForm?.value?.from || 'USD';
            for (const cur in res?.rates) {
              histaryData.push({ date: cur, exchangeRate: res?.rates[cur][baseCur] });
              countData.push(res?.rates[cur][baseCur]);
              chartData.push([cur, Number(res?.rates[cur][baseCur])]);
            }

            this.data = chartData;
            state.high = Math.max(...countData)?.toFixed(4);
            state.low = Math.min(...countData)?.toFixed(4);
            state.median = this.median(countData)?.toFixed(4);
            this.dataSource2 = [{ data: state.high, state: 'Highest' }, { data: state.low, state: 'Lowest' }, { data: state.median, state: 'Average' }];
            this.dataSource = histaryData;
          }
        },
        (error: any) => {
          this.isHistoryLoading = false;
          console.error('history  api issue ->', error);
        }
      );
    }
  }

  numberOnly(event: any): boolean {
    this.submitted = false;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  alphaOnly(event: any) {
    this.submitted = false;
    const key = event.keyCode;
    return ((key >= 65 && key <= 90) || (key >= 95 && key <= 122));
  }

  median(arr: number[]) {
    const { length } = arr;
    arr.sort((a, b) => a - b);
    if (length % 2 === 0) {
      return (arr[length / 2 - 1] + arr[length / 2]) / 2;
    }
    return arr[(length - 1) / 2];
  }

  onChangeArrow() {
    this.submitted = false;
    if (!!this.formControls?.from?.value && !!this.formControls?.to?.value) {
      let from: string = this.formControls?.from?.value;
      let to: string = this.formControls?.to?.value;
      let temp = from;
      from = to;
      to = temp;
      this.currForm?.controls['from']?.patchValue(from);
      this.currForm?.controls['to']?.patchValue(to);
    }
  }

  checkCurr(event: any, key: string) {
    this.submitted = false;
    let value = event?.target?.value?.toUpperCase();
    if (!this.currCode.includes(value)) {
      this.currForm?.controls[key]?.setErrors({ 'incorrect': true });
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.currForm.invalid) {
      return;
    }
    this.getConversionRate(this.currForm?.value?.from?.toUpperCase(), this.currForm?.value?.to?.toUpperCase(), this.currForm?.value?.amount);
  }

  onDateChange(event: any) {
    let currDate = moment().format("YYYY-MM-DD");
    let subDate = moment().subtract(event?.target?.value, "days").format("YYYY-MM-DD");
    this.getConversionHistory(subDate, currDate);
  }

  onRadioChange(event: any) {
    this.optionSelect = event?.value;
  }

}
