export interface currency {
  from: string;
  to: string;
  date: string;
  rate: number;
  amount: number;
}
export class AddcurrencyHistory {
  static readonly type = '[Curr] Add';
  constructor(public payload: currency) { }
}