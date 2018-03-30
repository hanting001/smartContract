import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AlertModule, ButtonsModule, ProgressbarModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { zhCnLocale } from 'ngx-bootstrap/locale';
defineLocale('zh-cn', zhCnLocale);
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AsyncLocalStorageModule } from 'angular-async-local-storage';

import { Web3Service, FlightDelayService, LoadingService, LocalOrderService } from './service/index';

import { DelayRatePipe } from './shared/pipes';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { AdminComponent } from './admin/admin.component';
import { LoadingModule } from 'ngx-loading';
import { OrderComponent } from './order/order.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { FaqComponent } from './faq/faq.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        ExchangeComponent,
        AdminComponent,
        OrderComponent,
        AboutUsComponent,
        FaqComponent,
        DelayRatePipe
    ],
    imports: [
        BrowserModule,
        CommonModule,
        AppRoutingModule,
        HttpClientModule,
        BsDatepickerModule.forRoot(),
        ScrollToModule.forRoot(),
        ModalModule.forRoot(),
        AlertModule.forRoot(),
        ButtonsModule.forRoot(),
        ProgressbarModule.forRoot(),
        FormsModule,
        LoadingModule,
        AsyncLocalStorageModule,
        ReactiveFormsModule
    ],
    providers: [Web3Service, FlightDelayService, LoadingService, LocalOrderService],
    bootstrap: [AppComponent]
})
export class AppModule { }
