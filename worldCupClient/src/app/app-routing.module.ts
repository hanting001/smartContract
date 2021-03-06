import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home/home.component';
import { FifaHomeComponent } from './fifa/home/home.component';
import { FifaAdminComponent } from './fifa/admin/admin.component';
import { ExchangeComponent } from './fifa/exchange/exchange.component';
import { TransComponent } from './fifa/trans/trans.component';
import { ContactComponent } from './fifa/contact/contact.component';
import { FaqComponent } from './fifa/faq/faq.component';
import { WinnerListComponent } from './winner-list/winner-list.component';
import { ChampionComponent } from './fifa/champion/champion.component';
import { BalanceResolver, BalanceWithAccountResolver } from './shared/resolver';

const routes: Routes = [
    { path: '', redirectTo: 'matches', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'matches', component: FifaHomeComponent },
    { path: 'champion/:index/limit/:limit', component: ChampionComponent },
    { path: 'matches/:initGame', component: FifaHomeComponent },
    { path: 'admin', component: FifaAdminComponent },
    { path: 'winners', component: WinnerListComponent },
    { path: 'exchange', component: ExchangeComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'faq', component: FaqComponent },
    { path: 'trans', component: TransComponent },
    { path: '**', redirectTo: 'matches', pathMatch: 'full' }
];

@NgModule({
    // imports: [FormsModule, RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    imports: [CommonModule, FormsModule, RouterModule.forRoot(routes)],
    providers: [BalanceResolver, BalanceWithAccountResolver],
    exports: [RouterModule]
})
export class AppRoutingModule { }
