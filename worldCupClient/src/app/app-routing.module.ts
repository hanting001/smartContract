import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FifaHomeComponent } from './fifa/home/home.component';
import { FifaAdminComponent } from './fifa/admin/admin.component';

import { BalanceResolver, BalanceWithAccountResolver } from './shared/resolver';

const routes: Routes = [
    { path: '', redirectTo: 'fifa', pathMatch: 'full' },
    { path: 'fifa', component: FifaHomeComponent },
    { path: 'fifa/admin', component: FifaAdminComponent },

];

@NgModule({
    // imports: [FormsModule, RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    imports: [CommonModule, FormsModule, RouterModule.forRoot(routes)],
    providers: [BalanceResolver, BalanceWithAccountResolver],
    exports: [RouterModule]
})
export class AppRoutingModule { }