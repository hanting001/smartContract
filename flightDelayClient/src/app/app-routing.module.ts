import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home/home.component';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    // { path: 'login', component: LoginIndexComponent },
    // { path: 'main', canActivate: [AuthGuard], component: MainComponent },
    // { path: 'airDelay', canActivate: [AuthGuard], component: AirDelayComponent },
    // { path: 'buyToken', canActivate: [AuthGuard], component: BuyTokenComponent },
    // { path: 'airDelayDetail', canActivate: [AuthGuard], component: AirDelayDetailComponent },
    // { path: 'order', canActivate: [AuthGuard], component: OrderComponent },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
    // imports: [FormsModule, RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    imports: [CommonModule, FormsModule, RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
