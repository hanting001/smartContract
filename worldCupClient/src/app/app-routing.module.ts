import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FifaHomeComponent } from './fifa/home/home.component';
import { FifaAdminComponent } from './fifa/admin/admin.component';
import { CourtComponent } from './fifa/court/court.component';
import { OrderComponent } from './fifa/order/order.component';
import { ExchangeComponent } from './fifa/exchange/exchange.component';
import { TransComponent } from './fifa/trans/trans.component';

import { BalanceResolver, BalanceWithAccountResolver } from './shared/resolver';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: FifaHomeComponent },
    { path: 'fifa/court', component: CourtComponent },
    { path: 'fifa/order', component: OrderComponent },
    { path: 'fifa/admin', component: FifaAdminComponent },
    { path: 'exchange', component: ExchangeComponent },
    { path: 'trans', component: TransComponent },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
    // imports: [FormsModule, RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    imports: [CommonModule, FormsModule, RouterModule.forRoot(routes)],
    providers: [BalanceResolver, BalanceWithAccountResolver],
    exports: [RouterModule]
})
export class AppRoutingModule { }
