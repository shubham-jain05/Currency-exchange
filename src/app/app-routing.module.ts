import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversionHistoryComponent } from './conversion-history/conversion-history.component';
import { CurrencyConverterComponent } from './currency-converter/currency-converter.component';

const routes: Routes = [
  {
    path: 'currencyConverter',
    component: CurrencyConverterComponent
  },
  {
    path: 'viewConversionHistory',
    component: ConversionHistoryComponent
  },
  { path: '**', redirectTo: '/currencyConverter', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
