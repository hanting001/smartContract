import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home/home.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { AdminComponent } from './admin/admin.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { OrderComponent } from './order/order.component';
import { FaqComponent } from './faq/faq.component';
import { ClaimDetailComponent } from './claim-detail/claim-detail.component';

import { BalanceResolver, BalanceWithAccountResolver } from './shared/resolver';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'exchange', component: ExchangeComponent, resolve: { balance: BalanceResolver } },
    { path: 'myorder', component: OrderComponent },
    { path: 'aboutus', component: AboutUsComponent },
    { path: 'faq', component: FaqComponent },
    { path: 'claim/:sfIndex', component: ClaimDetailComponent },
    { path: 'admin/:account', component: AdminComponent, resolve: { balance: BalanceWithAccountResolver } },
    // { path: 'airDelay', canActivate: [AuthGuard], component: AirDelayComponent },
    // { path: 'buyToken', canActivate: [AuthGuard], component: BuyTokenComponent },
    // { path: 'airDelayDetail', canActivate: [AuthGuard], component: AirDelayDetailComponent },
    // { path: 'order', canActivate: [AuthGuard], component: OrderComponent },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
    // imports: [FormsModule, RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    imports: [CommonModule, FormsModule, RouterModule.forRoot(routes)],
    providers: [BalanceResolver, BalanceWithAccountResolver],
    exports: [RouterModule]
})
export class AppRoutingModule { }
